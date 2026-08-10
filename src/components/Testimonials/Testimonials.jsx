import React from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import { TESTIMONIALS_DATA } from '../../data/testimonials';
import { FaStar } from 'react-icons/fa';

// Generate more duplicated items for a seamless marquee effect
const MARQUEE_ITEMS = [...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA];

// Dummy logos for the logo wall
const SOCIETY_LOGOS = [
  'Green Valley',
  'Sunrise Residency',
  'Elite Heights',
  'Palm Springs',
  'Royal Enclave',
  'Lakeview Apartments',
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-white relative overflow-hidden">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-base font-black tracking-widest text-[#FF6B00] uppercase flex items-center justify-center gap-1">
            <span className="text-[10px]">■</span> SOCIAL PROOF
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Loved by Communities.<br />
            Trusted by <span className="text-[#FF6B00]">Thousands.</span>
          </h2>

          <p className="text-gray-500 text-base max-w-lg mx-auto">
            See what committee members and residents have to say about their experience with MySocietySuite.
          </p>
        </div>
      </Container>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Fade gradients on edges */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
        >
          {MARQUEE_ITEMS.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="w-[350px] sm:w-[450px] bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between shrink-0"
            >
              <div>
                <div className="flex gap-1 text-amber-400 text-base mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8 italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                />
                <div>
                  <h4 className="text-base font-bold text-gray-900 leading-none mb-1">{item.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section >
  );
};

export default Testimonials;
