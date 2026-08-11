import { memo, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import WhoWeServe from '../components/WhoWeServe/WhoWeServe';

const WhoWeServePage = memo(() => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-text-dark font-sans selection:bg-primary selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-[80px]">
        {/* We add top padding equivalent to navbar height if Navbar is fixed. Adjust as needed. */}
        <WhoWeServe />
      </main>

      <Footer />
    </div>
  );
});

WhoWeServePage.displayName = 'WhoWeServePage';
export default WhoWeServePage;
