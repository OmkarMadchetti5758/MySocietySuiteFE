import React from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Container from '../common/Container';
import Button from '../common/Button';
import Badge from '../common/Badge';
import FeatureItem from '../common/FeatureItem';
import { FaHeadset, FaRocket, FaCheck } from 'react-icons/fa';

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
      'Standard Support',
    ],
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
      '24/7 Priority Support',
    ],
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
      '99.99% Uptime Guarantee',
    ],
  },
];

const PricingCTA = () => {
  return (
    <section
      id="pricing"
      className="py-20 sm:py-28 relative overflow-hidden bg-[#f5f6fa]"
    >
      {/* Subtle decorative blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-300/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <Container>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="light" icon={FaRocket}>
            Simple &amp; Transparent Pricing
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-gray-900">
            Ready to Digitize Your Society?{' '}
            <span className="orange-gradient-text">Start 30-Day Free Trial</span>
          </h2>

          <p className="text-gray-500 text-base sm:text-lg">
            No credit card required. Onboard your society in less than 24 hours
            with our dedicated onboarding team.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PRICING_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`rounded-3xl p-8 relative flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? 'bg-white/70 backdrop-blur-xl border-2 border-primary/40 shadow-[0_8px_40px_rgba(255,107,0,0.18)]'
                  : 'bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:border-white'
              }`}
              style={{
                background: plan.popular
                  ? 'rgba(255,255,255,0.75)'
                  : 'rgba(255,255,255,0.55)',
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black uppercase px-5 py-1.5 rounded-full shadow-orange-glow tracking-wider">
                  Popular for RWAs
                </div>
              )}

              <div>
                <span className="text-xs font-bold uppercase text-primary tracking-widest block mb-2">
                  {plan.flats}
                </span>

                <h3 className="text-xl font-bold text-gray-900 mb-4">{plan.name}</h3>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-400 font-medium">{plan.period}</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-100 mb-8">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <FaCheck className="text-primary text-[8px]" />
                      </span>
                      <span className="text-sm text-gray-600">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  toast.success(`Starting 30-Day Free Trial for ${plan.name}`)
                }
                className={`w-full py-3 px-6 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  plan.popular
                    ? 'bg-primary text-white shadow-orange-glow hover:bg-primary-hover hover:shadow-lg'
                    : 'bg-gray-900 text-white hover:bg-black'
                }`}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Start 30-Day Free Trial'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner — glass card */}
        <div
          className="p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          }}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl shrink-0 border border-primary/20">
              <FaHeadset />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                Need a Custom Demo for Your Management Committee?
              </h4>
              <p className="text-sm text-gray-500">
                Our society expert will conduct a live presentation at your society office or via Zoom.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            className="mt-6 w-full max-w-sm sm:w-auto sm:mt-0 shrink-0"
            onClick={() =>
              toast.success(
                'Demo Request Submitted! Our representative will call you shortly.'
              )
            }
          >
            Request On-Site Demo
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default PricingCTA;
