import React, { useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { FaPeopleRoof, FaEye, FaWandMagicSparkles, FaDiagramProject, FaScrewdriverWrench, FaBrain, FaFaceSmile, FaGears, FaMagnifyingGlassChart, FaPeopleGroup, FaCompass, FaPlay } from 'react-icons/fa6';

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans text-[#121212] bg-white overflow-x-hidden selection:bg-[#fb7815] selection:text-white">
      <Navbar />

      <main className="pt-20 lg:pt-24">
        {/* HERO */}
        <section className="relative text-white overflow-hidden py-24 text-center bg-[#0b0b0b]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_900px_500px_at_82%_15%,rgba(251,120,21,0.16),transparent_60%)] pointer-events-none"></div>
          {/* Dot pattern placeholder */}
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_700px_400px_at_50%_30%,black,transparent_80%)]"></div>

          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 bg-[rgba(251,120,21,0.12)] border border-[rgba(251,120,21,0.45)] text-[#fb7815] text-xs font-bold tracking-[1px] uppercase px-4 py-2 rounded-full mb-6">
              <FaPeopleRoof /> About MySocietySuite
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide mb-5 leading-tight">
              Building Better Communities, <span className="text-[#fb7815]">Together.</span>
            </h1>
            <p className="text-[16.5px] text-[#c7c9cd] leading-relaxed max-w-2xl mx-auto">
              Technology that makes society management simpler, safer and more connected.
            </p>
          </div>
        </section>

        {/* INTRO */}
        <section className="py-20 pb-10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="w-14 h-[3px] bg-[#fb7815] rounded-full mx-auto mb-8"></div>
            <p className="text-lg md:text-xl leading-[1.85] text-[#33363c] font-medium mb-5">
              A residential society is more than buildings, apartments and common spaces. It is a community of people, shared responsibilities and everyday experiences.
            </p>
            <p className="text-lg md:text-xl leading-[1.85] text-[#121212] font-medium">
              MySocietySuite is built to bring technology into this environment in a simple and meaningful way — helping residential communities manage their everyday operations more effectively.
            </p>
          </div>
        </section>

        {/* VISION */}
        <section className="relative bg-[#0b0b0b] text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_420px_at_15%_20%,rgba(251,120,21,0.16),transparent_60%)] pointer-events-none"></div>
          <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
            <div>
              <div className="w-[58px] h-[58px] rounded-2xl bg-gradient-to-br from-[#fb7815] to-[#ff9c4d] flex items-center justify-center text-white text-2xl mb-6 shadow-[0_16px_34px_-12px_rgba(251,120,21,0.55)]">
                <FaEye />
              </div>
              <div className="inline-flex items-center gap-2 font-bold text-[12.5px] tracking-[1.6px] uppercase text-[#fb7815] mb-4">
                <span className="text-[10px]">✦</span> Our Vision <span className="text-[10px]">✦</span>
              </div>
              <h2 className="text-3xl md:text-4xl text-white mb-4 leading-tight font-bold">
                To make every residential community <span className="text-[#fb7815]">smarter, safer and more connected.</span>
              </h2>
              <p className="text-[#c7c9cd] text-[15px] leading-[1.8] max-w-md">
                We envision a future where technology doesn't make society management complicated. Instead, it makes everyday operations effortless — for everyone involved.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { n: "01", t: "Simpler." },
                { n: "02", t: "More transparent." },
                { n: "03", t: "More accountable." },
                { n: "04", t: "More connected." }
              ].map((item) => (
                <div key={item.n} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-5 md:px-6">
                  <span className="font-extrabold text-[22px] text-[#fb7815] w-[34px] shrink-0">{item.n}</span>
                  <span className="font-bold text-lg text-white">{item.t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section className="bg-[#f7f7f9] py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 font-bold text-[12.5px] tracking-[1.6px] uppercase text-[#fb7815] mb-4">
                <span className="text-[10px]">✦</span> Our Mission <span className="text-[10px]">✦</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Simplify Society Management. <span className="text-[#fb7815]">Strengthen Community Living.</span>
              </h2>
              <p className="text-[#5c6169] text-[15.5px] leading-[1.7]">
                Our mission is to build practical technology that addresses the real challenges of residential community management. We focus on creating products that are:
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { icon: <FaWandMagicSparkles />, title: "Simple", desc: "Easy to understand and easy to use." },
                { icon: <FaDiagramProject />, title: "Connected", desc: "Bringing important society information and operations together." },
                { icon: <FaEye />, title: "Transparent", desc: "Helping communities improve visibility and accountability." },
                { icon: <FaScrewdriverWrench />, title: "Practical", desc: "Designed around real-world society requirements." },
                { icon: <FaBrain />, title: "Intelligent", desc: "Using modern technology and AI to make society management smarter." }
              ].map((card, i) => (
                <div key={i} className="bg-white border border-[#ececec] rounded-xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.12)]">
                  <div className="w-11 h-11 rounded-xl bg-[#fff3ea] flex items-center justify-center text-[#fb7815] text-lg mb-4">
                    {card.icon}
                  </div>
                  <h4 className="text-[16.5px] font-bold mb-2 text-[#121212]">{card.title}</h4>
                  <p className="text-[13.3px] text-[#5c6169] leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMMITMENT */}
        <section className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 font-bold text-[12.5px] tracking-[1.6px] uppercase text-[#fb7815] mb-4">
                <span className="text-[10px]">✦</span> Our Commitment <span className="text-[10px]">✦</span>
              </div>
              <h2 className="text-3xl md:text-[30px] font-bold mb-4 leading-tight text-[#121212]">
                Simple for Residents. <span className="text-[#fb7815]">Powerful for Management.</span>
              </h2>
              <p className="text-[#5c6169] text-[15px] leading-[1.8] max-w-md">
                We are committed to continuously improving MySocietySuite based on the evolving needs of residential communities. Our focus remains on:
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: <FaFaceSmile />, title: "Better experiences." },
                { icon: <FaGears />, title: "Better operations." },
                { icon: <FaMagnifyingGlassChart />, title: "Better transparency." },
                { icon: <FaPeopleGroup />, title: "Better community management." }
              ].map((card, i) => (
                <div key={i} className="bg-[#f7f7f9] border border-[#ececec] rounded-xl p-6">
                  <div className="w-[42px] h-[42px] rounded-xl bg-[#fff3ea] text-[#fb7815] flex items-center justify-center text-[17px] mb-4">
                    {card.icon}
                  </div>
                  <h4 className="text-base font-bold text-[#121212]">{card.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section className="bg-[#f7f7f9] py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="relative bg-[#0b0b0b] text-white rounded-3xl py-16 md:py-20 px-8 md:px-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_380px_at_50%_0%,rgba(251,120,21,0.18),transparent_65%)] pointer-events-none"></div>
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_600px_320px_at_50%_40%,black,transparent_85%)]"></div>

              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center gap-2 font-bold text-[12.5px] tracking-[1.6px] uppercase text-[#fb7815] mb-4">
                  <span className="text-[10px]">✦</span> Let's Build Better Communities Together. <span className="text-[10px]">✦</span>
                </div>
                <h2 className="text-3xl md:text-[34px] font-bold text-white mb-4 leading-tight">
                  A Simpler, Smarter Way to <span className="text-[#fb7815]">Manage Your Society.</span>
                </h2>
                <p className="text-[#c7c9cd] text-[15.5px] leading-[1.7] mb-8">
                  Discover MySocietySuite and see how technology can transform everyday society management.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="/#products" className="inline-flex items-center gap-2 font-semibold text-[15px] px-7 py-3.5 rounded-full bg-[#fb7815] text-white shadow-[0_10px_24px_-8px_rgba(251,120,21,0.55)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_rgba(251,120,21,0.65)] transition-all">
                    <FaCompass /> Explore Products
                  </a>
                  <a href="/#pricing" className="inline-flex items-center gap-2 font-semibold text-[15px] px-7 py-3.5 rounded-full bg-transparent border-[1.5px] border-white/35 text-white hover:bg-white/10 transition-all">
                    <FaPlay /> Book a Demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
