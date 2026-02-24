import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/reset-password?reset_token=${token}&new_password=${passwords.newPassword}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast.success('Password reset successfully! Please login with your new password.');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <Lock className="w-24 h-24 text-khajur-muted mb-4" />
        <h2 className="font-serif text-3xl font-medium text-khajur-primary mb-4">
          Invalid Reset Link
        </h2>
        <p className="text-khajur-dark/60 mb-8">The password reset link is invalid or has expired.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-khajur-primary text-khajur-cream hover:bg-khajur-primary/90 rounded-sm px-8 py-3 uppercase tracking-widest text-xs font-bold transition-all"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-khajur-cream" data-testid="reset-password-page">
      <div className="max-w-md mx-auto px-6">
        <div className="bg-white border border-khajur-border p-8">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-khajur-gold mx-auto mb-4" />
            <h1 className="font-serif text-3xl font-medium text-khajur-primary mb-2">
              Reset Password
            </h1>
            <p className="text-sm text-khajur-dark/60">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-khajur-dark mb-2">
                New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                data-testid="new-password-input"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-khajur-dark mb-2">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                data-testid="confirm-password-input"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-khajur-gold text-khajur-primary hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] rounded-sm px-8 py-4 uppercase tracking-widest text-xs font-bold transition-all disabled:opacity-50"
              data-testid="reset-password-button"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-khajur-primary hover:text-khajur-gold transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
