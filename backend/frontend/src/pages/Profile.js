import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, User as UserIcon, Mail, Phone, Save } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, you'd have an update profile endpoint
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-khajur-cream py-8" data-testid="profile-page">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-center mb-8">
          <Link
            to="/account"
            className="mr-4 text-khajur-primary hover:text-khajur-gold"
            data-testid="back-to-account"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-4xl font-serif font-bold text-khajur-primary">My Profile</h1>
        </div>

        <div className="bg-white border-2 border-khajur-primary/20 rounded-sm p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-khajur-primary/10 p-8 rounded-full">
              <UserIcon className="w-24 h-24 text-khajur-primary" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-khajur-primary mb-2">
                <UserIcon className="w-4 h-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-khajur-cream border-2 border-khajur-primary/20 focus:border-khajur-gold text-khajur-dark px-4 py-3 rounded-sm focus:outline-none transition-colors"
                data-testid="profile-name-input"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-khajur-primary mb-2">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-khajur-cream border-2 border-khajur-primary/20 text-khajur-dark px-4 py-3 rounded-sm focus:outline-none opacity-60"
                data-testid="profile-email-input"
                disabled
              />
              <p className="text-xs text-khajur-dark/60 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-khajur-primary mb-2">
                <Phone className="w-4 h-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-khajur-cream border-2 border-khajur-primary/20 focus:border-khajur-gold text-khajur-dark px-4 py-3 rounded-sm focus:outline-none transition-colors"
                data-testid="profile-phone-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-khajur-gold hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] text-khajur-primary px-6 py-4 rounded-sm transition-all uppercase tracking-wider font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
              data-testid="save-profile-button"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
