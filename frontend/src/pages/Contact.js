import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: '7981002137',
      link: 'tel:7981002137'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'khajurkart@gmail.com',
      link: 'mailto:khajurkart@gmail.com'
    },
    {
      icon: MapPin,
      title: 'Address',
      details: '10-3-313/a, AR Raheem Residency, beside gove IASE college, Potti Sriramulu Nagar, Vijaya Nagar Colony, Hyderabad, Telangana 500057',
      link: null
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Saturday: 9:00 AM - 8:00 PM',
      link: null
    }
  ];

  return (
    <div className="min-h-screen" data-testid="contact-page">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-khajur-primary">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/4198755/pexels-photo-4198755.jpeg"
            alt="Contact Us"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <h1 className="font-serif text-5xl md:text-7xl font-medium text-khajur-cream mb-4">
              Contact Us
            </h1>
            <p className="font-sans text-lg md:text-xl text-khajur-cream/80 max-w-2xl">
              We're here to help and answer any question you might have
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white border border-khajur-border p-8 md:p-12">
              <h2 className="font-serif text-3xl font-medium text-khajur-primary mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-khajur-dark mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                    data-testid="contact-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-khajur-dark mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                    data-testid="contact-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-khajur-dark mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border-b border-khajur-primary/20 focus:border-khajur-primary px-0 py-3 focus:ring-0 outline-none transition-colors"
                    data-testid="contact-phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-khajur-dark mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-transparent border border-khajur-primary/20 focus:border-khajur-primary px-4 py-3 focus:ring-0 outline-none transition-colors rounded-sm"
                    data-testid="contact-message"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-khajur-gold text-khajur-primary hover:bg-khajur-gold/90 hover:shadow-[0_0_15px_rgba(198,169,98,0.4)] rounded-sm px-8 py-4 uppercase tracking-widest text-xs font-bold transition-all"
                  data-testid="submit-contact-form"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="font-serif text-3xl font-medium text-khajur-primary mb-8">
                Get in Touch
              </h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 p-6 bg-white border border-khajur-border">
                      <Icon className="w-6 h-6 text-khajur-gold flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-serif text-lg font-medium text-khajur-primary mb-2">
                          {info.title}
                        </h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-khajur-dark/70 hover:text-khajur-gold transition-colors"
                          >
                            {info.details}
                          </a>
                        ) : (
                          <p className="text-khajur-dark/70">{info.details}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
