import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import Badge from '../common/Badge';
import {
  FaMagic,
  FaArrowRight,
  FaShieldAlt,
  FaChevronRight,
  FaListAlt,
  FaChartBar,
  FaUserAlt,
  FaBullhorn,
  FaBolt,
} from 'react-icons/fa';

const SUGGESTION_CARDS = [
  {
    id: 1,
    text: 'How can we make community events better?',
    icon: FaListAlt,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 2,
    text: 'Is my society cleaned every day?',
    icon: FaChartBar,
    iconBg: 'bg-green-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 3,
    text: 'Check visitor log for Flat 302 yesterday',
    icon: FaUserAlt,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
  {
    id: 4,
    text: 'Is my society secure and staff accountable?',
    icon: FaBullhorn,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
];

const AISection = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('try');

  const handleSuggestionClick = (text) => setQuery(text);

  return (
    <section
      id="ai-assistant"
      className="py-20 sm:py-28 bg-[#f8f8fb] relative overflow-hidden"
    >
      {/* Subtle decorative glow */}
      <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/20 rounded-full blur-[100px] pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* ── LEFT: Text Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <Badge variant="primary" icon={FaMagic}>
              Next-Gen AI Society Copilot
            </Badge>

            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              Ask AI Anything About Your{' '}
              <span className="orange-gradient-text">Society Data</span>
            </h2>

            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-md">
              Our built-in AI Copilot answers financial queries, searches visitor archives,
              and generates society notices instantly in natural language.
            </p>
          </motion.div>

          {/* ── RIGHT: Interactive AI Card ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_48px_rgba(0,0,0,0.09)] p-5 space-y-4">

              {/* Search Bar */}
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <FaMagic className="text-purple-500 text-xs" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask AI anything about your society..."
                  className="flex-1 bg-transparent text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                />
                <button
                  onClick={() => { }}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 hover:bg-primary-hover transition-colors cursor-pointer"
                  style={{ boxShadow: '0 4px 14px rgba(255,107,0,0.35)' }}
                >
                  <FaArrowRight className="text-white text-xs" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('try')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-base font-semibold transition-all cursor-pointer ${activeTab === 'try'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <FaBolt className="text-[10px]" />
                  Try asking
                </button>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-base font-semibold transition-all cursor-pointer ${activeTab === 'suggestions'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <span className="text-amber-400 text-xs">✦</span>
                  Suggestions for you
                </button>
              </div>

              {/* 2×2 Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTION_CARDS.map((card, idx) => (
                  <motion.button
                    key={card.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(card.text)}
                    className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100/80 border border-gray-100 rounded-2xl p-4 text-left transition-all group cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}
                    >
                      <card.icon className={`${card.iconColor} text-base`} />
                    </div>
                    <span className="text-base text-gray-700 font-medium leading-snug flex-1">
                      {card.text}
                    </span>
                    <FaChevronRight className="text-gray-300 text-[10px] group-hover:text-gray-500 transition-colors shrink-0" />
                  </motion.button>
                ))}
              </div>

              {/* Security Footer */}
              <div className="flex items-center justify-center gap-2 pt-1 pb-0.5">
                <FaShieldAlt className="text-gray-300 text-base" />
                <span className="text-xs text-gray-400 font-medium">
                  Your data is secure and private
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
};

export default AISection;
