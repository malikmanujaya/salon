import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, Typography, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { LabeledTextField } from '@/components/ui';
import { getApiErrorMessage } from '@/lib/apiError';
import { gradients, palette } from '@/theme/palette';
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  verifyPasswordResetOtp,
} from '@/features/auth/api';

type Step = 'request' | 'verify' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const requestOtp = async () => {
    setError(null);
    setInfo(null);
    if (!phone.trim()) {
      setError('Phone is required.');
      return;
    }
    setBusy(true);
    try {
      const data = await requestPasswordResetOtp({ phone: phone.trim() });
      setInfo(data.message);
      setStep('verify');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not request OTP.'));
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setInfo(null);
    if (!otp.trim()) {
      setError('OTP is required.');
      return;
    }
    setBusy(true);
    try {
      const data = await verifyPasswordResetOtp({ phone: phone.trim(), otp: otp.trim() });
      setResetToken(data.resetToken);
      setInfo('OTP verified. You can now set a new password.');
      setStep('reset');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Invalid OTP.'));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setError(null);
    setInfo(null);
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await resetPasswordWithOtp({
        phone: phone.trim(),
        resetToken,
        newPassword,
      });
      setStep('done');
      setInfo('Password reset successful. You can sign in now.');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not reset password.'));
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
            Reset your password with an SMS OTP.
          </Typography>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : null}
          {info ? (
            <Alert severity="info" sx={{ mb: 2 }} onClose={() => setInfo(null)}>
              {info}
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
                disabled={step !== 'request' && step !== 'verify'}
              />

              {step === 'verify' ? (
                <LabeledTextField
                  label="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  helperText="Enter the 6-digit code sent via SMS."
                />
              ) : null}

              {step === 'reset' ? (
                <>
                  <LabeledTextField
                    label="New password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <LabeledTextField
                    label="Confirm password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </>
              ) : null}

              {step === 'request' ? (
                <Button variant="contained" onClick={() => void requestOtp()} disabled={busy}>
                  Send OTP
                </Button>
              ) : null}

              {step === 'verify' ? (
                <Stack direction="row" spacing={1.5}>
                  <Button variant="contained" onClick={() => void verifyOtp()} disabled={busy}>
                    Verify OTP
                  </Button>
                  <Button variant="outlined" onClick={() => void requestOtp()} disabled={busy}>
                    Resend OTP
                  </Button>
                </Stack>
              ) : null}

              {step === 'reset' ? (
                <Button variant="contained" onClick={() => void resetPassword()} disabled={busy}>
                  Reset password
                </Button>
              ) : null}

              {step === 'done' ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    navigate('/login', { replace: true });
                  }}
                >
                  Back to sign in
                </Button>
              ) : null}
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

