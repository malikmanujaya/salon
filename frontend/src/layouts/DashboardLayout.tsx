import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Outlet, Link as RouterLink, NavLink, useLocation, useNavigate } from 'react-router-dom';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonPinRoundedIcon from '@mui/icons-material/PersonPinRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import type { SvgIconComponent } from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { BrandLogo, BrandLogoNavLink } from '@/components/brand/BrandLogo';
import { palette } from '@/theme/palette';

const STORAGE_KEY = 'lumora_sidebar_collapsed';
const DRAWER_EXPANDED = 280;
const DRAWER_COLLAPSED = 88;

type NavChild = { to: string; label: string; /** If true, only exact `to` matches (avoids parent path matching child routes). */ exact?: boolean };

type NavGroup = {
  type: 'group';
  key: string;
  label: string;
  icon: SvgIconComponent;
  children: NavChild[];
};

type NavLinkItem = {
  type: 'link';
  to: string;
  label: string;
  icon: SvgIconComponent;
  end?: boolean;
};

type NavEntry = NavLinkItem | NavGroup;

const NAV: NavEntry[] = [
  { type: 'link', to: '/overview', label: 'Overview', icon: DashboardRoundedIcon, end: true },
  {
    type: 'group',
    key: 'bookings',
    label: 'Bookings',
    icon: EventAvailableRoundedIcon,
    children: [
      { to: '/bookings', label: 'All bookings', exact: true },
      { to: '/calendar', label: 'Calendar' },
    ],
  },
  { type: 'link', to: '/customers', label: 'Customers', icon: GroupsRoundedIcon },
  { type: 'link', to: '/staff', label: 'Staff', icon: PersonPinRoundedIcon },
  { type: 'link', to: '/services', label: 'Services', icon: StyleRoundedIcon },
  {
    type: 'group',
    key: 'settings',
    label: 'Settings',
    icon: SettingsRoundedIcon,
    children: [
      { to: '/settings/profile', label: 'Profile' },
    ],
  },
];

/** Salon customers: bookings only (single-salon model; no branch or CRM navigation). */
const CUSTOMER_NAV: NavEntry[] = [
  { type: 'link', to: '/overview', label: 'Home', icon: DashboardRoundedIcon, end: true },
  {
    type: 'group',
    key: 'bookings',
    label: 'Bookings',
    icon: EventAvailableRoundedIcon,
    children: [
      { to: '/bookings', label: 'All bookings', exact: true },
      { to: '/calendar', label: 'Calendar' },
    ],
  },
];

