import React from 'react';
import { FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaChartBar, FaMapMarkerAlt, FaShoppingBag } from 'react-icons/fa';

/**
 * Standardized Action Buttons for Admin Pages
 * Consistent styling across all admin tables
 */

// Standard button styles
const buttonStyles = {
  view: 'p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors',
  edit: 'p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors',
  delete: 'p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors',
  activate: 'p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors',
  deactivate: 'p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors',
  stats: 'p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors',
  address: 'p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors',
  orders: 'p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors',
};

// View button
export const ViewButton = ({ onClick, title = 'Lihat Detail' }) => (
  <button onClick={onClick} className={buttonStyles.view} title={title}>
    <FaEye size={16} />
  </button>
);

// Edit button
export const EditButton = ({ onClick, title = 'Edit' }) => (
  <button onClick={onClick} className={buttonStyles.edit} title={title}>
    <FaEdit size={16} />
  </button>
);

// Delete button
export const DeleteButton = ({ onClick, title = 'Hapus' }) => (
  <button onClick={onClick} className={buttonStyles.delete} title={title}>
    <FaTrash size={16} />
  </button>
);

// Toggle Status button
export const ToggleStatusButton = ({ isActive, onClick, activeTitle = 'Nonaktifkan', inactiveTitle = 'Aktifkan' }) => (
  <button 
    onClick={onClick} 
    className={isActive ? buttonStyles.deactivate : buttonStyles.activate} 
    title={isActive ? activeTitle : inactiveTitle}
  >
    {isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
  </button>
);

// Stats/Chart button
export const StatsButton = ({ onClick, title = 'Lihat Statistik' }) => (
  <button onClick={onClick} className={buttonStyles.stats} title={title}>
    <FaChartBar size={16} />
  </button>
);

// Address button  
export const AddressButton = ({ onClick, title = 'Kelola Alamat' }) => (
  <button onClick={onClick} className={buttonStyles.address} title={title}>
    <FaMapMarkerAlt size={16} />
  </button>
);

// Orders button
export const OrdersButton = ({ onClick, title = 'Lihat Pesanan' }) => (
  <button onClick={onClick} className={buttonStyles.orders} title={title}>
    <FaShoppingBag size={16} />
  </button>
);

// Action Buttons Container
export const ActionButtonsContainer = ({ children }) => (
  <div className="flex items-center gap-1">
    {children}
  </div>
);

// Export all styles for custom usage
export const actionButtonStyles = buttonStyles;

const actionButtons = {
  ViewButton,
  EditButton,
  DeleteButton,
  ToggleStatusButton,
  StatsButton,
  AddressButton,
  OrdersButton,
  ActionButtonsContainer,
  actionButtonStyles
};

export default actionButtons;
