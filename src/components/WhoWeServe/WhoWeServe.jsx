import { motion } from 'framer-motion';
import Container from '../common/Container';
import * as FaIcons from 'react-icons/fa';

const AUDIENCES = [
  {
    id: 'residents',
    num: '01',
    numColor: '#3B82F6',
    borderColor: '#DBEAFE',
    badgeBg: '#EFF6FF',
    title: 'Residents & Families',
    subtitle: 'A Better Everyday Living Experience',
    description: 'Everything residents need to stay informed, connected and engaged with their community.',
    features: [
      'Stay updated with society announcements',
      'Access important information and documents',
      'Stay informed about festivals and community events',
      'Raise and track concerns',
      'Discover people, professionals and businesses within the community',
      'Stay connected with society activities',
    ],
    ctaLabel: 'For Residents →',
    ctaColor: '#3B82F6',
  },
  {
    id: 'committee',
    num: '02',
    numColor: '#8B5CF6',
    borderColor: '#EDE9FE',
    badgeBg: '#F5F3FF',
    title: 'Society Management Committee',
    subtitle: 'Manage Your Society With Confidence',
    description: 'A central platform to bring visibility, accountability and control to everyday society management.',
    features: [
      'Manage society operations from one place',
      'Monitor security, cleaning and staff activities',
      'Improve communication with residents',
      'Track maintenance and financial activities',
      'Manage vendors and services',
      'Get meaningful reports and operational insights',
    ],
    ctaLabel: 'For Management Committees →',
    ctaColor: '#8B5CF6',
  },
  {
    id: 'security',
    num: '03',
    numColor: '#F97316',
    borderColor: '#FED7AA',
    badgeBg: '#FFF7ED',
    title: 'Security & Gate Teams',
    subtitle: 'Safer Gates. Better Accountability.',
    description: 'Help security teams manage everyday gate operations while giving management better visibility.',
    features: [
      'Visitor and vehicle management',
      'Staff and watchman attendance',
      'Gate activity monitoring',
      'Pre-approved entries',
      'Security records and activity history',
      'Better accountability at the gate',
    ],
    ctaLabel: 'For Security Teams →',
    ctaColor: '#F97316',
  },
  {
    id: 'staff',
    num: '04',
    numColor: '#22C55E',
    borderColor: '#DCFCE7',
    badgeBg: '#F0FDF4',
    title: 'Housekeeping & Society Staff',
    subtitle: 'Cleaner Communities. Accountable Teams.',
    description: 'Bring structure and visibility to the people responsible for keeping the society clean and operational.',
    features: [
      'Daily cleaning schedules',
      'Area-wise responsibilities',
      'Staff attendance',
      'Activity tracking',
      'Supervisor verification',
      'Cleaning performance visibility',
    ],
    ctaLabel: 'For Society Staff →',
    ctaColor: '#22C55E',
  },
  {
    id: 'vendors',
    num: '05',
    numColor: '#06B6D4',
    borderColor: '#CFFAFE',
    badgeBg: '#ECFEFF',
    title: 'Vendors & Service Providers',
    subtitle: 'Better Coordination. Better Service.',
    description: 'Make it easier for societies to manage the external partners who support everyday operations.',
    features: [
      'Vendor profiles and records',
      'Service assignments',
      'Contract visibility',
      'Service coordination',
      'Payment and service tracking',
      'Better communication with management',
    ],
    ctaLabel: 'For Vendors & Service Providers →',
    ctaColor: '#06B6D4',
  },
  {
    id: 'builders',
    num: '06',
    numColor: '#EC4899',
    borderColor: '#FCE7F3',
    badgeBg: '#FDF2F8',
    title: 'Builders & Community Developers',
    subtitle: 'A Smarter Digital Experience for Every Community',
    description: 'Give new and existing residential communities a structured digital platform for managing operations and engaging residents.',
    features: [
      'Digital community management',
      'Resident engagement',
      'Security and gate operations',
      'Staff management',
      'Communication and announcements',
      'A modern resident experience',
    ],
    ctaLabel: 'For Developers →',
    ctaColor: '#EC4899',
  }
];

const WhoWeServe = () => {
  return (
    <section id="who-we-serve" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Decorative bg blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[100px] pointer-events-none translate-x-1/2 translate-y-1/2" />

      <Container>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black tracking-[0.2em] text-[#FF6B00] uppercase flex items-center justify-center gap-2">
            <span className="text-base">✦</span> WHO WE SERVE <span className="text-base">✦</span>
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Built for Everyone Who Makes a <br className="hidden sm:block" />
            <span className="text-[#FF6B00]">Society Work.</span>
          </h2>

          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
            One connected platform for residents, management committees, security teams, staff, vendors and the people who keep the community running every day.
            <br className="hidden sm:block mt-2" />
            <span className="font-medium text-gray-800 mt-2 block">MySocietySuite brings everyone onto one platform — making society life safer, simpler, more transparent and more connected.</span>
          </p>
        </div>

        {/* 3-Column Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AUDIENCES.map((audience, idx) => (
            <motion.div
              key={audience.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-2xl border p-8 flex flex-col h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative group overflow-hidden"
              style={{ borderColor: audience.borderColor }}
            >
              {/* Top Accent Line */}
              <div 
                className="absolute top-0 left-0 w-full h-1 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" 
                style={{ backgroundColor: audience.numColor }} 
              />
              
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: audience.badgeBg, color: audience.numColor }}
                >
                  {audience.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight flex-1">
                  {audience.title}
                </h3>
              </div>

              <div className="mb-6">
                <h4 className="text-[15px] font-semibold text-gray-800 mb-2">{audience.subtitle}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{audience.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {audience.features.map((feat, fi) => (
                  <li key={fi} className="flex items-start gap-3 text-sm text-gray-600">
                    <span
                      className="mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: audience.numColor }}
                    >
                      <FaIcons.FaCheck className="text-[8px]" style={{ color: audience.numColor }} />
                    </span>
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-6 mt-auto border-t border-gray-100">
                <button 
                  className="text-sm font-bold flex items-center gap-2 group/btn transition-colors hover:opacity-80"
                  style={{ color: audience.ctaColor }}
                >
                  {audience.ctaLabel}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 bg-gray-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3B82F6]/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              One Society. Many People. <br className="hidden md:block" />
              <span className="text-[#FF6B00]">One Connected Platform.</span>
            </h3>
            
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              From the resident entering through the gate to the security guard managing access, the housekeeping team maintaining the premises, the committee managing operations and the vendor delivering services — MySocietySuite connects everyone who keeps the community moving.
            </p>

            <div className="flex flex-wrap justify-center gap-4 md:gap-12 pt-6 pb-8">
              <div className="text-white font-semibold text-lg flex items-center gap-2">
                <FaIcons.FaUsers className="text-[#FF6B00]" /> Everyone has a role.
              </div>
              <div className="text-white font-semibold text-lg flex items-center gap-2">
                <FaIcons.FaLink className="text-[#3B82F6]" /> Everyone stays connected.
              </div>
              <div className="text-white font-semibold text-lg flex items-center gap-2">
                <FaIcons.FaSmile className="text-[#22C55E]" /> Everyone benefits.
              </div>
            </div>

            <button className="bg-[#FF6B00] hover:bg-[#E66000] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-[#FF6B00]/30 inline-flex items-center gap-2">
              See How MySocietySuite Works <FaIcons.FaArrowRight className="text-sm" />
            </button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default WhoWeServe;
