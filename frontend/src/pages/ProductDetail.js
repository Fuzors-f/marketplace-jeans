import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch product detail dari API
    setLoading(false);
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div>
            <h1>Product Detail - {slug}</h1>
            {/* TODO: Tambahkan detail produk */}
          </div>
        )}
      </div>
    </div>
  );
}
