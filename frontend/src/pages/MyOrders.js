import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, ChevronRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyOrders = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <Package className="w-24 h-24 text-khajur-muted mb-4" />
        <h2 className="font-serif text-3xl font-medium text-khajur-primary mb-4">
          Please login to view orders
        </h2>
        <Link
          to="/"
          className="bg-khajur-primary text-khajur-cream hover:bg-khajur-primary/90 rounded-sm px-8 py-3 uppercase tracking-widest text-xs font-bold transition-all"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-khajur-dark/60">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20" data-testid="my-orders-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-khajur-primary mb-12">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 text-khajur-muted mx-auto mb-4" />
            <p className="text-khajur-dark/60 mb-8">You haven't placed any orders yet</p>
            <Link
              to="/products"
              className="inline-block bg-khajur-primary text-khajur-cream hover:bg-khajur-primary/90 rounded-sm px-8 py-3 uppercase tracking-widest text-xs font-bold transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-khajur-border p-6"
                data-testid={`order-${order.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-serif text-xl font-medium text-khajur-primary">
                        Order #{order.id.substring(0, 12)}...
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-khajur-dark/60">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    {order.tracking_id && (
                      <p className="text-sm text-khajur-dark/80 mt-1">
                        Tracking ID: <span className="font-medium">{order.tracking_id}</span>
                      </p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0 text-left md:text-right">
                    <p className="text-sm text-khajur-dark/60 mb-1">Total Amount</p>
                    <p className="font-serif text-2xl font-bold text-khajur-gold">
                      ₹{order.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-khajur-border pt-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-khajur-dark">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-khajur-dark/60">Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-khajur-gold">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-khajur-border flex justify-between items-center">
                  <div className="text-sm text-khajur-dark/60">
                    Payment: {order.payment_method.toUpperCase()} | 
                    Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                  <Link
                    to={`/order/${order.id}`}
                    className="text-khajur-primary hover:text-khajur-gold text-sm font-medium inline-flex items-center"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
