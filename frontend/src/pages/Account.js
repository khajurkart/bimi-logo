import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Package, MessageCircle, RefreshCw, Phone, Truck, LogOut, Home, ShoppingBag } from 'lucide-react';

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      icon: MessageCircle,
      label: 'WHATSAPP SUPPORT',
      action: () => window.open('https://wa.me/917981002137', '_blank'),
      hasGreenIcon: true
    },
    {
      icon: RefreshCw,
      label: 'RETURN & EXCHANGE',
      link: '/returns'
    },
    {
      icon: Phone,
      label: 'CONTACT US',
      link: '/contact'
    },
    {
      icon: Truck,
      label: 'TRACK ORDER',
      link: '/track-order'
    }
  ];

  return (
    <div className="min-h-screen bg-khajur-cream pb-24" data-testid="account-page">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Greeting */}
        <div className="mb-8 border-b-2 border-khajur-gold/30 pb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-khajur-primary mb-2">
            Hey {user.name || 'User'}
          </h1>
          <p className="text-khajur-dark/70 text-base">
            Logged in Via {user.phone || user.email}
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            to="/profile"
            className="bg-white border-2 border-khajur-primary/20 hover:border-khajur-gold hover:shadow-hover p-8 rounded-sm transition-all group"
            data-testid="profile-card"
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-khajur-primary/10 p-6 rounded-sm group-hover:bg-khajur-gold/20 transition-colors">
                <User className="w-12 h-12 text-khajur-primary" />
              </div>
              <span className="text-khajur-primary text-lg uppercase tracking-widest font-bold">
                PROFILE
              </span>
            </div>
          </Link>

          <Link
            to="/addresses"
            className="bg-white border-2 border-khajur-primary/20 hover:border-khajur-gold hover:shadow-hover p-8 rounded-sm transition-all group"
            data-testid="addresses-card"
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-khajur-primary/10 p-6 rounded-sm group-hover:bg-khajur-gold/20 transition-colors">
                <MapPin className="w-12 h-12 text-khajur-primary" />
              </div>
              <span className="text-khajur-primary text-lg uppercase tracking-widest font-bold">
                ADDRESSES
              </span>
            </div>
          </Link>

          <Link
            to="/my-orders"
            className="bg-white border-2 border-khajur-primary/20 hover:border-khajur-gold hover:shadow-hover p-8 rounded-sm transition-all group"
            data-testid="orders-card"
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-khajur-primary/10 p-6 rounded-sm group-hover:bg-khajur-gold/20 transition-colors">
                <Package className="w-12 h-12 text-khajur-primary" />
              </div>
              <span className="text-khajur-primary text-lg uppercase tracking-widest font-bold">
                ORDERS
              </span>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <div className="space-y-4 mb-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <div className="flex items-center justify-between bg-white border-2 border-khajur-primary/20 hover:border-khajur-gold hover:shadow-card p-6 rounded-sm transition-all group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <Icon className={`w-6 h-6 ${item.hasGreenIcon ? 'text-green-600' : 'text-khajur-primary'}`} />
                  <span className="text-khajur-primary text-base uppercase tracking-wider font-bold">
                    {item.label}
                  </span>
                </div>
                <svg 
                  className="w-6 h-6 text-khajur-gold group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            );

            return item.link ? (
              <Link key={index} to={item.link} data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                {content}
              </Link>
            ) : (
              <div key={index} onClick={item.action} data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                {content}
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-transparent border-2 border-red-600 hover:bg-red-600 text-red-600 hover:text-white p-6 rounded-sm transition-all uppercase tracking-wider font-bold text-lg flex items-center justify-center space-x-2"
          data-testid="logout-button"
        >
          <LogOut className="w-6 h-6" />
          <span>LOGOUT</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-khajur-primary border-t-2 border-khajur-gold py-4 px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-around">
          <Link
            to="/"
            className="flex flex-col items-center space-y-2 text-khajur-cream hover:text-khajur-gold transition-colors"
            data-testid="bottom-nav-home"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs uppercase tracking-wider font-medium">HOME</span>
          </Link>

          <Link
            to="/products"
            className="flex flex-col items-center space-y-2 text-khajur-cream hover:text-khajur-gold transition-colors"
            data-testid="bottom-nav-shop"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs uppercase tracking-wider font-medium">SHOP</span>
          </Link>

          <Link
            to="/account"
            className="flex flex-col items-center space-y-2 text-khajur-gold transition-colors"
            data-testid="bottom-nav-account"
          >
            <div className="relative">
              <User className="w-6 h-6" />
              <div className="absolute -top-1 left-1/2 right-0 h-1 bg-khajur-gold rounded-full"></div>
            </div>
            <span className="text-xs uppercase tracking-wider font-medium">MY ACCOUNT</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Account;
