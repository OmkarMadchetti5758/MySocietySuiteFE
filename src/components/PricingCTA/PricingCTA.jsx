import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Container from '../common/Container';
import Button from '../common/Button';
import Badge from '../common/Badge';
import FeatureItem from '../common/FeatureItem';
import { FaHeadset, FaRocket } from 'react-icons/fa';

const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter Society',
    flats: 'Up to 50 Flats',
    price: '₹ 1,499',
    period: '/ month',
    popular: false,
    features: [
      'Visitor Gate Management App',
      'Basic Maintenance Billing',
      'Digital Notice Board',
      'Community Chat',
      'Standard Support'
    ]
  },
  {
    id: 'pro',
    name: 'Growth Society',
    flats: '51 - 250 Flats',
    price: '₹ 3,299',
    period: '/ month',
    popular: true,
    features: [
      'Everything in Starter',
      'Tally & Bank Auto Reconciliation',
      'Facility & Amenity Booking',
      'Staff Attendance Biometrics',
      'AI Assistant Copilot',
      '24/7 Priority Support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Complex',
    flats: '250+ Flats & Multi-Tower',
    price: 'Custom',
    period: 'Quote',
    popular: false,
    features: [
      'Everything in Growth',
      'Dedicated Account Manager',
      'Custom ERP API Integration',
      'On-site Guard Training',
      'Custom Security Workflows',
      '99.99% Uptime Guarantee'
    ]
  }
];

const PricingCTA = () => {
  const [selectedPlan, setSelectedPlan] = useState('pro');

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gradient-to-br from-secondary via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="dark" icon={FaRocket}>
            Simple & Transparent Pricing
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Ready to Digitize Your Society?{' '}
            <span className="orange-gradient-text">Start 30-Day Free Trial</span>
          </h2>

          <p className="text-gray-400 text-base sm:text-lg">
            No credit card required. Onboard your society in less than 24 hours with our dedicated onboarding team.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -8 }}
              className={`rounded-3xl p-8 relative flex flex-col justify-between transition-all duration-300 ${plan.popular
                ? 'bg-dark-card border-2 border-primary shadow-orange-glow'
                : 'bg-dark-card/60 border border-dark-border hover:border-gray-700'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-sm font-black uppercase px-4 py-1.5 rounded-full shadow-md">
                  Popular for RWAs
                </div>
              )}

              <div>
                <span className="text-sm font-bold uppercase text-primary tracking-widest block mb-2">
                  {plan.flats}
                </span>

                <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-400">{plan.period}</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-dark-border mb-8">
                  {plan.features.map((feat, idx) => (
                    <FeatureItem key={idx} text={feat} dark className="text-sm" />
                  ))}
                </div>
              </div>

              <Button
                variant={plan.id === 'growth' ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => toast.success(`Starting 30-Day Free Trial for ${plan.name}`)}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Start 30-Day Free Trial'}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-dark-card p-8 rounded-3xl border border-dark-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl shrink-0">
              <FaHeadset />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Need a Custom Demo for Your Management Committee?</h4>
              <p className="text-sm text-gray-400">Our society expert will conduct a live presentation at your society office or via Zoom.</p>
            </div>
          </div>

          <Button
            variant="primary"
            className="mt-6 w-full max-w-sm sm:w-auto"
            onClick={() => toast.success('Demo Request Submitted! Our representative will call you shortly.')}
          >
            Request On-Site Demo
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default PricingCTA;
