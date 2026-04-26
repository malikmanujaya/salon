import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Button, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import Logo from '../components/brand/Logo';
import { palette } from '@/theme/palette';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Box
        component="header"
        sx={{
          py: 2.25,
          px: { xs: 2, sm: 3 },
          borderBottom: `1px solid ${alpha(palette.purpleDeep, 0.06)}`,
          bgcolor: alpha(palette.ivory, 0.8),
          backdropFilter: 'blur(12px)',
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Logo />
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackRoundedIcon />}
            color="inherit"
            size="medium"
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            Home
          </Button>
        </Container>
      </Box>
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
