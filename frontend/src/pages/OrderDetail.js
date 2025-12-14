import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch order detail dari API
    setLoading(false);
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Order Detail</h1>
        {loading ? (
          <p>Loading...</p>
        ) : order ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p>Order #{order.order_number}</p>
            {/* TODO: Tambahkan detail order */}
          </div>
        ) : (
          <p>Order not found</p>
        )}
      </div>
    </div>
  );
}
