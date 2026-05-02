import { Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';

import ProtectedRoute from './components/auth/ProtectedRoute';
import MarketingLayout from './layouts/MarketingLayout';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './app/layout';
import HomePage from './app/page';
import LoginPage from './app/login/page';
import ForgotPasswordPage from './app/forgot-password/page';
import ForgotPasswordOtpPage from './app/forgot-password/otp/page';
import SignupPage from './app/signup/page';
import DashboardHomePage from './app/overview/page';
import BookingsPage from './app/bookings/page';
import NewBookingPage from './app/bookings/new/page';
import CalendarPage from './app/calendar/page';
import CustomersPage from './app/customers/page';
import StaffPage from './app/staff/page';
import ServicesPage from './app/services/page';
import ProfilePage from './app/settings/profile/page';

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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password/otp" element={<ForgotPasswordOtpPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route path="overview" element={<DashboardHomePage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/new" element={<NewBookingPage />} />
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
