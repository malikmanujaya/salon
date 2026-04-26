import { Box, Container, Typography, Button, Stack, Chip, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { motion } from 'framer-motion';

import SectionHeading from './SectionHeading';

type Plan = {
  name: string;
  tagline: string;
  price: string;
  perMonth?: boolean;
  features: string[];
  cta: string;
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Starter',
    tagline: 'For single-chair studios trying Lumora.',
    price: 'LKR 4,900',
    perMonth: true,
    features: [
      'Up to 2 staff',
      'Unlimited bookings',
      '500 SMS reminders / month',
      'Customer CRM',
      'Daily dashboard',
    ],
    cta: 'Start free trial',
  },
  {
    name: 'Salon',
    tagline: 'The most popular plan for established salons.',
    price: 'LKR 9,900',
    perMonth: true,
    features: [
      'Up to 10 staff',
      'Unlimited bookings',
      '2,500 SMS reminders / month',
      'Multi-service & multi-stylist',
      'Reports & audit log',
      'Priority WhatsApp support',
    ],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Chain',
    tagline: 'For multi-branch and franchise salons.',
    price: 'Custom',
    features: [
      'Unlimited staff & branches',
      'Unlimited SMS (own provider)',
      'Branch-level reports',
      'Custom roles & permissions',
      'Dedicated onboarding',
      '99.9% uptime SLA',
    ],
    cta: 'Talk to sales',
  },
];

export default function Pricing() {
  return (
    <Box id="pricing" component="section" sx={{ py: { xs: 10, md: 14 } }}>
      <Container>
        <SectionHeading
          eyebrow="Simple pricing"
          title="One fair price. Everything that matters, included."
          description="No hidden setup fees. No per-booking charges. Cancel anytime."
        />

        <Grid container spacing={3} sx={{ mt: { xs: 4, md: 6 } }} alignItems="stretch">
          {PLANS.map((plan, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={plan.name}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                style={{ height: '100%' }}
              >
                <PlanCard plan={plan} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        bgcolor: plan.highlight ? '#1A0F1F' : '#fff',
        color: plan.highlight ? '#FAF6F2' : 'text.primary',
        border: plan.highlight
          ? '1px solid transparent'
          : `1px solid ${alpha('#1A0F1F', 0.08)}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: plan.highlight
          ? '0 30px 80px -20px rgba(123,44,191,0.4)'
          : 'none',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      {plan.highlight && (
        <>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(60% 50% at 80% 0%, rgba(199,125,255,0.25), transparent 60%), radial-gradient(50% 50% at 0% 100%, rgba(232,180,184,0.18), transparent 60%)',
              pointerEvents: 'none',
            }}
          />
          <Chip
            label="Most popular"
            size="small"
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              bgcolor: alpha('#C77DFF', 0.18),
              color: '#E8B4B8',
              fontWeight: 700,
              border: `1px solid ${alpha('#C77DFF', 0.4)}`,
            }}
          />
        </>
      )}

      <Box sx={{ position: 'relative' }}>
        <Typography
          variant="overline"
          sx={{
            color: plan.highlight ? '#C77DFF' : 'primary.main',
            letterSpacing: '0.16em',
            fontWeight: 700,
          }}
        >
          {plan.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: plan.highlight ? alpha('#FAF6F2', 0.7) : 'text.secondary',
            mt: 0.5,
            mb: 3,
          }}
        >
          {plan.tagline}
        </Typography>

        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: '2.5rem',
              lineHeight: 1,
            }}
          >
            {plan.price}
          </Typography>
          {plan.perMonth && (
            <Typography
              variant="body2"
              sx={{
                color: plan.highlight
                  ? alpha('#FAF6F2', 0.6)
                  : 'text.secondary',
              }}
            >
              / month
            </Typography>
          )}
        </Stack>

        <Button
          variant={plan.highlight ? 'contained' : 'outlined'}
          color="primary"
          fullWidth
          size="large"
          sx={{
            py: 1.5,
            mb: 3,
            ...(plan.highlight
              ? {}
              : {
                  borderColor: alpha('#1A0F1F', 0.15),
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha('#7B2CBF', 0.04),
                  },
                }),
          }}
        >
          {plan.cta}
        </Button>

        <Stack spacing={1.5}>
          {plan.features.map((f) => (
            <Stack key={f} direction="row" spacing={1.25} alignItems="flex-start">
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: plan.highlight
                    ? alpha('#C77DFF', 0.25)
                    : alpha('#7B2CBF', 0.12),
                  color: plan.highlight ? '#E8B4B8' : 'primary.main',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  mt: '2px',
                }}
              >
                <CheckRoundedIcon sx={{ fontSize: 13 }} />
              </Box>
              <Typography variant="body2">{f}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
