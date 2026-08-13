import React from 'react';
import Container from '../common/Container';
import { FaUsers, FaBuilding, FaShieldAlt, FaHome, FaCity, FaArrowRight, FaSlidersH, FaHeadset, FaLeaf } from 'react-icons/fa';
import { MdOutlineSecurity } from 'react-icons/md';

import WWS_Hero from '../../assets/images/webp/WWS-Hero.webp';
import WWS1 from '../../assets/images/webp/WWS1.webp';
import WWS2 from '../../assets/images/webp/WWS2.webp';
import WWS3 from '../../assets/images/webp/WWS3.webp';
import WWS4 from '../../assets/images/webp/WWS4.webp';
import WWS5 from '../../assets/images/webp/WWS5.webp';
import WWS6 from '../../assets/images/webp/WWS6.webp';

const COMMUNITIES = [
  {
    image: WWS1,
    icon: <FaBuilding />,
    title: 'Apartment & Residential Societies',
    description: 'Perfect for apartment and residential societies managing everyday operations, communication, maintenance and community activities.',
    borderColor: '#3B82F6',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
  },
  {
    image: WWS2,
    icon: <FaCity />,
    title: 'High-Rise Communities',
    description: 'Designed to handle the unique needs of high-rise living—from multi-level security and facility management to communication and resident services.',
    borderColor: '#FF6B00',
    iconColor: '#FF6B00',
    iconBg: '#FFF3EA',
  },
  {
    image: WWS3,
    icon: <MdOutlineSecurity />,
    title: 'Gated Communities',
    description: 'Streamline gate operations, visitor management, staff coordination and maintenance—ensuring a safe and well-managed community.',
    borderColor: '#8B5CF6',
    iconColor: '#8B5CF6',
    iconBg: '#F5F3FF',
  },
  {
    image: WWS4,
    icon: <FaHome />,
    title: 'Villa & Row House Communities',
    description: 'Manage common amenities, staff, maintenance and communication effortlessly for villa and row house communities.',
    borderColor: '#F59E0B',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
  },
  {
    image: WWS5,
    icon: <FaBuilding />,
    title: 'Large Residential Communities & Townships',
    description: 'Built to support large communities with multiple blocks, amenities, teams and thousands of residents.',
    borderColor: '#FF6B00',
    iconColor: '#FF6B00',
    iconBg: '#FFF3EA',
  },
  {
    image: WWS6,
    icon: <FaUsers />,
    title: 'Cooperative Housing Societies',
    description: 'A complete digital solution for cooperative housing societies to manage administration, records, finance and resident services.',
    borderColor: '#EF4444',
    iconColor: '#EF4444',
    iconBg: '#FEF2F2',
  }
];

const FEATURES = [
  {
    icon: <FaUsers className="text-3xl" />,
    title: 'For Every Community',
    desc: 'From small societies to large townships, MySocietySuite adapts to your needs.'
  },
  {
    icon: <FaSlidersH className="text-3xl" />,
    title: 'Flexible & Scalable',
    desc: 'Start simple and grow. Add modules and features as your community grows.'
  },
  {
    icon: <FaShieldAlt className="text-3xl" />,
    title: 'Secure & Reliable',
    desc: 'Your community data is protected with enterprise-grade security.'
  },
  {
    icon: <FaHeadset className="text-3xl" />,
    title: 'Always With You',
    desc: 'Our team is here to support you at every step of your community’s journey.'
  },
  {
    icon: <FaLeaf className="text-3xl" />,
    title: 'Better Communities',
    desc: 'Technology that helps communities run better and live better.'
  }
];

