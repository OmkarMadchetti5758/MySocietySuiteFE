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
          </div>

          {/* Right Horizontal Steps */}
          <div className="lg:col-span-8">
            <div className="relative flex flex-col sm:flex-row justify-between">
              {/* Connecting Line (Horizontal on Desktop, Vertical on Mobile) */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-orange-100 sm:left-0 sm:right-0 sm:top-7 sm:bottom-auto sm:h-0.5 sm:w-full z-0 pointer-events-none hidden sm:block">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                  className="h-full bg-[#FF6B00]"
                />
              </div>

              {/* Steps */}
              {TIMELINE_STEPS.map((step, index) => {
                const IconComponent = FaIcons[step.iconName] || FaIcons.FaUser;
                const isGreenHover = step.iconName === 'FaCheckCircle';

                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.15 }}
                    className="flex flex-row sm:flex-col items-center sm:text-center relative z-10 group mb-6 sm:mb-0 flex-1 px-2"
                  >
                    {/* Circle Icon Wrapper */}
                    {/* <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-orange-100 shadow-sm flex items-center justify-center text-gray-400 text-lg sm:mb-4 relative group-hover:border-[#FF6B00] group-hover:text-[#FF6B00] transition-colors shrink-0">
                      <IconComponent />
                    </div> */}
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-orange-100 shadow-sm flex items-center justify-center text-gray-400 text-lg sm:mb-4 relative transition-colors shrink-0 ${isGreenHover
                        ? 'group-hover:border-green-500 group-hover:text-green-500'
                        : 'group-hover:border-[#FF6B00] group-hover:text-[#FF6B00]'
                        }`}
                    >
                      <IconComponent />
                    </div>

                    <div className="ml-4 sm:ml-0 flex flex-col sm:items-center">
                      {/* Step Number */}
                      <span className="text-[10px] font-black tracking-wider text-[#FF6B00] mb-1">
                        STEP {step.step}
                      </span>

                      {/* Title */}
                      <h4 className="text-base font-bold text-gray-800 leading-tight">
                        {step.title}
                      </h4>
                    </div>
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
