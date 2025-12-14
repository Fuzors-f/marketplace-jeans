import React from 'react';
import { useSelector } from 'react-redux';

export default function Profile() {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        {user && (
          <div className="bg-white rounded-lg shadow p-6">
            <p><strong>Name:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
          </div>
        )}
      </div>
    </div>
  );
}
