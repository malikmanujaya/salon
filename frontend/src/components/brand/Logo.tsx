import { Box } from '@mui/material';
import { motion } from 'framer-motion';

import { BrandLogoNavLink } from './BrandLogo';

export default function Logo() {
  return (
    <Box
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      sx={{ display: 'inline-flex' }}
    >
      <BrandLogoNavLink />
    </Box>
  );
}