function pathActive(pathname: string, to: string, end?: boolean): boolean {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function childPathActive(pathname: string, c: NavChild): boolean {
  if (c.exact) return pathname === c.to;
  return pathname === c.to || pathname.startsWith(`${c.to}/`);
}

function groupActive(pathname: string, children: NavChild[]): boolean {
  return children.some((c) => childPathActive(pathname, c));
}

function getDashboardPageTitle(pathname: string, isCustomer: boolean): string {
  if (pathname.startsWith('/settings/profile')) return 'Profile';
  if (pathname.startsWith('/calendar')) return 'Calendar';
  if (pathname.startsWith('/bookings')) return 'All bookings';
  if (pathname.startsWith('/customers')) return 'Customers';
  if (pathname.startsWith('/staff')) return 'Staff';
  if (pathname.startsWith('/services')) return 'Services';
  if (pathname === '/overview' || pathname === '/overview/') return isCustomer ? 'Home' : 'Overview';
  return 'Dashboard';
}

export default function DashboardLayout() {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navEntries = useMemo(
    () => (user?.role === 'CUSTOMER' ? CUSTOMER_NAV : NAV),
    [user?.role],
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const drawerWidth = mdUp ? (collapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED) : DRAWER_EXPANDED;

  const pageTitle = useMemo(
    () => getDashboardPageTitle(pathname, user?.role === 'CUSTOMER'),
    [pathname, user?.role],
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    const bookingsGroup = navEntries.find((x): x is NavGroup => x.type === 'group' && x.key === 'bookings');
    const settingsGroup = navEntries.find((x): x is NavGroup => x.type === 'group' && x.key === 'settings');
    setOpenGroups((g) => {
      const next = { ...g };
      if (bookingsGroup && groupActive(pathname, bookingsGroup.children)) next.bookings = true;
      if (settingsGroup && groupActive(pathname, settingsGroup.children)) next.settings = true;
      return next;
    });
  }, [pathname, navEntries]);

  const toggleGroup = (key: string) => {
    setOpenGroups((g) => ({ ...g, [key]: !g[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const renderNav = () =>
    navEntries.map((entry) => {
      if (entry.type === 'link') {
        const Icon = entry.icon;
        const selected = pathActive(pathname, entry.to, entry.end);
        const btn = (
          <ListItemButton
            key={entry.to}
            component={NavLink}
            to={entry.to}
            end={entry.end}
            selected={selected}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1.1,
              justifyContent: collapsed && mdUp ? 'center' : 'flex-start',
              px: collapsed && mdUp ? 1 : 2,
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed && mdUp ? 0 : 40, justifyContent: 'center' }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            {!(collapsed && mdUp) ? (
              <ListItemText
                primary={entry.label}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.92rem' }}
              />
            ) : null}
          </ListItemButton>
        );
        return collapsed && mdUp ? (
          <Tooltip key={entry.to} title={entry.label} placement="right">
            {btn}
          </Tooltip>
        ) : (
          btn
        );
      }

      const group = entry as NavGroup;
      const Icon = group.icon;
      const active = groupActive(pathname, group.children);
      const expanded = openGroups[group.key] ?? active;

      if (collapsed && mdUp) {
        const first = group.children[0]?.to ?? '/overview';
        const btn = (
          <ListItemButton
            key={group.key}
            component={RouterLink}
            to={first}
            selected={active}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1.1,
              justifyContent: 'center',
              px: 1,
              ...(active && {
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
              }),
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
              <Icon fontSize="small" />
            </ListItemIcon>
          </ListItemButton>
        );
        return (
          <Tooltip key={group.key} title={group.label} placement="right">
            {btn}
          </Tooltip>
        );
      }

      return (
        <Box key={group.key}>
          <ListItemButton
            onClick={() => toggleGroup(group.key)}
            selected={active && !expanded}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1.1,
              px: 2,
              color: active ? 'primary.main' : 'text.primary',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.main' : 'inherit' }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={group.label}
              primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem' }}
            />
            {expanded ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
          </ListItemButton>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 1.5, pr: 0.5, pb: 0.5 }}>
              {group.children.map((child) => {
                const subSelected = childPathActive(pathname, child);
                return (
                  <ListItemButton
                    key={child.to}
                    component={NavLink}
                    to={child.to}
                    selected={subSelected}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 2,
                      py: 0.85,
                      pl: 2,
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        fontWeight: 600,
                      },
                    }}
                  >
                    <ListItemText
                      primary={child.label}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        </Box>
      );
    });

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          px: collapsed && mdUp ? 1 : 2,
          py: collapsed && mdUp ? 2 : 2.5,
          borderBottom: `1px solid ${alpha(palette.purpleDeep, 0.08)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: collapsed && mdUp ? 'center' : 'stretch',
          minHeight: collapsed && mdUp ? 88 : 108,
          justifyContent: 'center',
        }}
      >
        <Box
          component={RouterLink}
          to="/overview"
          onClick={() => setMobileOpen(false)}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {collapsed && mdUp ? (
            <Tooltip title="Lumora · home" placement="right">
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <BrandLogo variant="sidebar-collapsed" />
              </Box>
            </Tooltip>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <BrandLogo variant="sidebar-expanded" />
            </Box>
          )}
        </Box>
      </Box>
      <Divider sx={{ opacity: 0.6 }} />
      <List sx={{ px: collapsed && mdUp ? 0.75 : 1.25, py: 1.5, flex: 1, overflowY: 'auto' }}>{renderNav()}</List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: alpha(palette.purpleDeep, 0.02) }}>
      <Box
        component="header"
        sx={{
          display: { md: 'none' },
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          bgcolor: alpha(palette.ivory, 0.92),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${alpha(palette.purpleDeep, 0.06)}`,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} aria-label="open menu">
            <MenuRoundedIcon />
          </IconButton>
          <BrandLogoNavLink to="/overview" onClick={() => setMobileOpen(false)} compact />
        </Toolbar>
      </Box>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, transition: 'width 0.22s ease' }}>
        <Drawer
          variant={mdUp ? 'permanent' : 'temporary'}
          open={mdUp ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: `1px solid ${alpha(palette.purpleDeep, 0.06)}`,
              bgcolor: palette.ivory,
              transition: 'width 0.22s ease',
              overflowX: 'hidden',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          transition: 'width 0.22s ease',
        }}
      >
        <Toolbar sx={{ display: { md: 'none' } }} />
        <Box
          component="header"
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.25,
            minHeight: 56,
            borderBottom: `1px solid ${alpha(palette.purpleDeep, 0.06)}`,
            bgcolor: alpha(palette.ivory, 0.98),
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.appBar - 1,
          }}
        >
          <IconButton
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              flexShrink: 0,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.14),
              },
            }}
          >
            {collapsed ? <ChevronRightRoundedIcon fontSize="small" /> : <ChevronLeftRoundedIcon fontSize="small" />}
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'text.primary' }}>
            {pageTitle}
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Avatar
              src={user?.avatarUrl ?? undefined}
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
            </Avatar>
            <Box sx={{ minWidth: 0, display: { xs: 'none', lg: 'block' } }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {user?.email}
              </Typography>
            </Box>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: 'text.secondary',
                py: 0.75,
                px: 1.25,
                minHeight: 36,
                '&:hover': { bgcolor: alpha(palette.purpleDeep, 0.06), color: 'error.main' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 30, justifyContent: 'center', color: 'inherit' }}>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Sign out"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}
              />
            </ListItemButton>
          </Box>
        </Box>
        <Box sx={{ flex: 1, p: { xs: 2.5, sm: 3.5 }, pt: { xs: 2, sm: 3.5 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

