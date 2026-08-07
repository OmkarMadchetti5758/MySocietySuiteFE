import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Container from '../common/Container';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import logoImg from '../../assets/images/webp/MySocietySuite_FinalLogo.webp';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      toast.success(`Subscribed ${email} to newsletter!`);
      setEmail('');
    }
  };

  return (
    <footer id="footer" className="bg-[#0B0B0B] text-gray-400 pt-16 pb-8 border-t border-gray-800/80">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-gray-800/80 text-base">

          {/* Logo & Tagline */}
          <div className="col-span-2 lg:col-span-3 space-y-4 flex flex-col items-center lg:items-start text-center lg:text-left">
            <a href="#">
              <img
                src={logoImg}
                alt="MySocietySuite Logo"
                className="h-35 object-contain"
              />
            </a>

            {/* <p className="text-gray-400 text-base leading-relaxed max-w-xs">
              The complete digital solution for modern residential communities.
            </p> */}

            <div className="flex items-center gap-2.5 pt-2 lg:ml-7">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-[#FF6B00] transition-colors">
                <FaFacebookF className="text-base" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-[#FF6B00] transition-colors">
                <FaInstagram className="text-base" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-[#FF6B00] transition-colors">
                <FaLinkedinIn className="text-base" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-[#FF6B00] transition-colors">
                <FaYoutube className="text-base" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Product</h4>
            <ul className="space-y-2 text-base">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#modules" className="hover:text-white transition-colors">Modules</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Company</h4>
            <ul className="space-y-2 text-base">
              <li><a href="#footer" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#mobile-apps" className="hover:text-white transition-colors">Mobile Apps</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#footer" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Legal</h4>
            <ul className="space-y-2 text-base">
              <li><a href="#footer" className="hover:text-white transition-colors flex items-center gap-1"><span>Help Center</span><span className="text-[10px] text-[#FF6B00]">↗</span></a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Guides</a></li>
              <li><a href="#footer" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#footer" className="hover:text-white transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact Us & Newsletter */}
          <div className="col-span-2 lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Contact Us</h4>
            <ul className="space-y-2 text-gray-400 text-base">
              <li className="flex items-center gap-2">
                <FaPhoneAlt className="text-gray-500 text-[10px]" />
                <span>+91- 9226605656 (Tejas Putta)</span>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-gray-500 text-[10px]" />
                <span>tejas.p@msquaresoftware.com</span>
              </li>
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-500 text-[10px]" />
                <span>Pune, India</span>
              </li>
            </ul>

            <div className="pt-2 space-y-2">
              <h5 className="font-bold text-white text-base">Subscribe to our newsletter</h5>
              <p className="text-base text-gray-500">Get updates on features and offers.</p>

              <form onSubmit={handleSubscribe} className="flex gap-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] w-full"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center shrink-0 hover:bg-orange-600 transition-colors"
                >
                  <FaPaperPlane className="text-base" />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 text-center text-[11px] text-gray-500">
          © {new Date().getFullYear()} MySocietySuite. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
