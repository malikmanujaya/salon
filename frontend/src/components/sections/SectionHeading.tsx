import { Box, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';

import { palette } from '@/theme/palette';

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: 'left' | 'center';
  light?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
}: Props) {
  const textColor = light ? palette.ivory : palette.purpleDeep;
  const muted = light ? alpha(palette.ivory, 0.7) : alpha(palette.purpleDeep, 0.7);

  return (
    <Box
      sx={{
        textAlign: align,
        maxWidth: 760,
        mx: align === 'center' ? 'auto' : 0,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="overline"
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            letterSpacing: '0.16em',
            display: 'inline-block',
            mb: 1.5,
          }}
        >
          {eyebrow}
        </Typography>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.05 }}
      >
        <Typography variant="h2" sx={{ color: textColor, mb: 2 }}>
          {title}
        </Typography>
      </motion.div>
      {description && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Typography variant="subtitle1" sx={{ color: muted }}>
            {description}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
}
