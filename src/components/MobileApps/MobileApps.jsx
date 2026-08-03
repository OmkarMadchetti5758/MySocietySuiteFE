import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import { FaGooglePlay, FaApple, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import robotImg from '../../assets/images/webp/robot.webp';
import androidImg from '../../assets/images/webp/android image.webp';

const AI_PROMPTS = [
  'How much maintenance is pending?',
  'Which residents have not paid?',
  'Show today\'s visitors',
  'Generate monthly report',
  'Book Club House for tomorrow',
];

const MobileApps = () => {
  const [aiQuery, setAiQuery] = useState('');

  return (
    <section id="mobile-apps" className="py-20 bg-white relative overflow-hidden">
      <Container>
        {/* 4-column grid: [text | phones | ai-card | robot] collapsing on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-center">

          {/* ── COL 1: LEFT TEXT + APP STORE BUTTONS ── */}
          <div className="lg:col-span-3 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-dark leading-tight">
              Mobile Apps For{' '}
              <span className="text-[#FF6B00]">Every Role.</span>
            </h2>

            <p className="text-gray-500 text-base leading-relaxed">
              Access everything you need on the go from our powerful mobile apps.
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 pt-1">
              <a
                href="#"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 transition-all"
              >
                <FaGooglePlay className="text-xl text-emerald-400 shrink-0" />
                <div className="text-left">
                  <div className="text-[11px] text-gray-400 uppercase leading-none">GET IT ON</div>
                  <div className="text-base font-bold leading-snug">Google Play</div>
                </div>
              </a>

              <a
                href="#"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 transition-all"
              >
                <FaApple className="text-xl text-white shrink-0" />
                <div className="text-left">
                  <div className="text-[11px] text-gray-400 uppercase leading-none">DOWNLOAD ON THE</div>
                  <div className="text-base font-bold leading-snug">App Store</div>
                </div>
              </a>
            </div>
          </div>

          {/* ── COL 2: PHONES ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-4 flex flex-col items-center justify-center relative z-20"
          >
            <img
              src={androidImg}
              alt="Resident App, Security App and Committee App mockups"
              className="w-full max-w-2xl h-auto object-contain drop-shadow-xl"
            />

            {/* Labels under the phones */}
            <div className="grid grid-cols-3 w-full max-w-2xl mt-3 px-4">
              {['Resident App', 'Security App', 'Committee App'].map((label) => (
                <span
                  key={label}
                  className="text-center text-[13px] font-semibold text-gray-500"
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── COL 3+4: DARK AI CARD + FLOATING ROBOT ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 flex items-center justify-between gap-6"
          >
            {/* Dark AI Card */}
            <div className="flex-1 bg-[#0B0B0B] text-white p-6 rounded-3xl border border-gray-800 space-y-4">
              <div>
                <h3 className="text-xl font-extrabold leading-tight">
                  Meet MySociety{' '}
                  <span className="text-[#FF6B00]">AI</span>
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mt-1">
                  Your smart assistant for instant answers and intelligent insights.
                </p>
              </div>

              {/* Search Input */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] transition-colors"
                />
                <button
                  onClick={() => toast(`AI Query: ${aiQuery || 'Searching society records...'}`)}
                  className="absolute right-2 w-7 h-7 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center text-[10px] hover:bg-orange-600 transition-colors"
                  aria-label="Send AI Query"
                >
                  <FaPaperPlane />
                </button>
              </div>

              {/* Prompt List */}
              <div className="space-y-1.5">
                {AI_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAiQuery(prompt)}
                    className="flex items-center gap-2 w-full text-left text-[11px] text-gray-300 hover:text-white bg-gray-900/60 hover:bg-gray-800 px-3 py-2 rounded-lg border border-gray-800/80 transition-colors"
                  >
                    <span className="w-4 h-4 rounded-full border border-gray-700 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                    </span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Robot — sits completely in the white area to the right */}
            <div className="hidden xl:flex items-center justify-center flex-shrink-0">
              <motion.img
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                src={robotImg}
                alt="MySociety AI Robot"
                className="w-44 lg:w-48 h-auto object-contain drop-shadow-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
};

export default MobileApps;
