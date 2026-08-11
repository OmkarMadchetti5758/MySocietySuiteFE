import { motion } from 'framer-motion';
import Container from '../common/Container';
import { STATS_DATA } from '../../data/stats';
import StatCard from '../common/StatCard';
import aboutUsBanner from '../../assets/images/webp/MySocietySuite_Aboutus_Banner1.webp';

const Statistics = () => {
  return (
    <>
      {/* About Us Banner Section */}
      <section className="py-16 bg-transparent relative z-10">
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
              className="w-full h-auto"
            />
          </motion.div>
        </Container>
      </section>

      {/* Statistics Counters - with smooth transition top and bottom */}
      <section id="statistics" className="relative w-full text-white pt-24 pb-20 z-0 bg-white">

        {/* Top Wave Divider */}
        <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-full h-[60px] sm:h-[100px]"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C62.59,33.56,151.78,63.15,221.39,78.2Z"
              className="fill-[#0B0B0B]"
            ></path>
          </svg>
        </div>

        {/* Dark Background Area */}
        <div className="absolute inset-0 top-[59px] sm:top-[99px] bottom-[59px] sm:bottom-[99px] bg-[#0B0B0B]" />

        {/* Bottom Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg
            className="relative block w-full h-[60px] sm:h-[100px]"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C62.59,33.56,151.78,63.15,221.39,78.2Z"
              className="fill-[#0B0B0B]"
            ></path>
          </svg>
        </div>

        <Container className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-24 relative max-w-4xl mx-auto">
            {STATS_DATA.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-white/5 blur-xl rounded-full" />
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
