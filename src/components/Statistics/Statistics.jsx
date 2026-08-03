import { motion } from 'framer-motion';
import Container from '../common/Container';
import { STATS_DATA } from '../../data/stats';
import StatCard from '../common/StatCard';
import aboutUsBanner from '../../assets/images/webp/MySocietySuite_Aboutus_Banner1.webp';

const Statistics = () => {
  return (
    <>
      {/* About Us Banner Section */}
      <section className="py-16 bg-transparent relative">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={aboutUsBanner}
              alt="About MySocietySuite"
              className="w-full h-auto rounded-3xl object-cover"
            />
          </motion.div>
        </Container>
      </section>

      {/* Statistics Counters */}
      <section id="statistics" className="py-12 w-full bg-[#0B0B0B] text-white border-t border-b border-gray-800/80">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS_DATA.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <StatCard stat={stat} />
              </motion.div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
};

export default Statistics;
