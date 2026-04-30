const express = require('express');
const { body } = require('express-validator');
const {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} = require('../controllers/project.controller');
const {
  listProjectTasks,
  createTask,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  loadProject,
  requireProjectMember,
  requireProjectAdmin,
} = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(listProjects)
  .post(
    [body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name 1-100 chars')],
    validate,
    createProject
  );

router
  .route('/:projectId')
  .get(loadProject, requireProjectMember, getProject)
  .put(loadProject, requireProjectAdmin, updateProject)
  .delete(loadProject, requireProjectAdmin, deleteProject);

router.post(
  '/:projectId/members',
  loadProject,
  requireProjectAdmin,
  [body('email').isEmail().withMessage('Valid member email required').normalizeEmail()],
  validate,
  addMember
);

router.delete(
  '/:projectId/members/:userId',
  loadProject,
  requireProjectAdmin,
  removeMember
);

router.patch(
  '/:projectId/members/:userId',
  loadProject,
  requireProjectAdmin,
  updateMemberRole
);

// Tasks scoped to a project
router
  .route('/:projectId/tasks')
  .get(loadProject, requireProjectMember, listProjectTasks)
  .post(
    loadProject,
    requireProjectAdmin,
    [body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title 1-200 chars')],
    validate,
    createTask
  );

module.exports = router;
