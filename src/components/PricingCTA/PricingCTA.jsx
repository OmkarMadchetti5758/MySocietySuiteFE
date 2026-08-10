import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Container from '../common/Container';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { FaHeadset, FaRocket, FaCheck, FaCalendarCheck, FaUsers, FaLaptopCode, FaPhone, FaEnvelope, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

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

const ONBOARDING_STEPS = [
  { day: 'Day 1', title: 'Account Setup', icon: FaLaptopCode },
  { day: 'Day 3', title: 'Data Migration', icon: FaCalendarCheck },
  { day: 'Day 7', title: 'Go Live', icon: FaUsers },
];

const PricingCTA = () => {
  const [showContactModal, setShowContactModal] = useState(false);

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
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <Badge variant="light" icon={FaRocket}>
            Simple &amp; Transparent Pricing
          </Badge>

          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-500 text-base sm:text-lg">
              Interested in getting started? Reach out to us directly.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-base font-bold text-white shadow-orange-glow cursor-pointer transition-all duration-200 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #ff6b00 0%, #ff9d00 100%)',
              }}
            >
              <FaHeadset className="text-lg" />
              Contact Us
            </motion.button>
          </div>

          <p className="text-gray-500 text-base sm:text-lg">
            No credit card required. Onboard your society seamlessly with our dedicated team.
          </p>
        </div>

        {/* 3-Step Onboarding Timeline graphic */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 sm:w-full sm:h-0.5 bg-orange-200/50 sm:top-1/2 sm:left-0 sm:-translate-y-1/2 -translate-x-1/2 sm:translate-x-0 -z-10" />

            {ONBOARDING_STEPS.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center bg-transparent p-2 py-4 sm:py-2 z-10">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-orange-200 text-orange-500 flex items-center justify-center text-lg mb-2 shadow-sm">
                  <step.icon />
                </div>
                <span className="text-xs font-bold text-orange-500 tracking-wider uppercase mb-0.5">{step.day}</span>
                <span className="text-base font-semibold text-gray-700">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PRICING_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`rounded-3xl p-8 relative flex flex-col justify-between transition-all duration-300 ${plan.popular
                ? 'bg-white/70 backdrop-blur-xl border-2 border-primary/40 shadow-[0_8px_40px_rgba(255,107,0,0.18)]'
                : 'bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:border-white'
                }`}
            >
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
                  <span className="text-base text-gray-400 font-medium">{plan.period}</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-100 mb-8">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <FaCheck className="text-primary text-[8px]" />
                      </span>
                      <span className="text-base text-gray-600">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  toast.success(plan.price === 'Custom' ? 'Contacting Sales...' : `Starting 30-Day Free Trial for ${plan.name}`)
                }
                className={`w-full py-3 px-6 rounded-full text-base font-semibold transition-all duration-200 cursor-pointer ${plan.popular
                  ? 'bg-primary text-white shadow-orange-glow hover:bg-primary-hover hover:shadow-lg'
                  : 'bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                  }`}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Start 30-Day Free Trial'}
              </button>
            </motion.div>
          ))}
        </div> */}

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
              <p className="text-base text-gray-500">
                Our society expert will conduct a live presentation at your society office or via Zoom.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-6 w-full max-w-sm sm:w-auto sm:mt-0 shrink-0 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
            onClick={() =>
              toast.success(
                'Demo Request Submitted! Our representative will call you shortly.'
              )
            }
          >
            Request On-Site Demo
          </Button>
        </div>
      </Container >

      {/* Contact Us Modal */}
      < AnimatePresence >
        {showContactModal && (
          <motion.div
            key="contact-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              key="contact-modal-card"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                border: '1px solid rgba(255,255,255,0.9)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="px-8 pt-8 pb-6 text-center relative"
                style={{ background: 'linear-gradient(135deg, #ff6b00 0%, #ff9d00 100%)' }}
              >
                <button
                  onClick={() => setShowContactModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors duration-150 cursor-pointer"
                >
                  <FaTimes className="text-sm" />
                </button>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 border border-white/30">
                  <FaHeadset className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Contact Us</h3>
                <p className="text-white/80 text-sm mt-1">We're here to help you get started</p>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6 space-y-5">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    <FaPhone className="text-primary text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                    <a
                      href="tel:+919226605656"
                      className="text-base font-bold text-gray-900 hover:text-primary transition-colors duration-150"
                    >
                      +91 9226605656
                    </a>
                    <p className="text-sm text-gray-500">Tejas Putta</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    <FaEnvelope className="text-primary text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                    <a
                      href="mailto:tejas.p@msquaresoftware.com"
                      className="text-base font-bold text-gray-900 hover:text-primary transition-colors duration-150 break-all"
                    >
                      tejas.p@msquaresoftware.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt className="text-primary text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Address</p>
                    <p className="text-base font-bold text-gray-900">Pune, India</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 pb-8 pt-2">
                <a
                  href="mailto:tejas.p@msquaresoftware.com"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-base font-bold text-white transition-all duration-200 hover:shadow-lg cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #ff6b00 0%, #ff9d00 100%)' }}
                >
                  <FaEnvelope />
                  Send an Email
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >
    </section >
  );
};

export default PricingCTA;

