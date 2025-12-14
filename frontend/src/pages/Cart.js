import React from 'react';
import { useSelector } from 'react-redux';

export default function Cart() {
  const cart = useSelector(state => state.cart);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        {/* TODO: Implementasi cart items */}
        <p>Total items: {cart?.items?.length || 0}</p>
      </div>
    </div>
  );
}
