const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/dashboard
// Optional ?projectId=... narrows scope; default = all projects user belongs to.
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { projectId } = req.query;

  let projectIds;
  if (projectId) {
    if (!mongoose.isValidObjectId(projectId)) {
      res.status(400);
      throw new Error('Invalid project id');
    }
    const project = await Project.findById(projectId);
    if (!project || !project.isMember(userId)) {
      res.status(403);
      throw new Error('Forbidden');
    }
    projectIds = [project._id];
  } else {
    const projects = await Project.find({ 'members.user': userId }).select('_id');
    projectIds = projects.map((p) => p._id);
  }

  const baseMatch = { project: { $in: projectIds } };

  const [total, byStatus, byUser, overdue] = await Promise.all([
    Task.countDocuments(baseMatch),
    Task.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$assignee',
          count: { $sum: 1 },
          done: {
            $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          count: 1,
          done: 1,
          name: { $ifNull: ['$user.name', 'Unassigned'] },
          email: '$user.email',
        },
      },
      { $sort: { count: -1 } },
    ]),
    Task.countDocuments({
      ...baseMatch,
      status: { $ne: 'Done' },
      dueDate: { $ne: null, $lt: new Date() },
    }),
  ]);

  const statusMap = { 'To Do': 0, 'In Progress': 0, Done: 0 };
  byStatus.forEach((s) => {
    statusMap[s._id] = s.count;
  });

  res.json({
    success: true,
    data: {
      total,
      byStatus: statusMap,
      byUser,
      overdue,
      projectsCount: projectIds.length,
    },
  });
});

module.exports = { getDashboard };
