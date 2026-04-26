import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function MarketingLayout() {
  return (
    <>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </>
  );
}
