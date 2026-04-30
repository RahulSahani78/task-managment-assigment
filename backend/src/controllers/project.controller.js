const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// GET /api/projects  -> projects where user is a member
const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ 'members.user': req.user._id })
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email')
    .sort('-createdAt');
  res.json({ success: true, data: projects });
});

// POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.create({
    name,
    description: description || '',
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: 'Admin' }],
  });
  await project.populate('createdBy', 'name email');
  await project.populate('members.user', 'name email');
  res.status(201).json({ success: true, data: project });
});

// GET /api/projects/:projectId
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.project._id)
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email');
  res.json({ success: true, data: project });
});

// PUT /api/projects/:projectId   (Admin)
const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (name !== undefined) req.project.name = name;
  if (description !== undefined) req.project.description = description;
  await req.project.save();
  await req.project.populate('createdBy', 'name email');
  await req.project.populate('members.user', 'name email');
  res.json({ success: true, data: req.project });
});

// DELETE /api/projects/:projectId  (Admin)
const deleteProject = asyncHandler(async (req, res) => {
  await Task.deleteMany({ project: req.project._id });
  await req.project.deleteOne();
  res.json({ success: true, message: 'Project deleted' });
});

// POST /api/projects/:projectId/members  (Admin)
const addMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Member email is required');
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error('No user with that email');
  }
  if (req.project.isMember(user._id)) {
    res.status(409);
    throw new Error('User is already a member');
  }
  req.project.members.push({
    user: user._id,
    role: role === 'Admin' ? 'Admin' : 'Member',
  });
  await req.project.save();
  await req.project.populate('members.user', 'name email');
  res.status(201).json({ success: true, data: req.project });
});

// DELETE /api/projects/:projectId/members/:userId  (Admin)
const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) {
    res.status(400);
    throw new Error('Invalid user id');
  }
  if (req.project.createdBy.toString() === userId) {
    res.status(400);
    throw new Error('Cannot remove the project creator');
  }
  const before = req.project.members.length;
  req.project.members = req.project.members.filter(
    (m) => m.user.toString() !== userId
  );
  if (req.project.members.length === before) {
    res.status(404);
    throw new Error('Member not found in this project');
  }
  await req.project.save();
  await Task.updateMany(
    { project: req.project._id, assignee: userId },
    { $set: { assignee: null } }
  );
  await req.project.populate('members.user', 'name email');
  res.json({ success: true, data: req.project });
});

// PATCH /api/projects/:projectId/members/:userId  (Admin) — change role
const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!['Admin', 'Member'].includes(role)) {
    res.status(400);
    throw new Error('Role must be Admin or Member');
  }
  const member = req.project.members.find((m) => m.user.toString() === userId);
  if (!member) {
    res.status(404);
    throw new Error('Member not found');
  }
  member.role = role;
  await req.project.save();
  await req.project.populate('members.user', 'name email');
  res.json({ success: true, data: req.project });
});

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
};
