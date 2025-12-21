const express = require('express');
const router = express.Router();
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRolesAndPermissions,
  initializePermissions
} = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Permission routes
router.get('/permissions', getAllPermissions);
router.post('/init-permissions', initializePermissions);

// Role management routes
router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

// User role assignment routes
router.post('/assign', assignRoleToUser);
router.delete('/unassign', removeRoleFromUser);
router.get('/user/:userId', getUserRolesAndPermissions);

module.exports = router;
