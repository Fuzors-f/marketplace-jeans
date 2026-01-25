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
      `SELECT id, name, resource as module, action, description, created_at FROM permissions ORDER BY resource, action`
    );

    // Group permissions by resource (aliased as module for frontend compatibility)
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
      ORDER BY p.resource, p.action`,
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
      { name: 'View Dashboard', resource: 'dashboard', action: 'view', description: 'Melihat halaman dashboard' },
      
      // Products
      { name: 'View Products', resource: 'products', action: 'view', description: 'Melihat daftar produk' },
      { name: 'Create Products', resource: 'products', action: 'create', description: 'Membuat produk baru' },
      { name: 'Update Products', resource: 'products', action: 'update', description: 'Mengubah data produk' },
      { name: 'Delete Products', resource: 'products', action: 'delete', description: 'Menghapus produk' },
      { name: 'Import Products', resource: 'products', action: 'import', description: 'Import produk dari file' },
      
      // Categories
      { name: 'View Categories', resource: 'categories', action: 'view', description: 'Melihat daftar kategori' },
      { name: 'Create Categories', resource: 'categories', action: 'create', description: 'Membuat kategori baru' },
      { name: 'Update Categories', resource: 'categories', action: 'update', description: 'Mengubah kategori' },
      { name: 'Delete Categories', resource: 'categories', action: 'delete', description: 'Menghapus kategori' },
      
      // Fittings
      { name: 'View Fittings', resource: 'fittings', action: 'view', description: 'Melihat daftar fitting' },
      { name: 'Create Fittings', resource: 'fittings', action: 'create', description: 'Membuat fitting baru' },
      { name: 'Update Fittings', resource: 'fittings', action: 'update', description: 'Mengubah fitting' },
      { name: 'Delete Fittings', resource: 'fittings', action: 'delete', description: 'Menghapus fitting' },
      
      // Sizes
      { name: 'View Sizes', resource: 'sizes', action: 'view', description: 'Melihat daftar ukuran' },
      { name: 'Create Sizes', resource: 'sizes', action: 'create', description: 'Membuat ukuran baru' },
      { name: 'Update Sizes', resource: 'sizes', action: 'update', description: 'Mengubah ukuran' },
      { name: 'Delete Sizes', resource: 'sizes', action: 'delete', description: 'Menghapus ukuran' },
      
      // Size Charts
      { name: 'View Size Charts', resource: 'size_charts', action: 'view', description: 'Melihat size chart' },
      { name: 'Create Size Charts', resource: 'size_charts', action: 'create', description: 'Membuat size chart' },
      { name: 'Update Size Charts', resource: 'size_charts', action: 'update', description: 'Mengubah size chart' },
      { name: 'Delete Size Charts', resource: 'size_charts', action: 'delete', description: 'Menghapus size chart' },
      
      // Orders
      { name: 'View Orders', resource: 'orders', action: 'view', description: 'Melihat daftar pesanan' },
      { name: 'Create Orders', resource: 'orders', action: 'create', description: 'Membuat pesanan baru' },
      { name: 'Update Orders', resource: 'orders', action: 'update', description: 'Mengubah status pesanan' },
      { name: 'Delete Orders', resource: 'orders', action: 'delete', description: 'Membatalkan/menghapus pesanan' },
      { name: 'Process Payments', resource: 'orders', action: 'payment', description: 'Memproses pembayaran' },
      
      // Inventory
      { name: 'View Inventory', resource: 'inventory', action: 'view', description: 'Melihat stok barang' },
      { name: 'Create Inventory', resource: 'inventory', action: 'create', description: 'Menambah stok baru' },
      { name: 'Update Inventory', resource: 'inventory', action: 'update', description: 'Mengubah stok' },
      { name: 'Delete Inventory', resource: 'inventory', action: 'delete', description: 'Menghapus data stok' },
      { name: 'Stock Opname', resource: 'inventory', action: 'opname', description: 'Melakukan stock opname' },
      { name: 'Stock Transfer', resource: 'inventory', action: 'transfer', description: 'Transfer stok antar gudang' },
      
      // Warehouses
      { name: 'View Warehouses', resource: 'warehouses', action: 'view', description: 'Melihat daftar gudang' },
      { name: 'Create Warehouses', resource: 'warehouses', action: 'create', description: 'Membuat gudang baru' },
      { name: 'Update Warehouses', resource: 'warehouses', action: 'update', description: 'Mengubah data gudang' },
      { name: 'Delete Warehouses', resource: 'warehouses', action: 'delete', description: 'Menghapus gudang' },
      
      // Reports
      { name: 'View Reports', resource: 'reports', action: 'view', description: 'Melihat laporan' },
      { name: 'Export Reports', resource: 'reports', action: 'export', description: 'Export laporan ke file' },
      { name: 'Sales Report', resource: 'reports', action: 'sales', description: 'Melihat laporan penjualan' },
      { name: 'Inventory Report', resource: 'reports', action: 'inventory', description: 'Melihat laporan inventori' },
      
      // Users
      { name: 'View Users', resource: 'users', action: 'view', description: 'Melihat daftar pengguna' },
      { name: 'Create Users', resource: 'users', action: 'create', description: 'Membuat pengguna baru' },
      { name: 'Update Users', resource: 'users', action: 'update', description: 'Mengubah data pengguna' },
      { name: 'Delete Users', resource: 'users', action: 'delete', description: 'Menghapus pengguna' },
      { name: 'View User Transactions', resource: 'users', action: 'transactions', description: 'Melihat transaksi pengguna' },
      
      // Roles & Permissions
      { name: 'View Roles', resource: 'roles', action: 'view', description: 'Melihat daftar role' },
      { name: 'Create Roles', resource: 'roles', action: 'create', description: 'Membuat role baru' },
      { name: 'Update Roles', resource: 'roles', action: 'update', description: 'Mengubah role' },
      { name: 'Delete Roles', resource: 'roles', action: 'delete', description: 'Menghapus role' },
      { name: 'Assign Roles', resource: 'roles', action: 'assign', description: 'Menetapkan role ke user' },
      
      // Banners
      { name: 'View Banners', resource: 'banners', action: 'view', description: 'Melihat daftar banner' },
      { name: 'Create Banners', resource: 'banners', action: 'create', description: 'Membuat banner baru' },
      { name: 'Update Banners', resource: 'banners', action: 'update', description: 'Mengubah banner' },
      { name: 'Delete Banners', resource: 'banners', action: 'delete', description: 'Menghapus banner' },
      
      // Content
      { name: 'View Content', resource: 'content', action: 'view', description: 'Melihat konten website' },
      { name: 'Create Content', resource: 'content', action: 'create', description: 'Membuat konten baru' },
      { name: 'Update Content', resource: 'content', action: 'update', description: 'Mengubah konten' },
      { name: 'Delete Content', resource: 'content', action: 'delete', description: 'Menghapus konten' },
      
      // Coupons & Discounts
      { name: 'View Coupons', resource: 'coupons', action: 'view', description: 'Melihat daftar kupon' },
      { name: 'Create Coupons', resource: 'coupons', action: 'create', description: 'Membuat kupon baru' },
      { name: 'Update Coupons', resource: 'coupons', action: 'update', description: 'Mengubah kupon' },
      { name: 'Delete Coupons', resource: 'coupons', action: 'delete', description: 'Menghapus kupon' },
      
      // Shipping
      { name: 'View Shipping', resource: 'shipping', action: 'view', description: 'Melihat pengaturan pengiriman' },
      { name: 'Create Shipping', resource: 'shipping', action: 'create', description: 'Membuat aturan pengiriman' },
      { name: 'Update Shipping', resource: 'shipping', action: 'update', description: 'Mengubah pengaturan pengiriman' },
      { name: 'Delete Shipping', resource: 'shipping', action: 'delete', description: 'Menghapus aturan pengiriman' },
      
      // City Shipping
      { name: 'View City Shipping', resource: 'city_shipping', action: 'view', description: 'Melihat ongkir per kota' },
      { name: 'Create City Shipping', resource: 'city_shipping', action: 'create', description: 'Menambah ongkir kota' },
      { name: 'Update City Shipping', resource: 'city_shipping', action: 'update', description: 'Mengubah ongkir kota' },
      { name: 'Delete City Shipping', resource: 'city_shipping', action: 'delete', description: 'Menghapus ongkir kota' },
      
      // Exchange Rates
      { name: 'View Exchange Rates', resource: 'exchange_rates', action: 'view', description: 'Melihat kurs mata uang' },
      { name: 'Create Exchange Rates', resource: 'exchange_rates', action: 'create', description: 'Menambah kurs baru' },
      { name: 'Update Exchange Rates', resource: 'exchange_rates', action: 'update', description: 'Mengubah kurs' },
      { name: 'Delete Exchange Rates', resource: 'exchange_rates', action: 'delete', description: 'Menghapus kurs' },
      
      // Settings
      { name: 'View Settings', resource: 'settings', action: 'view', description: 'Melihat pengaturan sistem' },
      { name: 'Update Settings', resource: 'settings', action: 'update', description: 'Mengubah pengaturan sistem' },
      
      // Activity Logs
      { name: 'View Activity Logs', resource: 'activity_logs', action: 'view', description: 'Melihat log aktivitas' },
      { name: 'Delete Activity Logs', resource: 'activity_logs', action: 'delete', description: 'Menghapus log aktivitas' },
    ];

    let insertedCount = 0;
    let skippedCount = 0;

    for (const perm of defaultPermissions) {
      const existing = await query(
        'SELECT id FROM permissions WHERE resource = ? AND action = ?',
        [perm.resource, perm.action]
      );

      if (existing.length === 0) {
        await query(
          'INSERT INTO permissions (name, resource, action, description) VALUES (?, ?, ?, ?)',
          [perm.name, perm.resource, perm.action, perm.description]
        );
        insertedCount++;
      } else {
        // Update existing permission name/description
        await query(
          'UPDATE permissions SET name = ?, description = ? WHERE resource = ? AND action = ?',
          [perm.name, perm.description, perm.resource, perm.action]
        );
        skippedCount++;
      }
    }

    res.json({
      success: true,
      message: `Permissions initialized. Created: ${insertedCount}, Updated: ${skippedCount}`,
      data: { created: insertedCount, updated: skippedCount }
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

// @desc    Create superadmin role with all permissions
// @route   POST /api/roles/create-superadmin
// @access  Private (Admin)
const createSuperadminRole = async (req, res) => {
  try {
    // Check if superadmin role already exists
    const existingRole = await query(
      'SELECT id FROM roles WHERE name = ?',
      ['Superadmin']
    );

    let roleId;

    if (existingRole.length > 0) {
      roleId = existingRole[0].id;
      // Update existing role
      await query(
        'UPDATE roles SET description = ?, updated_at = NOW() WHERE id = ?',
        ['Role dengan akses penuh ke semua fitur sistem', roleId]
      );
    } else {
      // Create new superadmin role
      const result = await query(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        ['Superadmin', 'Role dengan akses penuh ke semua fitur sistem']
      );
      roleId = result.insertId;
    }

    // Get all permissions
    const allPermissions = await query('SELECT id FROM permissions');

    // Remove existing role permissions
    await query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

    // Assign all permissions to superadmin
    if (allPermissions.length > 0) {
      // Insert permissions one by one to avoid MariaDB syntax issues
      for (const perm of allPermissions) {
        await query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [roleId, perm.id]
        );
      }
    }

    res.json({
      success: true,
      message: `Superadmin role created/updated with ${allPermissions.length} permissions`,
      data: {
        role_id: roleId,
        permissions_count: allPermissions.length
      }
    });
  } catch (error) {
    console.error('Create superadmin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create superadmin role',
      error: error.message
    });
  }
};

// @desc    Assign superadmin role to user
// @route   POST /api/roles/assign-superadmin/:userId
// @access  Private (Admin)
const assignSuperadminToUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get superadmin role
    const superadminRole = await query(
      'SELECT id FROM roles WHERE name = ?',
      ['Superadmin']
    );

    if (superadminRole.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Superadmin role not found. Please run init-permissions and create-superadmin first.'
      });
    }

    const roleId = superadminRole[0].id;

    // Check if user exists
    const user = await query('SELECT id, email, full_name FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if assignment already exists
    const existing = await query(
      'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
      [userId, roleId]
    );

    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'User already has superadmin role',
        data: { user: user[0], role_id: roleId }
      });
    }

    // Assign superadmin role
    await query(
      'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, roleId]
    );

    // Also update user role to admin if not already
    await query(
      'UPDATE users SET role = ? WHERE id = ? AND role != ?',
      ['admin', userId, 'admin']
    );

    res.json({
      success: true,
      message: `Superadmin role assigned to ${user[0].full_name || user[0].email}`,
      data: { user: user[0], role_id: roleId }
    });
  } catch (error) {
    console.error('Assign superadmin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign superadmin role',
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
  initializePermissions,
  createSuperadminRole,
  assignSuperadminToUser
};
