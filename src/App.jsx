import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import WhoWeServePage from './pages/WhoWeServePage';
import ApprovedVendorListBlog from './pages/Blog/ApprovedVendorListBlog';
import ActivateAccount from './pages/ActivateAccount';
import AboutUs from './pages/AboutUs';
import VendorTasksPage from './pages/VendorPortal/VendorTasksPage';

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== '/' || !hash) return;

    const sectionId = hash.slice(1);
    const timer = setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#111111',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '12px'
          }
        }}
      />
      <Router>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/who-we-serve" element={<WhoWeServePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/blog" element={<ApprovedVendorListBlog />} />
          <Route path="/activate-account" element={<ActivateAccount />} />
          <Route path="/:societyId/dashboard/*" element={<DashboardLayout />} />
          <Route path="/:societyId/vendor-portal/*" element={<VendorTasksPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
