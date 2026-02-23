import React from 'react';
import { Award, Heart, Leaf, Users } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'We source only the finest dates, nuts, and spices from the best regions worldwide.'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We strive to deliver excellence in every order.'
    },
    {
      icon: Leaf,
      title: 'Natural & Pure',
      description: 'All our products are 100% natural with no artificial additives or preservatives.'
    },
    {
      icon: Users,
      title: 'Trusted by Thousands',
      description: 'Join our growing family of satisfied customers across India.'
    }
  ];

  return (
    <div className="min-h-screen" data-testid="about-page">
      {/* Hero Section */}
      <section className="relative h-[400px] bg-khajur-primary">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/18740976/pexels-photo-18740976.jpeg"
            alt="About KhajurKart"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <h1 className="font-serif text-5xl md:text-7xl font-medium text-khajur-cream mb-4">
              About KhajurKart
            </h1>
            <p className="font-sans text-lg md:text-xl text-khajur-cream/80 max-w-2xl">
              Your premium destination for the world's finest dry fruits and spices
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-5xl font-medium text-khajur-primary mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-khajur-dark/80 leading-relaxed">
                <p>
                  KhajurKart was born from a passion for bringing the finest quality dates, nuts, and spices to Indian households. We believe that everyone deserves access to premium, authentic products that not only taste exceptional but also contribute to a healthier lifestyle.
                </p>
                <p>
                  Our journey began with a simple mission: to source the best dry fruits and spices from around the world and make them accessible to our customers at the best prices. We work directly with trusted suppliers and farmers to ensure every product meets our rigorous quality standards.
                </p>
                <p>
                  Today, KhajurKart serves thousands of satisfied customers across India, delivering not just products, but a promise of quality, authenticity, and excellence in every package.
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/31496295/pexels-photo-31496295.jpeg"
                alt="Premium Products"
                className="w-full h-auto shadow-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-medium text-khajur-primary mb-4">
              Our Values
            </h2>
            <p className="font-sans text-base text-khajur-dark/70 max-w-2xl mx-auto">
              What drives us to deliver excellence every day
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="p-8 border border-khajur-primary/10 bg-khajur-cream hover:bg-white transition-colors duration-300 text-center"
                >
                  <Icon className="w-12 h-12 text-khajur-gold mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-medium text-khajur-primary mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-khajur-dark/60 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-khajur-primary text-khajur-cream p-12 md:p-16 text-center">
            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
              Our Mission
            </h2>
            <p className="font-sans text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              To become India's most trusted destination for premium dry fruits, dates, and spices by consistently delivering exceptional quality, authentic products, and outstanding customer service.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
