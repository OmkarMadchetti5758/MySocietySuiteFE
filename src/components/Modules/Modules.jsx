import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import { MODULES_DATA } from '../../data/modules';
import * as FaIcons from 'react-icons/fa';

const INITIAL_COUNT = 10;

const ModuleCard = ({ module, index }) => {
  const IconComponent = FaIcons[module.iconName] || FaIcons.FaCubes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: (index % INITIAL_COUNT) * 0.04 }}
      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-orange-100 transition-all duration-300 flex flex-col group cursor-default"
    >
      {/* Number + Icon row */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-300"
          style={{ background: `${module.iconColor}18`, color: module.iconColor }}
        >
          <IconComponent />
        </div>
        <span
          className="text-2xl font-black tabular-nums leading-none"
          style={{ color: module.iconColor, opacity: 0.18 }}
        >
          {module.num}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#FF6B00] transition-colors duration-200">
        {module.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed flex-1">
        {module.description}
      </p>

      {/* Explore link */}
      <div className="mt-4 flex items-center gap-1.5 text-sm font-bold text-[#FF6B00]">
        <span>Explore</span>
        <FaIcons.FaArrowRight className="text-[10px]" />
      </div>
    </motion.div>
  );
};

const Modules = () => {
  const [expanded, setExpanded] = useState(false);

  const visibleModules = expanded ? MODULES_DATA : MODULES_DATA.slice(0, INITIAL_COUNT);
  const hiddenCount = MODULES_DATA.length - INITIAL_COUNT;

  return (
    <section id="modules" className="py-20 bg-[#f9f9fb] relative overflow-hidden">
      {/* Subtle bg blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-400/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400/5 rounded-full blur-[80px] pointer-events-none" />

      <Container>
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-black tracking-[0.2em] text-[#FF6B00] uppercase flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] inline-block" />
            OUR MODULES
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
            15 Core Modules to Run Your Society Effortlessly
          </h2>

          <p className="text-gray-500 text-base leading-relaxed">
            From security to accounts, communication to community events,<br className="hidden sm:block" />
            MySocietySuite covers everything your society needs.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {visibleModules.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} />
          ))}
        </div>

        {/* Explore More / Collapse Button */}
        <div className="flex justify-center mt-10">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-base font-bold border-2 border-[#FF6B00] text-[#FF6B00] bg-white hover:bg-[#FF6B00] hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
          >
            {expanded ? (
              <>
                <FaIcons.FaChevronUp className="text-sm" />
                Show Less
              </>
            ) : (
              <>
                <FaIcons.FaThLarge className="text-sm" />
                Explore More Modules
                <FaIcons.FaChevronDown className="text-sm" />
              </>
            )}
          </motion.button>
        </div>
      </Container>
    </section>
  );
};

export default Modules;
