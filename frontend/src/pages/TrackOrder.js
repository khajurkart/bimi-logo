import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search, Package } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TrackOrder = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API}/orders/track/${trackingId}`);
      setOrder(response.data);
    } catch (error) {
      toast.error('Order not found with this tracking ID');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-khajur-cream py-8" data-testid="track-order-page">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center mb-8">
          <Link
            to="/account"
            className="mr-4 text-khajur-primary hover:text-khajur-gold"
            data-testid="back-to-account"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-4xl font-serif font-bold text-khajur-primary">Track Order</h1>
        </div>

        <div className="bg-white border-2 border-khajur-primary/20 rounded-sm p-8 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-khajur-primary mb-2">
                Enter Tracking ID
              </label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g., KK20260223ABC123"
                className="w-full bg-khajur-cream border-2 border-khajur-primary/20 focus:border-khajur-gold text-khajur-dark px-4 py-3 rounded-sm focus:outline-none transition-colors"
                data-testid="tracking-id-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-khajur-gold hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] text-khajur-primary px-6 py-4 rounded-sm transition-all uppercase tracking-wider font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
              data-testid="track-button"
            >
              <Search className="w-5 h-5" />
              <span>{loading ? 'Searching...' : 'Track Order'}</span>
            </button>
          </form>
        </div>

        {order && (
          <div className="bg-white border-2 border-khajur-primary/20 rounded-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-serif font-bold text-khajur-primary">Order Details</h2>
              <span className={`text-base font-bold uppercase px-4 py-2 rounded-sm ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-4 border-t border-khajur-border pt-6">
              <div>
                <p className="text-khajur-dark/60 text-sm">Order ID</p>
                <p className="text-khajur-primary font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-khajur-dark/60 text-sm">Tracking ID</p>
                <p className="text-khajur-primary font-medium">{order.tracking_id}</p>
              </div>
              <div>
                <p className="text-khajur-dark/60 text-sm">Order Date</p>
                <p className="text-khajur-primary font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-khajur-dark/60 text-sm">Total Amount</p>
                <p className="text-khajur-gold font-bold text-2xl">₹{order.total_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-khajur-dark/60 text-sm mb-2">Items</p>
                {order.items.map((item, index) => (
                  <div key={index} className="bg-khajur-cream p-4 rounded-sm mb-2">
                    <p className="text-khajur-primary font-medium">{item.product_name}</p>
                    <p className="text-khajur-dark/60 text-sm">Quantity: {item.quantity} | Price: ₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!order && !loading && trackingId && (
          <div className="bg-white border-2 border-khajur-primary/20 rounded-sm p-12 text-center">
            <Package className="w-24 h-24 text-khajur-muted mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-medium text-khajur-primary mb-2">No order found</h3>
            <p className="text-khajur-dark/60">Please check your tracking ID and try again</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
