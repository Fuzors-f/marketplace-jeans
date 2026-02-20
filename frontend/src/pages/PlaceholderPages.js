import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PlaceholderPage = ({ title, description }) => (
  <>
    <Helmet>
      <title>{`${title || 'Page'} - Marketplace Jeans`}</title>
    </Helmet>
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{description}</p>
        <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
          Back to Home
        </Link>
      </div>
    </div>
  </>
);

export const Register = () => (
  <PlaceholderPage
    title="Register"
    description="Registration page - Implement similar to Login page with full_name, phone fields"
  />
);

export const Products = () => (
  <PlaceholderPage
    title="Products"
    description="Product listing page with filters (category, fitting, size, price range)"
  />
);

export const ProductDetail = () => (
  <PlaceholderPage
    title="Product Detail"
    description="Product detail page with images, variants, add to cart functionality"
  />
);

export const Cart = () => (
  <PlaceholderPage
    title="Shopping Cart"
    description="Shopping cart page with item list, quantity update, remove items"
  />
);

export const Checkout = () => (
  <PlaceholderPage
    title="Checkout"
    description="Checkout page with shipping address, payment method, order summary"
  />
);

export const Profile = () => (
  <PlaceholderPage
    title="My Profile"
    description="User profile page with personal information and edit functionality"
  />
);

export const Orders = () => (
  <PlaceholderPage
    title="My Orders"
    description="Order history page with status tracking"
  />
);

export const OrderDetail = () => (
  <PlaceholderPage
    title="Order Detail"
    description="Detailed order information with items, shipping, payment status"
  />
);

export const OrderSuccess = () => (
  <PlaceholderPage
    title="Order Success"
    description="Order confirmation page after successful checkout"
  />
);

export const OrderTracking = () => (
  <PlaceholderPage
    title="Track Order"
    description="Order tracking page with shipping status"
  />
);

export const NotFound = () => (
  <PlaceholderPage
    title="404 - Page Not Found"
    description="The page you're looking for doesn't exist"
  />
);

export default PlaceholderPage;
