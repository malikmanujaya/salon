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
import BookingsPage from './pages/dashboard/BookingsPage';
import CalendarPage from './pages/dashboard/CalendarPage';
import CustomersPage from './pages/dashboard/CustomersPage';
import StaffPage from './pages/dashboard/StaffPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import ProfilePage from './pages/dashboard/ProfilePage';

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
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/calendar" element={<CalendarPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="settings" element={<Navigate to="/dashboard/settings/profile" replace />} />
            <Route path="settings/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </Box>
  );
}
