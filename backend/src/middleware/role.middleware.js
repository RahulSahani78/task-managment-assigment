const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

const loadProject = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id || req.body.project;
  if (!projectId) {
    res.status(400);
    throw new Error('Project id is required');
  }
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  req.project = project;
  next();
});

const requireProjectMember = asyncHandler(async (req, res, next) => {
  if (!req.project) {
    res.status(500);
    throw new Error('Project must be loaded before role check');
  }
  if (!req.project.isMember(req.user._id)) {
    res.status(403);
    throw new Error('Forbidden: not a member of this project');
  }
  req.projectRole = req.project.getMemberRole(req.user._id);
  next();
});

const requireProjectAdmin = asyncHandler(async (req, res, next) => {
  if (!req.project) {
    res.status(500);
    throw new Error('Project must be loaded before role check');
  }
  if (!req.project.isAdmin(req.user._id)) {
    res.status(403);
    throw new Error('Forbidden: admin role required');
  }
  next();
});

module.exports = {
  loadProject,
  requireProjectMember,
  requireProjectAdmin,
};
