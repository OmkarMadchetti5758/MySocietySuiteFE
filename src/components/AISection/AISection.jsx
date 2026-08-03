import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { FaRobot, FaSearch, FaMagic, FaArrowRight, FaLightbulb, FaCheckCircle } from 'react-icons/fa';
// import aiSectionImg from '../../assets/images/MySocietySuite_AboutUsAI_Cloud_Section.png';

const AI_SUGGESTIONS = [
    "Show unpaid maintenance bills for Wing A",
    "Generate monthly GST audit report",
    "Check visitor log for Flat 302 yesterday",
    "Draft announcement for lift maintenance on Sunday"
];

const AISection = () => {
    const [query, setQuery] = useState('');
    const [activeAnswer, setActiveAnswer] = useState(null);

    const handleSuggestionClick = (suggestionText) => {
        setQuery(suggestionText);
        setActiveAnswer(`AI Response: Analyzing query "${suggestionText}"... Verified 12 records matching criteria with 99.8% precision.`);
    };

    return (
        <section id="ai-assistant" className="py-20 sm:py-28 bg-gradient-to-b from-light-bg via-orange-50/20 to-white relative overflow-hidden">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* LEFT COLUMN: Content & Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-7 space-y-6"
                    >
                        <Badge variant="primary" icon={FaMagic}>
                            Next-Gen AI Society Copilot
                        </Badge>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-dark leading-tight">
                            Ask AI Anything About Your{' '}
                            <span className="orange-gradient-text">Society Data</span>
                        </h2>

                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                            Our built-in AI Copilot answers financial queries, searches visitor archives, and generates society notices instantly in natural language.
                        </p>

                        {/* Interactive Fake Search Bar */}
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-200 space-y-3">
                            <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                                <FaSearch className="text-gray-400 text-lg" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Ask AI: 'Show defaulter list for July 2026'..."
                                    className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
                                />
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={FaArrowRight}
                                    onClick={() => setActiveAnswer(`AI Response: Query processed. Found 3 entries matching "${query || 'default search'}".`)}
                                >
                                    Ask
                                </Button>
                            </div>

                            {/* Suggestion Pills */}
                            <div>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold mb-2">
                                    <FaLightbulb className="text-amber-500" />
                                    <span>Try asking:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {AI_SUGGESTIONS.map((sug, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(sug)}
                                            className="text-sm px-3 py-1.5 rounded-lg bg-orange-50 text-gray-700 hover:bg-primary hover:text-white transition-all font-medium border border-orange-100/80 text-left"
                                        >
                                            {sug}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Simulated AI Answer Box */}
                            {activeAnswer && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-sm text-emerald-800 flex items-start gap-3"
                                >
                                    <FaCheckCircle className="text-emerald-600 text-base shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold block mb-0.5">Society AI Intelligence</span>
                                        <span>{activeAnswer}</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Robot / AI Graphic */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-5 relative flex justify-center"
                    >
                        <div className="relative w-full max-w-md">
                            {/* Glow background */}
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />

                            {/* Floating Animation Wrapper */}
                            <motion.div
                                animate={{ y: [0, -12, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="relative bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-center space-y-4"
                            >
                                <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-4xl shadow-inner">
                                    <FaRobot />
                                </div>

                                {/* <img
                                    src={aiSectionImg}
                                    alt="AI Assistant Intelligence"
                                    className="w-full h-auto rounded-2xl object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                /> */}

                                <div className="p-3 bg-secondary text-white rounded-xl text-sm flex items-center justify-between font-mono">
                                    <span>● AI Neural Network Active</span>
                                    <span className="text-emerald-400">99.9% Speed</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                </div>
            </Container>
        </section>
    );
};

export default AISection;
