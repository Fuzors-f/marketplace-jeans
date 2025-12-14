import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md bg-white rounded-lg shadow p-8 text-center">
        <div className="text-5xl text-green-500 mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">Order Success!</h1>
        <p className="text-gray-600 mb-6">
          Order #{orderId} has been placed successfully.
        </p>
        <Link
          to="/orders"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}
