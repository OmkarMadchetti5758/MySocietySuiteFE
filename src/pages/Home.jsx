import { memo } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import Audience from '../components/Audience/Audience';
import Timeline from '../components/Timeline/Timeline';
import Modules from '../components/Modules/Modules';
import Statistics from '../components/Statistics/Statistics';
import MobileApps from '../components/MobileApps/MobileApps';
import AISection from '../components/AISection/AISection';
import Testimonials from '../components/Testimonials/Testimonials';
import PricingCTA from '../components/PricingCTA/PricingCTA';
import Footer from '../components/Footer/Footer';

const Home = memo(() => {
  return (
    <div className="min-h-screen bg-white text-text-dark font-sans selection:bg-primary selection:text-white">
      {/* 1. Navbar */}
      <Navbar />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Why Choose / Audience Section */}
        <Audience />

        {/* 4. How It Works / Timeline Section */}
        <Timeline />

        {/* 5. Modules Section */}
        <Modules />

        {/* 6. Statistics Counter Section */}
        <Statistics />

        {/* 7. Mobile Apps Section */}
        <MobileApps />

        {/* 8. AI Assistant Section */}
        <AISection />

        {/* 9. Testimonials Section */}
        <Testimonials />

        {/* 10. Pricing CTA Section */}
        <PricingCTA />
      </main>

      {/* 11. Footer Section */}
      <Footer />
    </div>
  );
});

Home.displayName = 'Home';
export default Home;
