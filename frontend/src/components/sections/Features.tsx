import { Box, Container, Typography, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonPinRoundedIcon from '@mui/icons-material/PersonPinRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import StoreMallDirectoryRoundedIcon from '@mui/icons-material/StoreMallDirectoryRounded';
import { motion } from 'framer-motion';
import type { SvgIconComponent } from '@mui/icons-material';

import SectionHeading from './SectionHeading';

type Feature = {
  icon: SvgIconComponent;
  title: string;
  description: string;
  color: string;
};

const FEATURES: Feature[] = [
  {
    icon: EventAvailableRoundedIcon,
    title: 'Smart bookings',
    description:
      'Create, edit and reschedule appointments in seconds. Double-bookings are prevented automatically across staff and services.',
    color: '#7B2CBF',
  },
  {
    icon: GroupsRoundedIcon,
    title: 'Staff & schedules',
    description:
      'Working hours, lunch breaks, leave days, services per stylist — all in one calm calendar your team will actually use.',
    color: '#C77DFF',
  },
  {
    icon: PersonPinRoundedIcon,
    title: 'Customer CRM',
    description:
      'Search by phone in seconds. See every visit, every preference, every note — so loyal customers feel remembered.',
    color: '#E8B4B8',
  },
  {
    icon: SmsRoundedIcon,
    title: 'SMS that arrive',
    description:
      'Confirmations and reminders via Dialog, Mobitel, Notify.lk or Twilio. Pick the provider that works for your salon.',
    color: '#D4A574',
  },
  {
    icon: StyleRoundedIcon,
    title: 'Services & pricing',
    description:
      'Categories, durations, prices, assigned staff. Update once and it flows through bookings, invoices and reminders.',
    color: '#5A189A',
  },
  {
    icon: InsightsRoundedIcon,
    title: 'Daily dashboard',
    description:
      'Today, this week, no-shows, top services, busiest stylists. Know how the salon is doing — at a glance.',
    color: '#10B981',
  },
  {
    icon: StoreMallDirectoryRoundedIcon,
    title: 'Multi-branch ready',
    description:
      'Built tenant-first. Start with one branch and expand to a chain without ever migrating your data.',
    color: '#F59E0B',
  },
  {
    icon: ShieldRoundedIcon,
    title: 'Roles & audit logs',
    description:
      'Owner, receptionist, stylist — each with the right access. Every important change is logged for trust and recovery.',
    color: '#1A0F1F',
  },
];

export default function Features() {
  return (
    <Box id="features" component="section" sx={{ py: { xs: 10, md: 14 } }}>
      <Container>
        <SectionHeading
          eyebrow="Everything you need"
          title="The whole salon, finally in one place."
          description="From the front desk to the chair, every workflow your team relies on — designed for the way Sri Lankan salons actually work."
        />

        <Grid container spacing={3} sx={{ mt: { xs: 4, md: 6 } }}>
          {FEATURES.map((feature, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={feature.title}>
              <FeatureCard feature={feature} index={i} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.06 }}
      style={{ height: '100%' }}
    >
      <Box
        sx={{
          height: '100%',
          p: 3.5,
          borderRadius: 3,
          bgcolor: '#fff',
          border: `1px solid ${alpha('#1A0F1F', 0.06)}`,
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: alpha(feature.color, 0.3),
            boxShadow: `0 20px 40px -20px ${alpha(feature.color, 0.4)}`,
          },
          '&:hover .feature-icon': {
            transform: 'scale(1.08) rotate(-4deg)',
          },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(feature.color, 0.12)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <Box
          className="feature-icon"
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            bgcolor: alpha(feature.color, 0.12),
            color: feature.color,
            display: 'grid',
            placeItems: 'center',
            mb: 2.5,
            transition: 'transform 0.3s ease',
          }}
        >
          <Icon />
        </Box>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
          {feature.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {feature.description}
        </Typography>
      </Box>
    </motion.div>
  );
}
