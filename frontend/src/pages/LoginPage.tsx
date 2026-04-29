import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  alpha,
  Alert,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { motion } from 'framer-motion';

import { LabeledTextField } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../lib/apiError';
import { elevationShadow, gradients, palette } from '@/theme/palette';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/overview';
  const { user, loading: authLoading, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(from, { replace: true });
    }
  }, [authLoading, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password, remember);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to sign in.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container sx={{ flex: 1, minHeight: { xs: 'auto', md: 'calc(100vh - 73px)' } }}>
      <Grid
        size={{ xs: 12, md: 5 }}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          px: 6,
          py: 8,
          background: gradients.loginPanel,
          color: palette.ivory,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(55% 45% at 90% 12%, ${alpha(palette.rose, 0.35)}, transparent 55%), radial-gradient(50% 50% at 0% 88%, ${alpha(palette.gold, 0.22)}, transparent 55%)`,
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ position: 'relative', maxWidth: 400 }}>
          <Typography
            variant="overline"
            sx={{ color: alpha(palette.ivory, 0.75), letterSpacing: '0.2em', fontWeight: 700 }}
          >
            Lumora
          </Typography>
          <Typography
            variant="h3"
            sx={{
              mt: 2,
              mb: 2,
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              color: palette.ivory,
              lineHeight: 1.15,
            }}
          >
            Welcome back to your salon command centre.
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(palette.ivory, 0.88), lineHeight: 1.75 }}>
            Bookings, staff, customers, and reminders — sign in to pick up where you left off.
          </Typography>
        </Box>
      </Grid>

      <Grid
        size={{ xs: 12, md: 7 }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.5, sm: 4 },
          py: { xs: 5, md: 6 },
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          sx={{ width: '100%', maxWidth: 420 }}
        >
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              mb: 3,
              p: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(palette.purple, 0.12)}, ${alpha(palette.orchid, 0.08)})`,
              border: `1px solid ${alpha(palette.purple, 0.15)}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Access your Lumora dashboard.
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, mb: 0.5 }}
          >
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            New here?{' '}
            <Link component={RouterLink} to="/signup" fontWeight={600} underline="hover">
              Create an account
            </Link>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 0, sm: 3.5 },
              borderRadius: 3,
              bgcolor: { xs: 'transparent', sm: 'background.paper' },
              border: { xs: 'none', sm: `1px solid ${alpha(palette.purpleDeep, 0.08)}` },
              boxShadow: { xs: 'none', sm: elevationShadow.authFormPaper },
            }}
          >
            <Stack spacing={2.25}>
              <LabeledTextField
                label="Work email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <LabeledTextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      color="primary"
                      disabled={submitting}
                    />
                  }
                  label="Stay signed in"
                />
                <Link component={RouterLink} to="/forgot-password" variant="body2" fontWeight={600} underline="hover">
                  Forgot password?
                </Link>
              </Stack>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={submitting}
                sx={{ py: 1.35 }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
