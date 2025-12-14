import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function OrderTracking() {
  const { trackingNumber } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch tracking data dari API
    setLoading(false);
  }, [trackingNumber]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>
        <p className="text-gray-600">Tracking Number: {trackingNumber}</p>
        {/* TODO: Implementasi tracking timeline */}
      </div>
    </div>
  );
}
