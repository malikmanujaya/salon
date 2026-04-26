import { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

import Logo from '../brand/Logo';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        component={motion.div}
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        sx={{
          bgcolor: scrolled
            ? alpha('#FAF6F2', 0.85)
            : 'transparent',
          backdropFilter: scrolled ? 'saturate(180%) blur(14px)' : 'none',
          borderBottom: scrolled
            ? `1px solid ${alpha('#1A0F1F', 0.06)}`
            : '1px solid transparent',
          color: 'text.primary',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        <Container>
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 } }}>
            <Logo />
            <Box sx={{ flexGrow: 1 }} />
            <Stack
              direction="row"
              spacing={1}
              sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}
            >
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.href}
                  href={link.href}
                  color="inherit"
                  sx={{
                    color: 'text.secondary',
                    px: 1.5,
                    '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <Button color="inherit" sx={{ color: 'text.primary' }}>
                Sign in
              </Button>
              <Button variant="contained" color="primary">
                Start free trial
              </Button>
            </Stack>
            <IconButton
              edge="end"
              onClick={() => setOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 320, p: 2 } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Logo />
          <IconButton onClick={() => setOpen(false)} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>
        <AnimatePresence>
          <List>
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    component="a"
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    <ListItemText
                      primary={link.label}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </motion.div>
            ))}
          </List>
        </AnimatePresence>
        <Stack spacing={1.5} sx={{ mt: 3, px: 2 }}>
          <Button variant="outlined" color="primary" fullWidth>
            Sign in
          </Button>
          <Button variant="contained" color="primary" fullWidth>
            Start free trial
          </Button>
        </Stack>
      </Drawer>

      <Toolbar sx={{ minHeight: { xs: 64, md: 76 } }} />
    </>
  );
}
