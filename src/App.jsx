import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import ActivateAccount from './pages/ActivateAccount';
import VendorTasksPage from './pages/VendorPortal/VendorTasksPage';
import GuardAppLayout from './pages/GuardApp/GuardAppLayout';
import GuardLogin from './pages/GuardApp/GuardLogin';
import SocietySetupWizardPage from './features/society-setup/SocietySetupWizardPage';
import SetupGuard from './features/society-setup/components/SetupGuard';

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
          <Route path="/" element={<LoginPage />} />
          <Route path="/activate-account" element={<ActivateAccount />} />
          <Route path="/guard-login" element={<GuardLogin />} />

          {/* Register Society Setup Wizard (Guard redirects to dashboard if already completed) */}
          <Route
            path="/setup"
            element={
              <SetupGuard mode="require-incomplete">
                <SocietySetupWizardPage />
              </SetupGuard>
            }
          />
          <Route
            path="/:societyId/setup"
            element={
              <SetupGuard mode="require-incomplete">
                <SocietySetupWizardPage />
              </SetupGuard>
            }
          />

          {/* Protected Dashboard Routes (Guard redirects to /setup if not completed) */}
          <Route
            path="/:societyId/dashboard/*"
            element={
              <SetupGuard mode="require-completed">
                <DashboardLayout />
              </SetupGuard>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <SetupGuard mode="require-completed">
                <DashboardLayout />
              </SetupGuard>
            }
          />

          <Route path="/:societyId/vendor-portal/*" element={<VendorTasksPage />} />
          <Route path="/:societyId/guard/*" element={<GuardAppLayout />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
