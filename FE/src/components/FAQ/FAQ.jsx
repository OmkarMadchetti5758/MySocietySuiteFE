import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../common/Container';
import Badge from '../common/Badge';
import { FaQuestionCircle, FaChevronDown } from 'react-icons/fa';

const FAQ_DATA = [
  {
    id: 1,
    question: 'How long does it take to onboard our society?',
    answer: 'With our dedicated onboarding team, we can get your society up and running in less than 24 hours. This includes importing resident data, setting up maintenance billing, and configuring your gate security rules.',
  },
  {
    id: 2,
    question: 'Is our society and resident data secure?',
    answer: 'Absolutely. We use bank-grade encryption and host all data on secure AWS servers in India. We are fully compliant with Indian data privacy regulations, ensuring your data is never shared or sold to third parties.',
  },
  {
    id: 3,
    question: 'Can we integrate with Tally for accounting?',
    answer: 'Yes! Our Growth and Enterprise plans include seamless auto-reconciliation with Tally and major banks, saving your committee hours of manual data entry every month.',
  },
  {
    id: 4,
    question: 'What happens if we want to cancel?',
    answer: 'We believe in earning your trust every month. You can cancel at any time with no lock-in periods or hidden cancellation fees. Plus, you can easily export all your data before leaving.',
  },
  {
    id: 5,
    question: 'Do you provide on-site training for guards and staff?',
    answer: 'Yes. Our team provides comprehensive virtual training for all plans, and on-site training for guards and facility staff under our Enterprise plan to ensure smooth adoption.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 bg-white relative">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <Badge variant="light" icon={FaQuestionCircle}>
            Frequently Asked Questions
          </Badge>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Got Questions? <span className="orange-gradient-text">We've Got Answers.</span>
          </h2>

          <p className="text-gray-500 text-base">
            Everything you need to know about pricing, onboarding, and how MySocietySuite can transform your community.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id}
                className={`mb-4 border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-orange-200 shadow-sm bg-orange-50/30' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex items-center justify-between w-full p-6 text-left focus:outline-none"
                >
                  <span className={`text-base sm:text-lg font-bold ${isOpen ? 'text-[#FF6B00]' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-[#FF6B00] text-white rotate-180' : 'bg-gray-50 text-gray-400'
                    }`}>
                    <FaChevronDown className="text-xs" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed text-base sm:text-base border-t border-orange-100/50 pt-4 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default FAQ;
