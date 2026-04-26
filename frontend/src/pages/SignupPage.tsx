import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  alpha,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the terms to continue.');
      return;
    }
    setSubmitted(true);
    // Wire to NestJS registration when ready
  };

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
          background:
            'linear-gradient(165deg, #5A189A 0%, #7B2CBF 42%, #C77DFF 88%, #E8B4B8 100%)',
          color: '#1A0F1F',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(60% 50% at 12% 18%, rgba(250,246,242,0.45), transparent 55%), radial-gradient(45% 40% at 95% 85%, rgba(26,15,31,0.12), transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ position: 'relative', maxWidth: 400 }}>
          <Typography variant="overline" sx={{ letterSpacing: '0.2em', fontWeight: 800, opacity: 0.85 }}>
            Join Lumora
          </Typography>
          <Typography
            variant="h3"
            sx={{
              mt: 2,
              mb: 2,
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            One calm place for your whole front desk.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.92, lineHeight: 1.75, fontWeight: 500 }}>
            Create an account to manage bookings, staff, and SMS reminders built for salons in Sri Lanka.
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
          sx={{ width: '100%', maxWidth: 460 }}
        >
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              mb: 3,
              p: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha('#7B2CBF', 0.12)}, ${alpha('#E8B4B8', 0.15)})`,
              border: `1px solid ${alpha('#7B2CBF', 0.12)}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Set up your salon workspace in minutes.
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, mb: 0.5 }}
          >
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Already registered?{' '}
            <Link component={RouterLink} to="/login" fontWeight={600} underline="hover">
              Sign in
            </Link>
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {submitted && !error && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitted(false)}>
              Registration will connect to the API once sign-up is enabled on the backend.
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 0, sm: 3.5 },
              borderRadius: 3,
              bgcolor: { xs: 'transparent', sm: 'background.paper' },
              border: { xs: 'none', sm: `1px solid ${alpha('#1A0F1F', 0.08)}` },
              boxShadow: { xs: 'none', sm: '0 24px 48px -24px rgba(26,15,31,0.12)' },
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Full name"
                name="name"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Work email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Phone (optional)"
                type="tel"
                name="phone"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                placeholder="+94 …"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                helperText="At least 8 characters."
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
              <TextField
                label="Confirm password"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link href="#" fontWeight={600} underline="hover">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="#" fontWeight={600} underline="hover">
                      Privacy policy
                    </Link>
                    .
                  </Typography>
                }
              />
              <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ py: 1.35 }}>
                Create account
              </Button>
            </Stack>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
