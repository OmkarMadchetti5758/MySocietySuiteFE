import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import WhoWeServePage from './pages/WhoWeServePage';
import ApprovedVendorListBlog from './pages/Blog/ApprovedVendorListBlog';
import ActivateAccount from './pages/ActivateAccount';
import AboutUs from './pages/AboutUs';

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/who-we-serve" element={<WhoWeServePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/blog" element={<ApprovedVendorListBlog />} />
          <Route path="/activate-account" element={<ActivateAccount />} />
          <Route path="/:societyId/dashboard/*" element={<DashboardLayout />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
