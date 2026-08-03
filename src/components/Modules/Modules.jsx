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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {MODULES_DATA.map((module, index) => {
            const IconComponent = FaIcons[module.iconName] || FaIcons.FaCubes;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${module.iconBg} flex items-center justify-center text-lg mb-4`}>
                    <IconComponent />
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-[#FF6B00] transition-colors">
                    {module.title}
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="pt-4 flex justify-start">
                  <span className="text-2xl font-bold text-[#FF6B00] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
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
