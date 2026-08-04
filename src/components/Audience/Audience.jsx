import React from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import { AUDIENCE_DATA } from '../../data/audience';
import * as FaIcons from 'react-icons/fa';

const Audience = () => {
  return (
    <section id="features" className="py-20 bg-white relative">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-12">
          {/* Left Title Header */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-base font-black tracking-widest text-[#FF6B00] uppercase flex items-center gap-1">
              <span className="text-[10px]">■</span> WHY MYSOCIETY SUITE?
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-dark leading-tight">
              Built for Every Community.<br />
              Designed for <span className="text-[#FF6B00]">Every Need.</span>
            </h2>

            <p className="text-gray-500 text-base leading-relaxed pt-1">
              From residents to management committee, everyone gets the right tools to connect, manage and grow together.
            </p>
          </div>

          {/* Right Bento Box Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[140px]">
            {AUDIENCE_DATA.map((item, index) => {
              const IconComponent = FaIcons[item.iconName] || FaIcons.FaUser;
              // Make the first item a large feature card
              const isLarge = index === 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-orange-200 transition-all group overflow-hidden relative flex flex-col justify-center ${isLarge
                      ? 'sm:col-span-2 sm:row-span-2 items-start'
                      : 'items-center text-center'
                    }`}
                >
                  {/* Decorative background element for large card */}
                  {isLarge && (
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
                  )}

                  <div
                    className={`rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${isLarge ? 'w-16 h-16 text-3xl' : 'w-12 h-12 text-xl'
                      }`}
                  >
                    <IconComponent />
                  </div>

                  <h3
                    className={`font-bold text-gray-900 mb-1 ${isLarge ? 'text-2xl mt-4' : 'text-base'
                      }`}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`text-gray-500 ${isLarge ? 'text-base max-w-xs' : 'text-base'
                      }`}
                  >
                    {item.subtitle}
                  </p>

                  {/* Additional visual for large card */}
                  {isLarge && (
                    <div className="mt-6 flex items-center gap-2 text-base font-semibold text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Explore features</span>
                      <FaIcons.FaArrowRight className="text-xs" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Audience;
