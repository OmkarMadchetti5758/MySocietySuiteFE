import React from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import { TESTIMONIALS_DATA } from '../../data/testimonials';
import { FaStar, FaArrowRight } from 'react-icons/fa';

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-white relative">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT 8 COLS: Testimonials */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-dark leading-tight">
              Loved by Communities.<br />
              Trusted by <span className="text-[#FF6B00]">Thousands.</span>
            </h2>

            {/* 3 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {TESTIMONIALS_DATA.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-1 text-amber-400 text-sm mb-3">
                      {[...Array(item.rating)].map((_, i) => (
                        <FaStar key={i} />
                      ))}
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">
                      "{item.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-none">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT 4 COLS: Pricing CTA Block */}
          <div className="lg:col-span-4 bg-orange-50/50 border border-orange-100 rounded-3xl p-8 space-y-6 text-left">
            <h2 className="text-3xl font-extrabold text-text-dark leading-tight">
              Simple Pricing.<br />
              <span className="text-[#FF6B00]">Transparent Plans.</span>
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              Flexible plans for every type of society.
            </p>

            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-[#FF6B00] text-white hover:bg-orange-600 transition-all font-bold text-sm shadow-orange-glow"
            >
              <span>View Pricing Plans</span>
              <FaArrowRight />
            </a>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default Testimonials;
