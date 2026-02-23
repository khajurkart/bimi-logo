import React from 'react';
import { MessageCircle, Mail } from 'lucide-react';

const FloatingButtons = () => {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/917981002137`, '_blank');
  };

  const handleEmail = () => {
    window.location.href = 'mailto:khajurkart@gmail.com';
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-40" data-testid="floating-buttons">
      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsApp}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="WhatsApp"
        data-testid="whatsapp-button"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Email Button */}
      <button
        onClick={handleEmail}
        className="bg-khajur-gold hover:bg-khajur-primary text-khajur-primary hover:text-khajur-gold p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Email"
        data-testid="email-button"
      >
        <Mail className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FloatingButtons;
