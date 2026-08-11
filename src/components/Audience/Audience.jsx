import { motion } from 'framer-motion';
import Container from '../common/Container';
import * as FaIcons from 'react-icons/fa';

import highlight1 from '../../assets/images/webp/highlight1.webp';
import highlight2 from '../../assets/images/webp/highlight2.webp';
import highlight3 from '../../assets/images/webp/highlight3.webp';
import highlight4 from '../../assets/images/webp/highlight4.webp';

const HIGHLIGHTS = [
  {
    id: 'security',
    num: '01',
    numColor: '#3B82F6',
    borderColor: '#DBEAFE',
    badgeBg: '#EFF6FF',
    image: highlight1,
    imageAlt: 'Security & Staff Attendance',
    title: 'Security & Staff Attendance',
    description:
      'Safer gates, verified visitors and accountable staff attendance — all in one connected system.',
    features: [
      'Visitor & vehicle entry management',
      'Gate activity monitoring',
      'Watchman & staff attendance',
      'Shift & duty visibility',
      'Real-time alerts & activity logs',
    ],
    ctaLabel: 'Explore Security',
    ctaColor: '#3B82F6',
    ctaBorder: '#BFDBFE',
  },
  {
    id: 'cleaning',
    num: '02',
    numColor: '#22C55E',
    borderColor: '#DCFCE7',
    badgeBg: '#F0FDF4',
    image: highlight2,
    imageAlt: 'Smart Cleaning Management',
    title: 'Smart Cleaning Management',
    description:
      "Know what's cleaned, what's pending and where attention is needed.",
    features: [
      'Area-wise cleaning schedules',
      'Daily task tracking',
      'Staff attendance & allocation',
      'Supervisor verification',
      'Cleanliness reports & insights',
    ],
    ctaLabel: 'Explore Cleaning',
    ctaColor: '#22C55E',
    ctaBorder: '#BBF7D0',
  },
  {
    id: 'events',
    num: '03',
    numColor: '#F97316',
    borderColor: '#FED7AA',
    badgeBg: '#FFF7ED',
    image: highlight3,
    imageAlt: 'Festival & Community Events',
    title: 'Festival & Community Events',
    description:
      'Celebrate together with well-organized festivals, events and community activities.',
    features: [
      'Festival calendar & schedule',
      'Event announcements',
      'Activity details & timings',
      'Resident participation info',
      'Stay updated & engaged',
    ],
    ctaLabel: 'Explore Events',
    ctaColor: '#F97316',
    ctaBorder: '#FDBA74',
  },
  {
    id: 'networking',
    num: '04',
    numColor: '#8B5CF6',
    borderColor: '#EDE9FE',
    badgeBg: '#F5F3FF',
    image: highlight4,
    imageAlt: 'Society Member Networking',
    title: 'Society Member Networking',
    description:
      'Discover professionals, businesses and skills within your own community.',
    features: [
      'Member professional directory',
      'Business & service discovery',
      'Skills & expertise search',
      'Connect & collaborate',
      'Stronger community network',
    ],
    ctaLabel: 'Explore Networking',
    ctaColor: '#8B5CF6',
    ctaBorder: '#C4B5FD',
  },
];

const Audience = () => {
  return (
    <section id="features" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative bg blobs */}
      <div className="absolute -top-24 left-1/4 w-72 h-72 bg-orange-400/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-blue-400/5 rounded-full blur-[80px] pointer-events-none" />

      <Container>
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-black tracking-[0.2em] text-[#FF6B00] uppercase flex items-center justify-center gap-2">
            <span className="text-base">✦</span> OUR DIFFERENTIATORS <span className="text-base">✦</span>
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
            4 Highlight Features That Build a{' '}
            <span className="text-[#FF6B00]">Better Community</span>
          </h2>

          <p className="text-gray-500 text-base leading-relaxed">
            Beyond everyday management, MySocietySuite focuses on the things<br className="hidden sm:block" />
            that truly make your society safer, cleaner and more connected.
          </p>
        </div>

        {/* 4-Column Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {HIGHLIGHTS.map((h, idx) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white rounded-2xl border flex flex-col overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ borderColor: h.borderColor }}
            >
              {/* Image */}
              <div
                className="w-full flex items-center justify-center py-6 px-4"
                style={{ background: h.badgeBg }}
              >
                <img
                  src={h.image}
                  alt={h.imageAlt}
                  className="w-full max-w-[180px] h-36 object-contain drop-shadow-sm"
                />
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-5 gap-3">
                {/* Number + Title */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-base font-black leading-none"
                    style={{ color: h.numColor }}
                  >
                    {h.num}
                  </span>
                  <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
                    {h.title}
                  </h3>
                </div>

                {/* Divider */}
                <div className="h-px w-8" style={{ background: h.numColor, opacity: 0.4 }} />

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed">{h.description}</p>

                {/* Feature bullets */}
                <ul className="space-y-1.5 flex-1">
                  {h.features.map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-sm text-gray-600">
                      <span
                        className="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: h.numColor }}
                      >
                        <FaIcons.FaCheck className="text-[7px]" style={{ color: h.numColor }} />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>


              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Audience;
