import { motion } from 'framer-motion';
import Container from '../common/Container';
import { TIMELINE_STEPS } from '../../data/timeline';
import * as FaIcons from 'react-icons/fa';

const Timeline = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50/60 relative">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Title */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-base font-black tracking-widest text-[#FF6B00] uppercase flex items-center gap-1">
              <span className="text-[10px]">■</span> HOW IT WORKS?
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-dark leading-tight">
              A Seamless Experience For <span className="text-[#FF6B00]">Everyone.</span>
            </h2>

            <p className="text-gray-500 text-base leading-relaxed">
              MySocietySuite brings every activity and every person together in a connected ecosystem.
            </p>

            <a href="#features" className="inline-flex items-center gap-1.5 text-base font-bold text-[#FF6B00] hover:underline pt-2">
              <span>Explore All Features</span>
              <span>→</span>
            </a>
          </div>

          {/* Right Horizontal Steps */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative">
              {TIMELINE_STEPS.map((step, index) => {
                const IconComponent = FaIcons[step.iconName] || FaIcons.FaUser;

                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="flex flex-col items-center text-center relative group"
                  >
                    {/* Circle Icon Wrapper */}
                    <div className="w-14 h-14 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 text-lg mb-3 relative group-hover:border-[#FF6B00] group-hover:text-[#FF6B00] transition-all">
                      <IconComponent />
                    </div>

                    {/* Step Number */}
                    <span className="text-[11px] font-black text-[#FF6B00] mb-1">
                      {step.step}
                    </span>

                    {/* Title */}
                    <h4 className="text-base font-bold text-gray-800 leading-tight">
                      {step.title}
                    </h4>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default Timeline;
