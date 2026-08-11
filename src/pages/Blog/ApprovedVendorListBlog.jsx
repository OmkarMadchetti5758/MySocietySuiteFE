import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import {
  FaTag, FaClock, FaCalendar, FaChevronRight, FaBolt,
  FaMagnifyingGlass, FaFileShield, FaCircleCheck, FaArrowsRotate,
  FaRotate, FaArrowRight, FaTriangleExclamation, FaIdCard,
  FaBriefcase, FaComments, FaFileLines, FaHandHoldingDollar, FaStar,
  FaCircle, FaLink
} from 'react-icons/fa6';
import {
  FaWhatsapp, FaLinkedinIn, FaFacebookF
} from 'react-icons/fa';

/* ─── static data ─── */
const TABLE_VENDORS = [
  { name: 'ABC Pest Control', service: 'Pest Control', contact: '98XXXXXX21' },
  { name: 'XYZ Electricals', service: 'Electrical', contact: '97XXXXXX45' },
  { name: 'SafeLift Services', service: 'Lift Maintenance', contact: '99XXXXXX18' },
  { name: 'CleanPro Services', service: 'Housekeeping', contact: '96XXXXXX72' },
];

const CHECK_ITEMS = [
  'Vendor name', 'Service category', 'Contact person', 'Phone number',
  'Company details', 'Services offered', 'Approval status', 'Contract validity',
  'Insurance / licence details, where applicable', 'Documents',
  'Performance history', 'Last review date',
];

const REASONS = [
  {
    num: '01', title: 'Better Vendor Selection',
    body: "When a resident or management committee needs a plumber, electrician or other service provider, they don't have to start searching from scratch. The society already has a list of known and reviewed vendors.",
    tag: 'Faster decisions and less uncertainty',
  },
  {
    num: '02', title: 'Better Control Over Society Vendors',
    body: 'A society may work with dozens of vendors throughout the year. Without a central record, it becomes difficult to answer simple questions — who approved this vendor, is it currently active, and is the contract still valid.',
    tag: 'A single source of truth for the committee',
  },
  {
    num: '03', title: 'Improved Transparency',
    body: 'Vendor selection can sometimes become a sensitive subject within a society. Maintaining proper vendor records helps create a more transparent, consistent process rather than depending entirely on individual recommendations.',
    tag: 'One consistent process for everyone',
  },
];

const CHAIN_NODES = [
  { icon: <FaMagnifyingGlass />, label: 'Evaluate', final: false },
  { icon: <FaFileShield />, label: 'Verify', final: false },
  { icon: <FaCircleCheck />, label: 'Approve', final: false },
  { icon: <FaArrowsRotate />, label: 'Review', final: false },
  { icon: <FaRotate />, label: 'Renew / Remove', final: true },
];

const CRITERIA = [
  { icon: <FaIdCard />, title: 'Business Information', body: "Verify the vendor's business name, contact details and service category." },
  { icon: <FaBriefcase />, title: 'Experience', body: 'Understand how long the vendor has provided the service and their experience with residential communities.' },
  { icon: <FaComments />, title: 'References', body: 'Where appropriate, check references from other societies or customers.' },
  { icon: <FaFileLines />, title: 'Documents', body: 'Collect relevant licences, certificates, insurance or other documents depending on the service.' },
  { icon: <FaHandHoldingDollar />, title: 'Commercial Terms', body: 'Clearly understand pricing, payment terms, service frequency and contract duration.' },
  { icon: <FaStar />, title: 'Service Quality', body: "Review the vendor's performance periodically instead of approving them permanently." },
];

const TOC = [
  { href: '#intro', label: 'Introduction' },
  { href: '#what-is', label: 'What Is an AVL?' },
  { href: '#why', label: 'Why a Society Needs One' },
  { href: '#checks', label: 'What to Check Before Approving' },
  { href: '#forever', label: "Approved Doesn't Mean Forever" },
];

const TAGS = ['Vendor Management', 'Society Operations', 'Committee Tools', 'Transparency'];

