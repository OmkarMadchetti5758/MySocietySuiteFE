import React from 'react';
import { motion } from 'framer-motion';
import Container from '../common/Container';
import { FaLock, FaFileInvoiceDollar, FaServer, FaShieldAlt } from 'react-icons/fa';

const BADGES = [
  {
    id: 1,
    title: 'Bank-Grade Encryption',
    icon: FaLock,
  },
  {
    id: 2,
    title: 'GST & Audit Compliant',
    icon: FaFileInvoiceDollar,
  },
  {
    id: 3,
    title: 'Secure Hosting',
    icon: FaServer,
  },
  {
    id: 4,
    title: 'Data Privacy Assured',
    icon: FaShieldAlt,
  }
];

const TrustBadges = () => {
  return (
    <section className="py-6 border-b border-gray-100 bg-white">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12">
          {BADGES.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                <badge.icon className="text-base" />
              </div>
              <span className="text-base font-semibold text-gray-700">{badge.title}</span>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TrustBadges;
