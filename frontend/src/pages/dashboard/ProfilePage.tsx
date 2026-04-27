import { useEffect, useRef, useState } from 'react';
import { Alert, Avatar, Box, Button, Paper, Stack, Typography, alpha } from '@mui/material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { LabeledTextField } from '@/components/ui/LabeledTextField';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import { palette } from '@/theme/palette';
import type { AuthUser } from '@/types/user';

export default function ProfilePage() {
  const { user, loading, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName ?? '');
    setEmail(user.email ?? '');
    setPhone(user.phone ?? '');
    setAvatarUrl(user.avatarUrl ?? null);
  }, [user]);

  const onPickAvatar = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError('Image must be 5MB or smaller.');
      return;
    }
    setError(null);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read image.'));
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.readAsDataURL(file);
    });
    setAvatarUrl(dataUrl);
  };

  const submit = async () => {
    setError(null);
    setSuccess(null);
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (phone.trim() && !/^\d{10}$/.test(phone.trim())) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setSaving(true);
    try {
      await api.patch<AuthUser>('/auth/me', {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl ?? '',
      });
      await refreshProfile();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Profile" description="Manage your account details." />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Profile" description="Update your personal details and profile avatar." />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      ) : null}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          border: (t) => `1px solid ${t.palette.divider}`,
          maxWidth: 840,
          background: `linear-gradient(160deg, ${alpha(palette.white, 1)} 0%, ${alpha(palette.ivory, 0.92)} 100%)`,
        }}
      >
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              p: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(palette.purpleDeep, 0.08)}`,
              bgcolor: alpha(palette.white, 0.9),
            }}
          >
            <Avatar
              src={avatarUrl ?? undefined}
              sx={{
                width: 82,
                height: 82,
                bgcolor: 'primary.main',
                fontWeight: 800,
                fontSize: '1.6rem',
              }}
            >
              {fullName?.charAt(0)?.toUpperCase() || user?.fullName?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Profile photo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
                Upload a square image (JPG/PNG/WebP), max 5MB.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PhotoCameraRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose image
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => setAvatarUrl(null)}
                  disabled={!avatarUrl}
                >
                  Remove
                </Button>
              </Stack>
              <Box
                component="input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => void onPickAvatar(event.target.files?.[0] ?? null)}
                sx={{ display: 'none' }}
              />
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <LabeledTextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <LabeledTextField
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </Stack>
          <LabeledTextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />

          <Box sx={{ pt: 0.5, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={submit}
              disabled={saving}
            >
              Save changes
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
        Role: {user?.role ?? '—'}
      </Typography>
    </Box>
  );
}

