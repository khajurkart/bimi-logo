import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, RefreshCw, Package, Check, X, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminReturns = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      await axios.get(`${API}/admin/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAdmin(true);
      fetchReturns();
    } catch (error) {
      toast.error('Admin access required');
      navigate('/');
    }
  };

  const fetchReturns = async () => {
    try {
      const response = await axios.get(`${API}/admin/returns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReturns(response.data);
    } catch (error) {
      console.error('Failed to fetch returns', error);
      toast.error('Failed to load return requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (returnId, status) => {
    try {
      const params = new URLSearchParams({ status });
      if (adminNotes.trim()) {
        params.append('admin_notes', adminNotes);
      }

      await axios.put(
        `${API}/admin/returns/${returnId}/status?${params.toString()}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Status updated to ${status}`);
      setSelectedReturn(null);
      setAdminNotes('');
      fetchReturns();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredReturns = filterStatus === 'all' 
    ? returns 
    : returns.filter(r => r.status === filterStatus);

  const statusCounts = {
    all: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
    completed: returns.filter(r => r.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-khajur-dark/60">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen py-20 bg-white" data-testid="admin-returns-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            to="/admin"
            className="mr-4 text-khajur-primary hover:text-khajur-gold transition-colors"
            data-testid="back-to-admin"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-medium text-khajur-primary">
              Return & Exchange Requests
            </h1>
            <p className="text-khajur-dark/60 mt-2">Manage customer return and exchange requests</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'pending', 'approved', 'rejected', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-sm text-sm font-medium uppercase tracking-wider transition-all ${
                filterStatus === status
                  ? 'bg-khajur-primary text-khajur-cream'
                  : 'bg-khajur-cream text-khajur-primary hover:bg-khajur-gold/20'
              }`}
              data-testid={`filter-${status}`}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>

        {/* Returns List */}
        {filteredReturns.length === 0 ? (
          <div className="bg-khajur-cream p-12 text-center border border-khajur-border">
            <RefreshCw className="w-16 h-16 text-khajur-muted mx-auto mb-4" />
            <h3 className="font-serif text-xl font-medium text-khajur-primary mb-2">
              No {filterStatus !== 'all' ? filterStatus : ''} return requests
            </h3>
            <p className="text-khajur-dark/60">
              {filterStatus === 'all' 
                ? 'Return and exchange requests from customers will appear here'
                : `No requests with ${filterStatus} status`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReturns.map((returnReq) => (
              <div
                key={returnReq.id}
                className="bg-white border-2 border-khajur-primary/20 rounded-sm overflow-hidden"
                data-testid={`return-${returnReq.id}`}
              >
                {/* Return Header */}
                <div className="bg-khajur-cream p-6 border-b border-khajur-border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-serif text-lg font-bold text-khajur-primary">
                          Request #{returnReq.id.substring(7, 19)}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-sm border flex items-center space-x-1 ${getStatusColor(returnReq.status)}`}>
                          {getStatusIcon(returnReq.status)}
                          <span>{returnReq.status.toUpperCase()}</span>
                        </span>
                        <span className="text-xs px-3 py-1 bg-khajur-primary/10 text-khajur-primary rounded-sm uppercase font-bold">
                          {returnReq.request_type}
                        </span>
                      </div>
                      <p className="text-sm text-khajur-dark/60">
                        Order: #{returnReq.order_id.substring(6, 18)} | Customer: {returnReq.customer_name} ({returnReq.customer_email})
                      </p>
                      <p className="text-sm text-khajur-dark/60">
                        Submitted: {new Date(returnReq.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Items */}
                    <div>
                      <h4 className="font-medium text-khajur-primary mb-3">Items for {returnReq.request_type}</h4>
                      <div className="space-y-2">
                        {returnReq.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-khajur-cream p-3 rounded-sm">
                            <div>
                              <p className="font-medium text-khajur-dark">{item.product_name}</p>
                              <p className="text-sm text-khajur-dark/60">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-khajur-gold">₹{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reason & Notes */}
                    <div>
                      <h4 className="font-medium text-khajur-primary mb-3">Reason</h4>
                      <p className="text-khajur-dark/80 bg-khajur-cream p-3 rounded-sm mb-4">
                        {returnReq.reason}
                      </p>

                      {returnReq.admin_notes && (
                        <div className="mb-4">
                          <h4 className="font-medium text-khajur-primary mb-2">Admin Notes</h4>
                          <p className="text-khajur-dark/80 bg-blue-50 border border-blue-200 p-3 rounded-sm">
                            {returnReq.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {returnReq.status === 'pending' && (
                    <div className="mt-6 pt-6 border-t border-khajur-border">
                      {selectedReturn === returnReq.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-khajur-primary mb-2">
                              Admin Notes (Optional)
                            </label>
                            <textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add notes for the customer about your decision..."
                              rows={3}
                              className="w-full bg-khajur-cream border-2 border-khajur-primary/20 focus:border-khajur-gold text-khajur-dark px-4 py-3 rounded-sm focus:outline-none transition-colors"
                            />
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => updateStatus(returnReq.id, 'approved')}
                              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-sm font-bold uppercase tracking-wider text-sm transition-colors"
                              data-testid={`approve-${returnReq.id}`}
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => updateStatus(returnReq.id, 'rejected')}
                              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-sm font-bold uppercase tracking-wider text-sm transition-colors"
                              data-testid={`reject-${returnReq.id}`}
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReturn(null);
                                setAdminNotes('');
                              }}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-sm font-bold uppercase tracking-wider text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedReturn(returnReq.id)}
                          className="bg-khajur-gold hover:bg-khajur-gold/90 text-khajur-primary px-6 py-3 rounded-sm font-bold uppercase tracking-wider text-sm transition-colors"
                          data-testid={`review-${returnReq.id}`}
                        >
                          Review Request
                        </button>
                      )}
                    </div>
                  )}

                  {returnReq.status === 'approved' && (
                    <div className="mt-6 pt-6 border-t border-khajur-border">
                      <button
                        onClick={() => updateStatus(returnReq.id, 'completed')}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-sm font-bold uppercase tracking-wider text-sm transition-colors"
                        data-testid={`complete-${returnReq.id}`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark as Completed</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReturns;
