import { type ChangeEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, Typography, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Grid from '@mui/material/Grid2';

import { LabeledTextField } from '@/components/ui';
import { getApiErrorMessage } from '@/lib/apiError';
import { gradients, palette } from '@/theme/palette';
import { requestPasswordResetOtp, resetPasswordWithOtp, verifyPasswordResetOtp } from '@/features/auth/api';

export default function ForgotPasswordOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string } | null)?.phone?.trim() ?? '';

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(56);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const otp = useMemo(() => digits.join(''), [digits]);
  const maskedPhone = useMemo(() => {
    const raw = phone.replace(/\D/g, '');
    if (raw.length < 7) return phone;
    const first = raw.slice(0, 5);
    const last = raw.slice(-3);
    return `${first}xxxx${last}`;
  }, [phone]);

  if (!phone) {
    return <Navigate to="/forgot-password" replace />;
  }

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const setDigit = (idx: number, value: string) => {
    const d = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = d;
      return next;
    });
    if (d && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const onKeyDown = (idx: number, key: string) => {
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setInfo(null);
    if (otp.length !== 6) {
      setError('Enter all 6 OTP digits.');
      return;
    }
    setBusy(true);
    try {
      const data = await verifyPasswordResetOtp({ phone, otp });
      setResetToken(data.resetToken);
      setInfo('OTP verified. Set your new password.');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Invalid OTP.'));
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await requestPasswordResetOtp({ phone });
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setInfo('A new OTP was sent.');
      setSecondsLeft(56);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not resend OTP.'));
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setError(null);
    setInfo(null);
    if (!resetToken) {
      setError('Verify OTP first.');
      return;
    }
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
      await resetPasswordWithOtp({ phone, resetToken, newPassword });
      navigate('/login', { replace: true });
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
          <Typography variant="overline" sx={{ color: alpha(palette.ivory, 0.8), letterSpacing: '0.2em', fontWeight: 700 }}>
            Lumora
          </Typography>
          <Typography
            variant="h3"
            sx={{ mt: 2, mb: 2, fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, color: palette.ivory, lineHeight: 1.15 }}
          >
            Verify OTP and reset your password.
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(palette.ivory, 0.88), lineHeight: 1.75 }}>
            Secure verification for {maskedPhone}. Enter the code to continue.
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
        <Box sx={{ width: '100%', maxWidth: 560 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Verify OTP
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
          We sent a code to the number {maskedPhone}.
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert> : null}
        {info ? <Alert severity="info" sx={{ mb: 2 }} onClose={() => setInfo(null)}>{info}</Alert> : null}

        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2, fontWeight: 700 }}>
          Enter OTP
        </Typography>

        <Stack direction="row" spacing={1.6} justifyContent="center" sx={{ mb: 4 }}>
          {digits.map((d, idx) => (
            <Box
              key={idx}
              component="input"
              ref={(el: HTMLInputElement | null) => {
                inputRefs.current[idx] = el;
              }}
              value={d}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDigit(idx, e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => onKeyDown(idx, e.key)}
              inputMode="numeric"
              maxLength={1}
              sx={{
                width: { xs: 46, sm: 70 },
                height: { xs: 56, sm: 72 },
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                borderRadius: 2,
                border: `1px solid ${alpha(palette.purpleDeep, 0.18)}`,
                backgroundColor: alpha(palette.white, 0.95),
                color: 'text.primary',
                outline: 'none',
                transition: 'all 120ms ease',
                '&:focus': {
                  borderColor: palette.purple,
                  boxShadow: `0 0 0 3px ${alpha(palette.purple, 0.2)}`,
                },
              }}
            />
          ))}
        </Stack>

        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 3, fontWeight: 500 }}>
          OTP expires in{' '}
          <Box component="span" sx={{ color: palette.roseDark, fontWeight: 700 }}>
            0:{String(secondsLeft).padStart(2, '0')}
          </Box>
        </Typography>

        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={() => void verifyOtp()}
          disabled={busy || otp.length !== 6}
          sx={{ mb: 2, py: 1.45, fontSize: '1.25rem' }}
        >
          Verify OTP
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/forgot-password')}
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ color: palette.roseDark, fontWeight: 700, fontSize: '1.25rem', mb: 3 }}
        >
          Back
        </Button>

        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: resetToken ? 2 : 0, fontWeight: 500 }}>
          Didn't receive the OTP? Check your registered contact or try{' '}
          <Link
            component="button"
            type="button"
            onClick={() => {
              if (secondsLeft === 0 && !busy) void resendOtp();
            }}
            underline="hover"
            fontWeight={700}
            sx={{ cursor: secondsLeft === 0 && !busy ? 'pointer' : 'not-allowed', opacity: secondsLeft === 0 ? 1 : 0.6 }}
          >
            resending
          </Link>
          .
        </Typography>

        {resetToken ? (
          <Box sx={{ mt: 3 }}>
            <Stack spacing={2}>
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
              <Button variant="contained" onClick={() => void resetPassword()} disabled={busy} fullWidth>
                Reset password
              </Button>
            </Stack>
          </Box>
        ) : null}
        </Box>
      </Grid>
    </Grid>
  );
}

