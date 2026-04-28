import { Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';

import ProtectedRoute from './components/auth/ProtectedRoute';
import MarketingLayout from './layouts/MarketingLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardHomePage from './features/dashboard/pages/DashboardHomePage';
import BookingsPage from './features/bookings/pages/BookingsPage';
import CalendarPage from './features/bookings/pages/CalendarPage';
import CustomersPage from './features/customers/pages/CustomersPage';
import StaffPage from './features/staff/pages/StaffPage';
import ServicesPage from './features/services/pages/ServicesPage';
import ProfilePage from './features/profile/pages/ProfilePage';

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
          <Route path="/" element={<DashboardLayout />}>
            <Route path="overview" element={<DashboardHomePage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="settings" element={<Navigate to="/settings/profile" replace />} />
            <Route path="settings/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
          <Route path="/dashboard/bookings" element={<Navigate to="/bookings" replace />} />
          <Route path="/dashboard/bookings/calendar" element={<Navigate to="/calendar" replace />} />
          <Route path="/dashboard/calendar" element={<Navigate to="/calendar" replace />} />
          <Route path="/dashboard/customers" element={<Navigate to="/customers" replace />} />
          <Route path="/dashboard/staff" element={<Navigate to="/staff" replace />} />
          <Route path="/dashboard/services" element={<Navigate to="/services" replace />} />
          <Route path="/dashboard/settings" element={<Navigate to="/settings/profile" replace />} />
          <Route path="/dashboard/settings/profile" element={<Navigate to="/settings/profile" replace />} />
        </Route>
      </Routes>
    </Box>
  );
}
