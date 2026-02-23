import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, MapPin, Plus } from 'lucide-react';

const Addresses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  // Placeholder for addresses - in real app, fetch from backend
  const addresses = [];

  return (
    <div className="min-h-screen bg-khajur-cream py-8" data-testid="addresses-page">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              to="/account"
              className="mr-4 text-khajur-primary hover:text-khajur-gold"
              data-testid="back-to-account"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-4xl font-serif font-bold text-khajur-primary">My Addresses</h1>
          </div>
          <button
            className="bg-khajur-gold hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] text-khajur-primary px-6 py-3 rounded-sm transition-all uppercase tracking-wider font-bold text-sm flex items-center space-x-2"
            data-testid="add-address-button"
          >
            <Plus className="w-5 h-5" />
            <span>Add New</span>
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-white border-2 border-khajur-primary/20 rounded-sm p-12 text-center">
            <MapPin className="w-24 h-24 text-khajur-muted mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-medium text-khajur-primary mb-2">No addresses saved</h3>
            <p className="text-khajur-dark/60 mb-6">Add your delivery addresses for faster checkout</p>
            <button
              className="bg-khajur-gold hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] text-khajur-primary px-8 py-3 rounded-sm transition-all uppercase tracking-wider font-bold"
              data-testid="add-first-address-button"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Addresses will be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;
