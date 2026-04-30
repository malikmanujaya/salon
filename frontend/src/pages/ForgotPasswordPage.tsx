import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, Typography, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { LabeledTextField } from '@/components/ui';
import { getApiErrorMessage } from '@/lib/apiError';
import { gradients, palette } from '@/theme/palette';
import { requestPasswordResetOtp } from '@/features/auth/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOtpAndContinue = async () => {
    setError(null);
    if (!phone.trim()) {
      setError('Phone is required.');
      return;
    }
    setBusy(true);
    try {
      await requestPasswordResetOtp({ phone: phone.trim() });
      navigate('/forgot-password/otp', { state: { phone: phone.trim() } });
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not request OTP.'));
    } finally {
      setBusy(false);
    }
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
          background: gradients.loginPanel,
          color: palette.ivory,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(55% 45% at 90% 12%, ${alpha(palette.rose, 0.3)}, transparent 55%), radial-gradient(50% 50% at 0% 88%, ${alpha(palette.gold, 0.25)}, transparent 55%)`,
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ position: 'relative', maxWidth: 400 }}>
          <Typography
            variant="overline"
            sx={{ color: alpha(palette.ivory, 0.8), letterSpacing: '0.2em', fontWeight: 700 }}
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
            Reset your account password securely.
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(palette.ivory, 0.88), lineHeight: 1.75 }}>
            We will send a one-time code to your phone, then you can set a new password.
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
        <Box sx={{ width: '100%', maxWidth: 460 }}>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, mb: 0.5 }}>
            Forgot password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your registered phone number to receive an OTP.
          </Typography>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : null}

          <Box
            sx={{
              p: { xs: 0, sm: 3.5 },
              borderRadius: 3,
              bgcolor: { xs: 'transparent', sm: 'background.paper' },
              border: { xs: 'none', sm: `1px solid ${alpha(palette.purpleDeep, 0.08)}` },
              boxShadow: { xs: 'none', sm: `0 24px 48px -24px ${alpha(palette.purpleDeep, 0.12)}` },
            }}
          >
            <Stack spacing={2}>
              <LabeledTextField
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={busy}
              />
              <Button variant="contained" onClick={() => void requestOtpAndContinue()} disabled={busy}>
                Continue to OTP
              </Button>
              <Typography variant="caption" color="text.secondary">
                We only continue if the phone is valid and registered.
              </Typography>
              <Button
                variant="text"
                onClick={() => {
                  navigate('/login', { replace: true });
                }}
              >
                Back to sign in
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Remembered your password?{' '}
            <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

