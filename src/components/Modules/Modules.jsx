import React from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import { MODULES_DATA } from '../../data/modules';
import * as FaIcons from 'react-icons/fa';

const Modules = () => {
  return (
    <section id="modules" className="py-20 bg-white relative">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-base font-black tracking-widest text-[#FF6B00] uppercase flex items-center justify-center gap-1">
            <span className="text-[10px]">■</span> POWERFUL MODULES
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-dark leading-tight">
            All the Tools You Need.<br />
            In One <span className="text-[#FF6B00]">Powerful Platform.</span>
          </h2>
        </div>

        {/* 10 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 pb-8">
          {MODULES_DATA.map((module, index) => {
            const IconComponent = FaIcons[module.iconName] || FaIcons.FaCubes;
            // Create a staggered masonry-like effect by pushing down alternating columns on desktop
            const colIndex = index % 5;
            const offsetClass = colIndex % 2 !== 0 ? 'lg:translate-y-8' : '';

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative ${offsetClass}`}
              >
                {/* Decorative hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${module.iconBg} flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#FF6B00] transition-colors">
                    {module.title}
                  </h3>

                  <p className="text-base text-gray-500 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                    {module.description}
                  </p>
                </div>

                <div className="pt-5 flex justify-start relative z-10">
                  <div className="flex items-center gap-2 text-base font-bold text-[#FF6B00] opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <span>Learn more</span>
                    <FaIcons.FaArrowRight className="text-xs" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default Modules;
