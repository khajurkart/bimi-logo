import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        // Handle forgot password
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
        const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        
        if (response.ok) {
          toast.success('Password reset instructions sent to your email');
          setIsForgotPassword(false);
          setIsLogin(true);
        } else {
          const error = await response.json();
          toast.error(error.detail || 'Failed to send reset email');
        }
      } else if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Login successful');
        onClose();
        setFormData({ name: '', email: '', password: '', phone: '' });
      } else {
        await register(formData.name, formData.email, formData.password, formData.phone);
        toast.success('Registration successful');
        onClose();
        setFormData({ name: '', email: '', password: '', phone: '' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setIsLogin(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-testid="auth-modal">
      <div className="bg-khajur-cream max-w-md w-full rounded-sm shadow-2xl relative border-2 border-khajur-gold/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-khajur-primary hover:text-khajur-gold transition-colors"
          data-testid="close-auth-modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <h2 className="font-serif text-4xl font-bold text-khajur-primary mb-2 text-center">
            {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-center text-khajur-dark/60 mb-8 text-sm">
            {isForgotPassword ? 'Enter your email to reset password' : isLogin ? 'Login to your account' : 'Join KhajurKart today'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-khajur-primary mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border-2 border-khajur-primary/20 focus:border-khajur-gold text-khajur-dark px-4 py-3 rounded-sm focus:ring-0 outline-none transition-colors"
                  data-testid="register-name-input"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-khajur-primary mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border-2 border-khajur-primary/20 focus:border-khajur-gold text-khajur-dark px-4 py-3 rounded-sm focus:ring-0 outline-none transition-colors"
                data-testid="auth-email-input"
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-khajur-primary mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white border-2 border-khajur-primary/20 focus:border-khajur-gold text-khajur-dark px-4 py-3 rounded-sm focus:ring-0 outline-none transition-colors"
                  data-testid="auth-password-input"
                />
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-khajur-primary mb-2">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border-2 border-khajur-primary/20 focus:border-khajur-gold text-khajur-dark px-4 py-3 rounded-sm focus:ring-0 outline-none transition-colors"
                  data-testid="register-phone-input"
                />
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-khajur-primary hover:text-khajur-gold transition-colors font-medium"
                  data-testid="forgot-password-link"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-khajur-gold text-khajur-primary hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] rounded-sm px-8 py-4 uppercase tracking-widest text-xs font-bold transition-all mt-6 disabled:opacity-50"
              data-testid="auth-submit-button"
            >
              {loading ? 'Please wait...' : isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          <div className="mt-6 text-center">
            {isForgotPassword ? (
              <button
                onClick={handleBackToLogin}
                className="text-sm text-khajur-primary hover:text-khajur-gold transition-colors font-medium"
                data-testid="back-to-login"
              >
                ← Back to Login
              </button>
            ) : (
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-khajur-primary hover:text-khajur-gold transition-colors font-medium"
                data-testid="toggle-auth-mode"
              >
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
