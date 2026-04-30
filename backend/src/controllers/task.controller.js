const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');

const populateTask = (q) =>
  q
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'name');

// GET /api/projects/:projectId/tasks
const listProjectTasks = asyncHandler(async (req, res) => {
  const { status, priority, assignee } = req.query;
  const filter = { project: req.project._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;

  const tasks = await populateTask(Task.find(filter)).sort('-createdAt');
  res.json({ success: true, data: tasks });
});

// POST /api/projects/:projectId/tasks   (Admin)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority, status, assignee } = req.body;

  if (assignee && !req.project.isMember(assignee)) {
    res.status(400);
    throw new Error('Assignee must be a project member');
  }

  const task = await Task.create({
    title,
    description: description || '',
    project: req.project._id,
    createdBy: req.user._id,
    assignee: assignee || null,
    status: status || 'To Do',
    priority: priority || 'Medium',
    dueDate: dueDate || null,
  });
  await populateTask(Task.findById(task._id)).then((t) =>
    res.status(201).json({ success: true, data: t })
  );
});

// GET /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  const task = await populateTask(Task.findById(req.params.id));
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  const project = await Project.findById(task.project._id);
  if (!project || !project.isMember(req.user._id)) {
    res.status(403);
    throw new Error('Forbidden');
  }
  res.json({ success: true, data: task });
});

// PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user._id)) {
    res.status(403);
    throw new Error('Forbidden');
  }

  const isAdmin = project.isAdmin(req.user._id);
  const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();

  if (!isAdmin && !isAssignee) {
    res.status(403);
    throw new Error('Members can only update tasks assigned to them');
  }

  const { title, description, status, priority, dueDate, assignee } = req.body;

  if (isAdmin) {
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (assignee !== undefined) {
      if (assignee && !project.isMember(assignee)) {
        res.status(400);
        throw new Error('Assignee must be a project member');
      }
      task.assignee = assignee || null;
    }
  }
  if (status !== undefined) task.status = status;

  await task.save();
  const fresh = await populateTask(Task.findById(task._id));
  res.json({ success: true, data: fresh });
});

// DELETE /api/tasks/:id   (Admin)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  const project = await Project.findById(task.project);
  if (!project || !project.isAdmin(req.user._id)) {
    res.status(403);
    throw new Error('Only project admins can delete tasks');
  }
  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});

// GET /api/tasks/mine — every task assigned to the user across all projects
const myTasks = asyncHandler(async (req, res) => {
  const tasks = await populateTask(Task.find({ assignee: req.user._id })).sort(
    '-createdAt'
  );
  res.json({ success: true, data: tasks });
});

module.exports = {
  listProjectTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  myTasks,
};
