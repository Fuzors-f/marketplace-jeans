const { query, transaction } = require('../config/database');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (Admin)
const getAllRoles = async (req, res) => {
  try {
    const roles = await query(
      `SELECT r.*, 
        (SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = r.id) as user_count,
        (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) as permission_count
      FROM roles r
      ORDER BY r.created_at DESC`
    );

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get roles',
      error: error.message
    });
  }
};

// @desc    Get role by ID with permissions
// @route   GET /api/roles/:id
// @access  Private (Admin)
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await query(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );

    if (role.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Get role permissions
    const permissions = await query(
      `SELECT p.* FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      ORDER BY p.module, p.action`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...role[0],
        permissions
      }
    });
  } catch (error) {
    console.error('Get role by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get role',
      error: error.message
    });
  }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Private (Admin)
const createRole = async (req, res) => {
  try {
    const { name, description, permission_ids = [] } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    // Check if role name already exists
    const existing = await query(
      'SELECT id FROM roles WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    await transaction(async (conn) => {
      // Create role
      const result = await query(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [name, description || null],
        conn
      );

      const roleId = result.insertId;

      // Assign permissions
      if (permission_ids.length > 0) {
        const permissionValues = permission_ids.map(pid => [roleId, pid]);
        await query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
          [permissionValues],
          conn
        );
      }

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: { id: roleId, name, description }
      });
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (Admin)
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permission_ids } = req.body;

    // Check if role exists
    const existing = await query(
      'SELECT id FROM roles WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check for duplicate name
    if (name) {
      const duplicateName = await query(
        'SELECT id FROM roles WHERE name = ? AND id != ?',
        [name, id]
      );

      if (duplicateName.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Role name already exists'
        });
      }
    }

    await transaction(async (conn) => {
      // Update role
      await query(
        'UPDATE roles SET name = COALESCE(?, name), description = COALESCE(?, description), updated_at = NOW() WHERE id = ?',
        [name, description, id],
        conn
      );

      // Update permissions if provided
      if (permission_ids !== undefined) {
        // Remove existing permissions
        await query(
          'DELETE FROM role_permissions WHERE role_id = ?',
          [id],
          conn
        );

        // Add new permissions
        if (permission_ids.length > 0) {
          const permissionValues = permission_ids.map(pid => [id, pid]);
          await query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
            [permissionValues],
            conn
          );
        }
      }

      res.json({
        success: true,
        message: 'Role updated successfully'
      });
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin)
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role has users
    const usersWithRole = await query(
      'SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?',
      [id]
    );

    if (usersWithRole[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete role with assigned users'
      });
    }

    await transaction(async (conn) => {
      // Delete role permissions
      await query(
        'DELETE FROM role_permissions WHERE role_id = ?',
        [id],
        conn
      );

      // Delete role
      await query(
        'DELETE FROM roles WHERE id = ?',
        [id],
        conn
      );

      res.json({
        success: true,
        message: 'Role deleted successfully'
      });
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
};

// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private (Admin)
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await query(
      `SELECT * FROM permissions ORDER BY module, action`
    );

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        permissions,
        grouped: groupedPermissions
      }
    });
  } catch (error) {
    console.error('Get all permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permissions',
      error: error.message
    });
  }
};

// @desc    Assign role to user
// @route   POST /api/roles/assign
// @access  Private (Admin)
const assignRoleToUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    if (!user_id || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Role ID are required'
      });
    }

    // Check if assignment already exists
    const existing = await query(
      'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
      [user_id, role_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already has this role'
      });
    }

    await query(
      'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [user_id, role_id]
    );

    res.status(201).json({
      success: true,
      message: 'Role assigned successfully'
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign role',
      error: error.message
    });
  }
};

// @desc    Remove role from user
// @route   DELETE /api/roles/unassign
// @access  Private (Admin)
const removeRoleFromUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;

    if (!user_id || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Role ID are required'
      });
    }

    await query(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
      [user_id, role_id]
    );

    res.json({
      success: true,
      message: 'Role removed successfully'
    });
  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove role',
      error: error.message
    });
  }
};

