import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI, fittingAPI, sizeAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    fittings: 0,
    sizes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [catRes, fitRes, sizeRes] = await Promise.all([
        categoryAPI.getAll(),
        fittingAPI.getAll(),
        sizeAPI.getAll()
      ]);

      setStats({
        categories: catRes.data.data.length,
        fittings: fitRes.data.data.length,
        sizes: sizeRes.data.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, count, link, color }) => (
    <Link
      to={link}
      className={`${color} text-white p-6 rounded shadow hover:shadow-lg transition cursor-pointer`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">{count}</p>
    </Link>
  );

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Categories"
          count={stats.categories}
          link="/admin/categories"
          color="bg-blue-600"
        />
        <StatCard
          title="Fittings"
          count={stats.fittings}
          link="/admin/fittings"
          color="bg-purple-600"
        />
        <StatCard
          title="Sizes"
          count={stats.sizes}
          link="/admin/sizes"
          color="bg-green-600"
        />
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/categories"
            className="p-4 border rounded hover:bg-blue-50 transition"
          >
            <h3 className="font-semibold text-blue-600">Manage Categories</h3>
            <p className="text-sm text-gray-600">Create, edit, delete categories</p>
          </Link>
          <Link
            to="/admin/fittings"
            className="p-4 border rounded hover:bg-purple-50 transition"
          >
            <h3 className="font-semibold text-purple-600">Manage Fittings</h3>
            <p className="text-sm text-gray-600">Create, edit, delete fittings</p>
          </Link>
          <Link
            to="/admin/sizes"
            className="p-4 border rounded hover:bg-green-50 transition"
          >
            <h3 className="font-semibold text-green-600">Manage Sizes</h3>
            <p className="text-sm text-gray-600">Create, edit, delete sizes</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