const WhoWeServe = () => {
  return (
    <div className="bg-white">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        <Container>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <div className="flex-1 lg:pr-12">
              <span className="text-sm font-bold tracking-widest text-[#FF6B00] uppercase mb-4 block">
                WHO WE SERVE
              </span>
              <h1 className="text-4xl lg:text-[44px] font-bold text-[#121212] leading-tight mb-8">
                Built for Every Kind of <br className="hidden lg:block" /> Residential Community
              </h1>

              <div className="w-16 h-[3px] bg-[#FF6B00] mb-8"></div>

              <p className="text-[17px] font-bold text-[#121212] mb-6 leading-relaxed max-w-lg">
                Every community is unique. MySocietySuite is designed to fit the way your community lives and operates.
              </p>

              <p className="text-[15px] font-medium text-gray-700 mb-12 leading-relaxed max-w-lg">
                From small residential societies to large townships, we bring essential tools, information and people together on one connected platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FFF3EA] text-[#FF6B00] flex items-center justify-center text-xl shrink-0 border border-[#FF6B00]/20">
                    <FaUsers />
                  </div>
                  <span className="text-[13px] font-bold text-[#121212] leading-tight">For every type<br />of community</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FFF3EA] text-[#FF6B00] flex items-center justify-center text-xl shrink-0 border border-[#FF6B00]/20">
                    <FaBuilding />
                  </div>
                  <span className="text-[13px] font-bold text-[#121212] leading-tight">For all sizes<br />and structures</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FFF3EA] text-[#FF6B00] flex items-center justify-center text-xl shrink-0 border border-[#FF6B00]/20">
                    <FaShieldAlt />
                  </div>
                  <span className="text-[13px] font-bold text-[#121212] leading-tight">One platform.<br />Many communities.</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative w-full lg:max-w-xl xl:max-w-2xl mt-12 lg:mt-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src={WWS_Hero} alt="Community" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* COMMUNITIES SECTION */}
      <section className="py-20 lg:py-28 bg-[#fdfdfd]">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#121212] mb-4">Communities We Serve</h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[2px] w-12 bg-gray-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]"></div>
              <div className="h-[2px] w-12 bg-gray-200"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
            {COMMUNITIES.map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                <div className="h-48 overflow-visible relative rounded-t-3xl bg-gray-100">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-t-3xl group-hover:opacity-90 transition-opacity" />
                  <div className="absolute -bottom-6 left-8 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md border-4 border-white z-10"
                    style={{ backgroundColor: item.iconBg, color: item.iconColor }}>
                    {item.icon}
                  </div>
                </div>
                <div className="p-8 pt-12 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[#121212] mb-3 leading-tight">{item.title}</h3>
                  <p className="text-[13px] text-gray-600 leading-[1.7] mb-6 flex-1 font-medium">
                    {item.description}
                  </p>
                  <div className="w-8 h-[3px] rounded-full" style={{ backgroundColor: item.borderColor }}></div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FEATURES ROW */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="bg-[#F7F7F9] border border-gray-200 rounded-[2rem] p-10 lg:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {FEATURES.map((feat, idx) => (
                <div key={idx} className={`flex flex-col items-center text-center ${idx !== 0 ? 'pt-8 md:pt-0' : ''}`}>
                  <div className="text-[#FF6B00] mb-5">
                    {feat.icon}
                  </div>
                  <h4 className="text-[14px] font-bold text-[#121212] mb-3">{feat.title}</h4>
                  <p className="text-[12.5px] font-medium text-gray-500 leading-relaxed px-2">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* BOTTOM CTA */}
      <section className="pb-16 lg:pb-24 pt-4">
        <Container>
          <div className="bg-[#0b0b0b] rounded-3xl p-10 lg:p-14 relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

            <div className="w-24 h-24 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-white text-4xl border-[1.5px] border-white/20 relative z-10">
              <FaUsers />
            </div>

            <div className="flex-1 text-center lg:text-left relative z-10">
              <h3 className="text-[22px] font-medium text-white/90 mb-2">No matter the size. No matter the structure.</h3>
              <h2 className="text-3xl lg:text-[34px] font-bold text-[#FF6B00] mb-4">We are here for every community.</h2>
              <p className="text-white/80 text-[15px] font-medium max-w-2xl">
                MySocietySuite brings communities together and makes society management simple.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0 relative z-10">
              <button className="bg-[#FF6B00] hover:bg-[#E66000] text-white px-7 py-3.5 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/20">
                Explore Products <FaArrowRight className="text-xs opacity-80" />
              </button>
              <button className="bg-transparent border-[1.5px] border-white/30 hover:bg-white/10 text-white px-7 py-3.5 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2">
                Book a Demo <FaArrowRight className="text-xs opacity-80" />
              </button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default WhoWeServe;
