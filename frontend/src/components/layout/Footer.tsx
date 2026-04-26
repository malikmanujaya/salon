import { Box, Container, Typography, Stack, IconButton, Divider, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';

import Logo from '../brand/Logo';
import { palette } from '@/theme/palette';

const COLUMNS = [
  {
    title: 'Product',
    links: ['Features', 'Roadmap', 'Changelog'],
  },
  {
    title: 'Solutions',
    links: ['Hair salons', 'Spa & wellness', 'Bridal studios', 'Multi-branch'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact', 'Careers', 'Blog'],
  },
  {
    title: 'Resources',
    links: ['Help center', 'API docs', 'Privacy', 'Terms'],
  },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        bgcolor: palette.purpleDeep,
        color: alpha(palette.ivory, 0.85),
        pt: { xs: 8, md: 12 },
        pb: 4,
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(60% 50% at 90% 0%, ${alpha(palette.orchid, 0.18)}, transparent 60%), radial-gradient(50% 50% at 0% 100%, ${alpha(palette.rose, 0.1)}, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <Container sx={{ position: 'relative' }}>
        <Grid container spacing={{ xs: 5, md: 6 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ filter: 'invert(1) hue-rotate(180deg)', mb: 2.5 }}>
              <Logo />
            </Box>
            <Typography
              variant="body2"
              sx={{ color: alpha(palette.ivory, 0.7), maxWidth: 360, mb: 3 }}
            >
              Lumora helps Sri Lankan salons run stress-free days — bookings,
              staff, customers and SMS reminders, all in one place.
            </Typography>
            <Stack direction="row" spacing={1}>
              {[InstagramIcon, FacebookIcon, WhatsAppIcon, EmailIcon].map(
                (Icon, i) => (
                  <IconButton
                    key={i}
                    sx={{
                      color: alpha(palette.ivory, 0.85),
                      bgcolor: alpha(palette.ivory, 0.06),
                      '&:hover': {
                        bgcolor: alpha(palette.orchid, 0.2),
                        color: palette.white,
                      },
                    }}
                    size="small"
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ),
              )}
            </Stack>
          </Grid>

          {COLUMNS.map((col) => (
            <Grid size={{ xs: 6, md: 2 }} key={col.title}>
              <Typography
                variant="overline"
                sx={{
                  color: palette.orchid,
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                }}
              >
                {col.title}
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                {col.links.map((link) => (
                  <Typography
                    key={link}
                    component="a"
                    href="#"
                    variant="body2"
                    sx={{
                      color: alpha(palette.ivory, 0.75),
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      '&:hover': { color: palette.white },
                    }}
                  >
                    {link}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 5, borderColor: alpha(palette.ivory, 0.08) }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Typography variant="body2" sx={{ color: alpha(palette.ivory, 0.55) }}>
            © {new Date().getFullYear()} Lumora. Made with care in Sri Lanka.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography
              component="a"
              href="#"
              variant="body2"
              sx={{ color: alpha(palette.ivory, 0.6), '&:hover': { color: palette.white } }}
            >
              Privacy
            </Typography>
            <Typography
              component="a"
              href="#"
              variant="body2"
              sx={{ color: alpha(palette.ivory, 0.6), '&:hover': { color: palette.white } }}
            >
              Terms
            </Typography>
            <Typography
              component="a"
              href="#"
              variant="body2"
              sx={{ color: alpha(palette.ivory, 0.6), '&:hover': { color: palette.white } }}
            >
              Status
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