/* ─── main component ─── */
export default function ApprovedVendorListBlog() {
  const [progress, setProgress] = useState(0);
  const [activeToc, setActiveToc] = useState('intro');

  /* reading progress bar */
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setProgress((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* active TOC link */
  useEffect(() => {
    const ids = ['intro', 'what-is', 'why', 'checks', 'forever'];
    const onScroll = () => {
      let current = 'intro';
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      });
      setActiveToc(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const copyLink = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-white text-[#222] overflow-x-hidden">

      {/* ── Reading Progress Bar ── */}
      <div
        className="fixed top-0 left-0 h-[3px] z-[200] transition-[width] duration-100"
        style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#FB7815,#ff9c4d)' }}
      />

      <Navbar />

      {/* ══════════════ HERO ══════════════ */}
      <header
        className="relative overflow-hidden pt-36 pb-14 text-white"
        style={{ background: 'radial-gradient(ellipse 900px 500px at 82% 15%, rgba(251,120,21,.18), transparent 60%), #0b0b0b' }}
      >
        {/* dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)',
          }}
        />

        <div className="relative z-10 max-w-[880px] mx-auto px-6">

          {/* Breadcrumb */}
          {/* <nav className="flex flex-wrap items-center gap-2 text-[13px] text-[#9a9da2] mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <FaChevronRight className="text-[10px] text-[#5c5f64]" />
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            <FaChevronRight className="text-[10px] text-[#5c5f64]" />
            <span className="hover:text-white transition-colors cursor-pointer">Society Management</span>
            <FaChevronRight className="text-[10px] text-[#5c5f64]" />
            <span className="text-[#e7e8ea]">Approved Vendor List</span>
          </nav> */}

          {/* Category pill */}
          <div className="inline-flex items-center gap-2 bg-[rgba(251,120,21,.12)] border border-[rgba(251,120,21,.45)] text-[#FB7815] text-[12px] font-bold tracking-[1px] uppercase px-4 py-2 rounded-full mb-6">
            <FaTag className="text-[11px]" /> Society Management
          </div>

          <h1 className="text-[clamp(26px,5vw,38px)] font-bold leading-snug mb-6 max-w-3xl" style={{ fontFamily: "'Baloo 2',sans-serif" }}>
            Approved Vendor List: A Simple Way to Make Society Services{' '}
            <span className="text-[#FB7815]">Safer, Faster &amp; More Reliable</span>
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2.5 text-[13.5px] text-[#c7c9cd] font-medium">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FB7815] to-[#ff9c4d] flex items-center justify-center text-white font-bold text-[13px]">
                MS
              </span>
              Published by MySocietySuite
            </div>
            <div className="flex items-center gap-2 text-[13.5px] text-[#c7c9cd] font-medium">
              <FaClock className="text-[#FB7815] text-[13px]" /> 5–6 minutes read
            </div>
            <div className="flex items-center gap-2 text-[13.5px] text-[#c7c9cd] font-medium">
              <FaCalendar className="text-[#FB7815] text-[13px]" /> Society Management
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════ ARTICLE LAYOUT ══════════════ */}
      <div className="max-w-[1000px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-14 items-start">

        {/* ── Sticky TOC ── */}
        <aside className="hidden lg:block sticky top-28">
          <p className="text-[11px] uppercase tracking-[1.4px] font-bold text-[#9aa0a8] mb-4">In This Article</p>
          {TOC.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={`block text-[13.5px] py-2 pl-3.5 border-l-2 font-medium transition-all duration-150 ${activeToc === href.slice(1)
                ? 'text-[#e35f00] border-[#FB7815]'
                : 'text-[#5c6169] border-[#ececec] hover:text-[#e35f00] hover:border-[#FB7815]'
                }`}
            >
              {label}
            </a>
          ))}
        </aside>

        {/* ── Article body ── */}
        <article className="max-w-[700px] w-full">

          {/* Introduction */}
          <section id="intro">
            <p className="text-[18px] leading-[1.7] text-[#222] font-medium pb-8 mb-4 border-b border-[#ececec]">
              Every residential society depends on vendors and service providers. From plumbers and electricians to housekeeping agencies, pest-control companies, lift maintenance providers, security agencies and AC technicians — vendors play an important role in keeping a society running smoothly.
            </p>
            <p className="text-[15.5px] leading-[1.85] text-[#33363c] mb-5">
              But there is one common question every society management committee eventually faces:
            </p>

            {/* Pull quote */}
            <blockquote
              className="text-[22px] font-bold leading-snug text-[#222] bg-[#f7f7f9] border-l-4 border-[#FB7815] px-6 py-5 rounded-r-xl my-7"
              style={{ fontFamily: "'Baloo 2',sans-serif" }}
            >
              "Which vendors can we trust?"
            </blockquote>

            <p className="text-[15.5px] leading-[1.85] text-[#33363c] mb-5">
              When vendor information is scattered across WhatsApp groups, notebooks, old bills and individual committee members' phones, it becomes difficult to know who has been approved, who is currently active and what services they provide.
            </p>
            <p className="text-[15.5px] leading-[1.85] text-[#33363c] mb-5">
              This is where an Approved Vendor List (AVL) can make a significant difference.
            </p>
          </section>

          {/* What Is */}
          <section id="what-is">
            <SectionHeading num="01">What Is an Approved Vendor List?</SectionHeading>
            <p className="text-[15.5px] leading-[1.85] text-[#33363c] mb-5">
              An Approved Vendor List is a central record of vendors and service providers that have been reviewed and approved by the society management committee. Instead of allowing every service provider to be treated equally, the society maintains a trusted list of vendors who meet its defined requirements.
            </p>
            <p className="text-[15.5px] leading-[1.85] text-[#33363c] mb-5">For example:</p>

            {/* Vendor table */}
            <div className="overflow-x-auto border border-[#ececec] rounded-xl my-7">
              <table className="w-full border-collapse min-w-[480px]">
                <thead>
                  <tr className="bg-[#f7f7f9]">
                    {['Vendor', 'Service', 'Status', 'Contact'].map((h) => (
                      <th key={h} className="text-left text-[12px] uppercase tracking-[.6px] font-bold text-[#8a8d92] px-5 py-3.5 border-b border-[#ececec]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TABLE_VENDORS.map((v, i) => (
                    <tr key={i} className={i < TABLE_VENDORS.length - 1 ? 'border-b border-[#ececec]' : ''}>
                      <td className="px-5 py-3.5 text-[14px] text-[#33363c]">{v.name}</td>
                      <td className="px-5 py-3.5 text-[14px] text-[#33363c]">{v.service}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 bg-[#eefaf1] text-[#1fa15a] font-semibold text-[12.5px] px-3 py-1 rounded-full">
                          <FaCircle className="text-[8px]" /> Approved
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-[#33363c]">{v.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[15.5px] leading-[1.85] text-[#33363c] mb-5">The list can also contain additional information such as:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-6">
              {CHECK_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[14px] text-[#33363c] bg-[#f7f7f9] px-3.5 py-2.5 rounded-[10px]">
                  <FaCircleCheck className="text-[#FB7815] text-[13px] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Why */}
          <section id="why">
            <SectionHeading num="02">Why Does a Society Need One?</SectionHeading>

            <div className="flex flex-col gap-4 my-7">
              {REASONS.map((r) => (
                <div
                  key={r.num}
                  className="flex gap-5 p-5 border border-[#ececec] rounded-xl transition-all duration-150 hover:border-[rgba(251,120,21,.4)] hover:shadow-[0_10px_26px_-18px_rgba(0,0,0,.3)]"
                >
                  <div
                    className="text-[22px] font-extrabold text-[#FB7815] shrink-0 w-9"
                    style={{ fontFamily: "'Baloo 2',sans-serif" }}
                  >
                    {r.num}
                  </div>
                  <div>
                    <h4 className="text-[16.5px] font-bold mb-1.5" style={{ fontFamily: "'Baloo 2',sans-serif" }}>{r.title}</h4>
                    <p className="text-[14px] text-[#5c6169] leading-[1.7] mb-2">{r.body}</p>
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#e35f00] bg-[#fff3ea] px-3 py-1 rounded-full">
                      <FaBolt className="text-[10px]" /> {r.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Approval process chain */}
            <div
              className="relative rounded-[20px] px-8 py-9 my-8 overflow-hidden"
              style={{ background: '#0b0b0b' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 500px 260px at 50% 0%, rgba(251,120,21,.2), transparent 65%)' }}
              />
              <p className="relative z-10 text-center text-[12px] uppercase tracking-[1.2px] font-bold text-[#9aa0a8] mb-5">
                The Approval Process
              </p>
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5">
                {CHAIN_NODES.map((node, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13.5px] font-semibold border transition-colors ${node.final
                        ? 'bg-[#FB7815] border-[#FB7815] text-white'
                        : 'bg-white/[.06] border-white/[.14] text-white'
                        }`}
                    >
                      <span className={node.final ? 'text-white text-[12px]' : 'text-[#FB7815] text-[12px]'}>
                        {node.icon}
                      </span>
                      {node.label}
                    </div>
                    {i < CHAIN_NODES.length - 1 && (
                      <FaArrowRight className="text-[#555] text-[13px]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Checks */}
          <section id="checks">
            <SectionHeading num="03">What Should a Society Check Before Approving a Vendor?</SectionHeading>
            <p className="text-[15.5px] leading-[1.85] text-[#33363c] mb-5">
              Every society can define its own approval criteria depending on the service. However, some basic checks can include:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-7">
              {CRITERIA.map((c) => (
                <div key={c.title} className="bg-[#f7f7f9] rounded-xl p-5">
                  <div className="w-[38px] h-[38px] rounded-[10px] bg-white flex items-center justify-center text-[#FB7815] text-[15px] mb-3 shadow-[0_6px_14px_-8px_rgba(0,0,0,.15)]">
                    {c.icon}
                  </div>
                  <h4 className="text-[15px] font-bold mb-1.5" style={{ fontFamily: "'Baloo 2',sans-serif" }}>{c.title}</h4>
                  <p className="text-[13.3px] text-[#5c6169] leading-[1.6]">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Approved ≠ Forever */}
          <section id="forever">
            <SectionHeading num="04">Approved Doesn't Mean Approved Forever</SectionHeading>
            <p className="text-[15.5px] leading-[1.85] text-[#33363c] mb-5">
              This is one of the most important principles of vendor management. A vendor may provide excellent service today but fail to maintain the same quality later. Therefore, an Approved Vendor List should be reviewed periodically.
            </p>

            {/* Callout */}
            <div className="flex gap-4 bg-[#fff3ea] border border-[#ffd9b8] rounded-xl p-6 my-8">
              <div className="w-10 h-10 rounded-[10px] bg-[#FB7815] text-white flex items-center justify-center text-[16px] shrink-0">
                <FaTriangleExclamation />
              </div>
              <div>
                <h4 className="text-[16px] font-bold mb-1.5" style={{ fontFamily: "'Baloo 2',sans-serif" }}>
                  Keep the list alive, not archived
                </h4>
                <p className="text-[14px] text-[#5c4632] leading-[1.7]">
                  Treat approval as a status, not a badge. Set a recurring review date for every vendor, so quality — not habit — decides who stays on the list.
                </p>
              </div>
            </div>
          </section>

          {/* Tags */}
          <div className="flex flex-wrap gap-2.5 mt-11 mb-2.5">
            {TAGS.map((t) => (
              <span key={t} className="text-[12.5px] font-semibold text-[#5c6169] bg-[#f7f7f9] px-3.5 py-1.5 rounded-full border border-[#ececec]">
                {t}
              </span>
            ))}
          </div>
        </article>
      </div>

      {/* ══════════════ CTA BAND ══════════════ */}
      <section
        className="relative overflow-hidden py-20 text-center mt-16"
        style={{ background: '#0b0b0b' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 700px 380px at 50% 0%, rgba(251,120,21,.18), transparent 65%)' }}
        />
        <div className="relative z-10 max-w-[640px] mx-auto px-6">
          <div className="inline-flex items-center gap-2 text-[12.5px] font-bold tracking-[1.6px] uppercase text-[#e35f00] mb-4">
            <span className="text-[10px] text-[#FB7815]">✦</span>
            Vendor Management, Simplified
            <span className="text-[10px] text-[#FB7815]">✦</span>
          </div>
          <h2
            className="text-[30px] font-bold text-white mb-4"
            style={{ fontFamily: "'Baloo 2',sans-serif" }}
          >
            Keep Every Vendor{' '}
            <span className="text-[#FB7815]">Approved, Verified &amp; Visible.</span>
          </h2>
          <p className="text-[#c7c9cd] text-[15px] leading-[1.7] mb-8">
            MySocietySuite lets your committee maintain a living Approved Vendor List — with documents, review dates and contract status in one place.
          </p>
          <div className="flex flex-wrap gap-3.5 justify-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-[#FB7815] text-white font-semibold text-[15px] px-7 py-3.5 rounded-full hover:-translate-y-0.5 transition-transform shadow-[0_10px_24px_-8px_rgba(251,120,21,.55)] hover:shadow-[0_14px_28px_-8px_rgba(251,120,21,.65)]"
            >
              Book a Demo
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-transparent border border-white/35 text-white font-semibold text-[15px] px-7 py-3.5 rounded-full hover:bg-white/[.08] transition-colors"
            >
              Explore Vendor Module
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ── Shared heading sub-component ── */
function SectionHeading({ num, children }) {
  return (
    <h2
      className="text-[26px] font-bold mt-14 mb-5 flex items-center gap-3 scroll-mt-28"
      style={{ fontFamily: "'Baloo 2',sans-serif" }}
    >
      <span className="w-8 h-8 rounded-[9px] bg-[#FB7815] text-white flex items-center justify-center text-[15px] font-bold shrink-0">
        {num}
      </span>
      {children}
    </h2>
  );
}
