import React from 'react';
import PlaceholderPage from '../PlaceholderPages';

const AdminPlaceholder = ({ title }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="text-gray-600 mb-4">
      This is a placeholder for the {title} page.
    </p>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-blue-800">
        <strong>Implementation Notes:</strong>
      </p>
      <ul className="list-disc list-inside text-sm text-blue-700 mt-2">
        <li>Create tables/grids for data display</li>
        <li>Add forms for create/edit functionality</li>
        <li>Implement search and filters</li>
        <li>Add pagination for large datasets</li>
        <li>Include action buttons (edit, delete, view)</li>
      </ul>
    </div>
  </div>
);

export const Dashboard = () => <AdminPlaceholder title="Dashboard - Show statistics, charts, recent orders" />;
export const Products = () => <AdminPlaceholder title="Products Management - CRUD operations, bulk upload" />;
export const Orders = () => <AdminPlaceholder title="Orders Management - Update status, add tracking" />;
export const Inventory = () => <AdminPlaceholder title="Inventory Management - Stock movements, adjustments" />;
export const Reports = () => <AdminPlaceholder title="Reports - Sales, products, categories performance" />;
export const Users = () => <AdminPlaceholder title="Users Management - Manage users, roles, members" />;
export const Settings = () => <AdminPlaceholder title="Settings - System settings, discounts, shipping" />;
