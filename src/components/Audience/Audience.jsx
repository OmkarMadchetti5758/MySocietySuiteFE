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
          <div className="lg:col-span-5 space-y-3">
            <span className="text-sm font-black tracking-widest text-[#FF6B00] uppercase flex items-center gap-1">
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

          {/* Right 6 Persona Cards */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {AUDIENCE_DATA.map((item, index) => {
              const IconComponent = FaIcons[item.iconName] || FaIcons.FaUser;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all text-center flex flex-col items-center justify-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                    <IconComponent />
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {item.subtitle}
                  </p>
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
