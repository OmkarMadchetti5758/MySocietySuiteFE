import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { TRUSTED_AVATARS } from '../../data/navigation';
import { FaCheckCircle, FaPlay, FaArrowRight } from 'react-icons/fa';

import banner1 from '../../assets/images/webp/Hero1.webp';
import banner2 from '../../assets/images/webp/Hero2.webp';
import banner3 from '../../assets/images/webp/Hero3.webp';

const SLIDES = [
  {
    id: 1,
    badge: "⭐ India's Most Trusted Society Management Platform",
    title: <>One Platform. Every Society. <span className="text-[#FF6B00]">Every Resident.</span></>,
    subtitle: "Simplify management, enhance communication, and elevate living experiences with MySocietySuite.",
    primaryCta: "Start Free Trial",
    secondaryCta: "Book a Demo",
    features: ["Easy to Use", "Secure & Reliable", "Loved by Communities"],
    hasAvatars: true,
    image: banner1,
    layout: 'split',
    // ── Customize Hero1.png (bannerIsoImg) independently ──
    imageClassName: "absolute inset-0 w-full h-full object-cover object-top sm:object-center sm:w-200 sm:ml-150",
    imageStyle: { objectPosition: 'center center' },
  },
  {
    id: 2,
    badge: "ABOUT US",
    title: <>Building Better Communities Through <span className="text-[#FF6B00]">Technology.</span></>,
    subtitle: "MySocietySuite is transforming the way residential communities communicate, collaborate and grow together.",
    primaryCta: "Book Demo",
    secondaryCta: "Contact Us",
    features: ["Automated Gate Security", "Financial Audit Transparency", "Instant Broadcast Notices"],
    hasAvatars: false,
    image: banner2,
    layout: 'banner-bg',
    imageClassName: "absolute inset-0 w-full h-full object-cover object-center",
    imageStyle: {},
  },
  {
    id: 3,
    badge: "BETTER LIVING",
    title: <>Stronger Communities. <span className="text-[#FF6B00]">Happier Together.</span></>,
    subtitle: "From secure living to seamless management, we help communities thrive every day.",
    primaryCta: "Explore Apps",
    secondaryCta: "Schedule Demo",
    featurePills: ["Connect Better", "Live Safer", "Manage Easier", "Experience More"],
    hasAvatars: false,
    image: banner3,
    layout: 'split',
    imageClassName: "absolute inset-0 w-full h-full object-cover object-center sm:ml-50",
    imageStyle: {},
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <section className="relative bg-[#0B0B0B] text-white overflow-hidden min-h-[600px] flex flex-col">

      {/* ── FULL-BLEED BACKGROUND IMAGE ── */}
      <AnimatePresence mode="wait">
        <motion.img
          key={slide.id + '-bg'}
          src={slide.image}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className={slide.imageClassName}
          style={slide.imageStyle}
        />
      </AnimatePresence>

      {/* ── GRADIENT OVERLAY: dark on left → transparent on right ── */}
      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/90 sm:via-[#0B0B0B]/85 via-50% to-transparent pointer-events-none" />
      {/* subtle top + bottom fade for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/40 via-transparent to-[#0B0B0B]/60 pointer-events-none" />

      {/* ── CONTENT: sits on top, left-aligned ── */}
      <div className="relative z-10 flex flex-col justify-end sm:justify-center flex-1 px-6 sm:px-14 xl:px-20 py-14 pb-20 sm:pb-14 mt-32 sm:mt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-5 max-w-full sm:max-w-[75%] lg:max-w-[55%]"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[#FF6B00] text-sm font-bold uppercase tracking-wider backdrop-blur-sm">
              {slide.badge}
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.1] drop-shadow-lg">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-gray-200 text-base sm:text-[15px] leading-relaxed max-w-sm drop-shadow">
              {slide.subtitle}
            </p>

            {/* Optional Bullets */}
            {slide.features && (
              <div className="flex flex-wrap gap-3 text-base font-semibold text-gray-200">
                {slide.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <FaCheckCircle className="text-orange-500" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Optional Feature Pills */}
            {slide.featurePills && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-w-lg">
                {slide.featurePills.map((pill, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md px-0 py-2 rounded-xl text-center text-base font-bold text-white border border-white/10">
                    {pill}
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="lg"
                icon={FaArrowRight}
                iconPosition="right"
                className="rounded-full shadow-orange-glow px-7 py-3 text-base font-bold"
                onClick={() => {
                  const el = document.getElementById('pricing');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {slide.primaryCta}
              </Button>

              <button
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/40 bg-black/30 backdrop-blur-sm text-white hover:bg-white/10 transition-all text-base font-semibold"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>{slide.secondaryCta}</span>
                {slide.id === 1 && (
                  <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[8px] pl-0.5">
                    <FaPlay />
                  </span>
                )}
              </button>
            </div>

            {/* Avatars */}
            {slide.hasAvatars && (
              <div className="pt-1 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {TRUSTED_AVATARS.slice(0, 3).map((avatar, idx) => (
                    <img
                      key={idx}
                      src={avatar.image}
                      alt={avatar.name}
                      className="w-7 h-7 rounded-full border border-gray-700 object-cover"
                    />
                  ))}
                </div>
                <p className="text-base text-gray-300">
                  Trusted by <strong className="text-white font-semibold">500+ Societies & 10,000+ Families</strong>
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* SLIDE DOTS */}
        <div className="mt-8 flex items-center gap-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all rounded-full ${currentSlide === idx
                ? 'w-8 h-2.5 bg-[#FF6B00]'
                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
