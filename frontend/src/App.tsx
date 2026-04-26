import { Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';

import ProtectedRoute from './components/auth/ProtectedRoute';
import MarketingLayout from './layouts/MarketingLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import DashboardPlaceholderPage from './pages/dashboard/DashboardPlaceholderPage';

export default function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHomePage />} />
            <Route path="bookings" element={<DashboardPlaceholderPage />} />
            <Route path="bookings/calendar" element={<DashboardPlaceholderPage />} />
            <Route path="customers" element={<DashboardPlaceholderPage />} />
            <Route path="staff" element={<DashboardPlaceholderPage />} />
            <Route path="services" element={<DashboardPlaceholderPage />} />
            <Route path="settings" element={<Navigate to="/dashboard/settings/profile" replace />} />
            <Route path="settings/profile" element={<DashboardPlaceholderPage />} />
            <Route path="settings/salon" element={<DashboardPlaceholderPage />} />
          </Route>
        </Route>
      </Routes>
    </Box>
  );
}