// @desc    Get user roles and permissions
// @route   GET /api/roles/user/:userId
// @access  Private (Admin)
const getUserRolesAndPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user roles
    const roles = await query(
      `SELECT r.* FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?`,
      [userId]
    );

    // Get all permissions for user's roles
    const permissions = await query(
      `SELECT DISTINCT p.* FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ?
      ORDER BY p.module, p.action`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        roles,
        permissions
      }
    });
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user roles',
      error: error.message
    });
  }
};

// @desc    Initialize default permissions
// @route   POST /api/roles/init-permissions
// @access  Private (Admin)
const initializePermissions = async (req, res) => {
  try {
    const defaultPermissions = [
      // Dashboard
      { name: 'View Dashboard', module: 'dashboard', action: 'view', description: 'Can view dashboard' },
      
      // Products
      { name: 'View Products', module: 'products', action: 'view', description: 'Can view products' },
      { name: 'Create Products', module: 'products', action: 'create', description: 'Can create products' },
      { name: 'Update Products', module: 'products', action: 'update', description: 'Can update products' },
      { name: 'Delete Products', module: 'products', action: 'delete', description: 'Can delete products' },
      
      // Categories
      { name: 'View Categories', module: 'categories', action: 'view', description: 'Can view categories' },
      { name: 'Manage Categories', module: 'categories', action: 'manage', description: 'Can create/edit/delete categories' },
      
      // Orders
      { name: 'View Orders', module: 'orders', action: 'view', description: 'Can view orders' },
      { name: 'Update Orders', module: 'orders', action: 'update', description: 'Can update order status' },
      { name: 'Delete Orders', module: 'orders', action: 'delete', description: 'Can cancel/delete orders' },
      
      // Inventory
      { name: 'View Inventory', module: 'inventory', action: 'view', description: 'Can view inventory' },
      { name: 'Manage Stock', module: 'inventory', action: 'manage', description: 'Can add/adjust stock' },
      { name: 'Stock Opname', module: 'inventory', action: 'opname', description: 'Can perform stock opname' },
      
      // Warehouses
      { name: 'View Warehouses', module: 'warehouses', action: 'view', description: 'Can view warehouses' },
      { name: 'Manage Warehouses', module: 'warehouses', action: 'manage', description: 'Can create/edit warehouses' },
      
      // Reports
      { name: 'View Reports', module: 'reports', action: 'view', description: 'Can view reports' },
      { name: 'Export Reports', module: 'reports', action: 'export', description: 'Can export reports' },
      
      // Users
      { name: 'View Users', module: 'users', action: 'view', description: 'Can view users' },
      { name: 'Manage Users', module: 'users', action: 'manage', description: 'Can create/edit/delete users' },
      
      // Roles
      { name: 'View Roles', module: 'roles', action: 'view', description: 'Can view roles' },
      { name: 'Manage Roles', module: 'roles', action: 'manage', description: 'Can create/edit/delete roles' },
      
      // Settings
      { name: 'View Settings', module: 'settings', action: 'view', description: 'Can view settings' },
      { name: 'Manage Settings', module: 'settings', action: 'manage', description: 'Can update settings' },
    ];

    let insertedCount = 0;
    let skippedCount = 0;

    for (const perm of defaultPermissions) {
      const existing = await query(
        'SELECT id FROM permissions WHERE module = ? AND action = ?',
        [perm.module, perm.action]
      );

      if (existing.length === 0) {
        await query(
          'INSERT INTO permissions (name, module, action, description) VALUES (?, ?, ?, ?)',
          [perm.name, perm.module, perm.action, perm.description]
        );
        insertedCount++;
      } else {
        skippedCount++;
      }
    }

    res.json({
      success: true,
      message: `Permissions initialized. Created: ${insertedCount}, Skipped: ${skippedCount}`
    });
  } catch (error) {
    console.error('Initialize permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize permissions',
      error: error.message
    });
  }
};

module.exports = {
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
};
