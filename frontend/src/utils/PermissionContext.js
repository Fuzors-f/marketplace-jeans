import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  // Check if user has a specific permission
  const hasPermission = (resource, action = 'view') => {
    // Super admin (role = admin) has all permissions by default
    if (user?.role === 'admin') {
      return true;
    }

    // Check in user's permissions array
    if (user?.permissions && Array.isArray(user.permissions)) {
      return user.permissions.some(
        p => p.resource === resource && p.action === action
      );
    }

    return false;
  };

  // Check if user can view a resource
  const canView = (resource) => hasPermission(resource, 'view');
  
  // Check if user can create a resource
  const canCreate = (resource) => hasPermission(resource, 'create');
  
  // Check if user can update a resource
  const canUpdate = (resource) => hasPermission(resource, 'update');
  
  // Check if user can delete a resource
  const canDelete = (resource) => hasPermission(resource, 'delete');

  // Check multiple permissions at once
  const hasAnyPermission = (permissions) => {
    return permissions.some(({ resource, action }) => hasPermission(resource, action));
  };

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions) => {
    return permissions.every(({ resource, action }) => hasPermission(resource, action));
  };

  // Get all resources user can access
  const getAccessibleResources = () => {
    if (user?.role === 'admin') {
      return 'all';
    }
    
    if (user?.permissions && Array.isArray(user.permissions)) {
      const resources = [...new Set(user.permissions.map(p => p.resource))];
      return resources;
    }
    
    return [];
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  const isAdminStok = user?.role === 'admin_stok';
  const isAdminUser = isAdmin || isAdminStok;

  const value = {
    hasPermission,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    hasAnyPermission,
    hasAllPermissions,
    getAccessibleResources,
    isAdmin,
    isAdminStok,
    isAdminUser,
    permissions: user?.permissions || []
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// Higher-order component for permission-based rendering
export const withPermission = (WrappedComponent, resource, action = 'view') => {
  return function PermissionWrapper(props) {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(resource, action)) {
      return null; // or return a "No Permission" message
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Component for conditional rendering based on permissions
export const CanAccess = ({ resource, action = 'view', children, fallback = null }) => {
  const { hasPermission } = usePermissions();
  
  if (hasPermission(resource, action)) {
    return children;
  }
  
  return fallback;
};

export default PermissionContext;
