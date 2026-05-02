import {
  Avatar,
  Badge,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { notificationsApi } from '@/api/notifications';
import type { NotificationDto, Role } from '@/api/types';
import {
  AssistantIcon,
  BellIcon,
  DashboardIcon,
  LogoutIcon,
  PanelIcon,
  RequestsIcon,
  ServicesIcon,
  SettingsIcon,
} from '@/components/icons/AppIcons';
import { formatDateTime, humanizeRole, initials } from '@/lib/format';
import { useAuth } from '@/lib/useAuth';

import styles from './AppShell.module.css';

interface NavItem {
  label: string;
  to: string;
  icon: typeof DashboardIcon;
}

function primaryItemsForRole(role: Role): NavItem[] {
  if (role === 'ADMINISTRATOR') {
    return [
      { label: 'Dashboard', to: '/admin/dashboard', icon: DashboardIcon },
      { label: 'Services', to: '/services', icon: ServicesIcon },
      { label: 'AI Assistant', to: '/assistant', icon: AssistantIcon },
    ];
  }

  if (role === 'OFFICER') {
    return [
      { label: 'Dashboard', to: '/officer/dashboard', icon: DashboardIcon },
      { label: 'Services', to: '/services', icon: ServicesIcon },
      { label: 'AI Assistant', to: '/assistant', icon: AssistantIcon },
    ];
  }

  return [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: DashboardIcon,
    },
    { label: 'Services', to: '/services', icon: ServicesIcon },
    { label: 'My Requests', to: '/requests', icon: RequestsIcon },
    { label: 'AI Assistant', to: '/assistant', icon: AssistantIcon },
  ];
}

function panelItemForRole(role: Role): NavItem | null {
  if (role === 'OFFICER') {
    return { label: 'Officer Panel', to: '/officer/panel', icon: PanelIcon };
  }

  if (role === 'ADMINISTRATOR') {
    return { label: 'Admin Panel', to: '/admin/panel', icon: PanelIcon };
  }

  return null;
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const navItems = useMemo(() => primaryItemsForRole(user?.role ?? 'CITIZEN'), [user?.role]);
  const rolePanelItem = useMemo(() => panelItemForRole(user?.role ?? 'CITIZEN'), [user?.role]);
  const RolePanelIcon = rolePanelItem?.icon;

  const isActivePath = (path: string) =>
    location.pathname === path || (path !== '/assistant' && path !== '/settings' && location.pathname.startsWith(`${path}/`));

  useEffect(() => {
    let active = true;

    void notificationsApi
      .list()
      .then((notificationList) => {
        if (!active) {
          return;
        }

        const unreadNotifications = notificationList.filter((notification) => !notification.isRead);
        setNotifications(unreadNotifications);
        setUnreadCount(unreadNotifications.length);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setNotifications([]);
        setUnreadCount(0);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleOpenNotifications = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      try {
        await notificationsApi.markRead(notification.id);
        setNotifications((current) => current.filter((item) => item.id !== notification.id));
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch {
        // Leave notification state as-is if marking it read fails.
      }
    }

    handleCloseNotifications();

    if (user?.role === 'CITIZEN') {
      navigate(`/requests/${notification.requestId}`);
    } else {
      navigate(`/officer/requests/${notification.requestId}`);
    }
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          GovAssist<span className={styles.brandAccent}>.AI</span>
        </div>

        <List className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                selected={isActivePath(item.to)}
                className={styles.navButton}
              >
                <ListItemIcon className={styles.navIcon}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>

        {rolePanelItem ? (
          <List className={`${styles.nav} ${styles.roleNav}`}>
            <ListItemButton
              component={NavLink}
              to={rolePanelItem.to}
              selected={isActivePath(rolePanelItem.to)}
              className={styles.navButton}
            >
              <ListItemIcon className={styles.navIcon}>
                {RolePanelIcon ? <RolePanelIcon fontSize="small" /> : null}
              </ListItemIcon>
              <ListItemText primary={rolePanelItem.label} />
            </ListItemButton>
          </List>
        ) : null}

        <div className={styles.grow} />

        <List className={`${styles.nav} ${styles.footerNav}`}>
          <ListItemButton
            component={NavLink}
            to="/settings"
            selected={isActivePath('/settings')}
            className={styles.navButton}
          >
            <ListItemIcon className={styles.navIcon}>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
          <ListItemButton onClick={() => void logout()} className={styles.navButton}>
            <ListItemIcon className={styles.navIcon}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>

        {user ? (
          <div className={styles.userCard}>
            <Avatar>{initials(user.fullName)}</Avatar>
            <Stack spacing={0.2}>
              <Typography className={styles.userName}>{user.fullName}</Typography>
              <Typography className={styles.userEmail}>{user.email}</Typography>
              <Typography className={styles.userRole}>{humanizeRole(user.role)}</Typography>
            </Stack>
          </div>
        ) : null}
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <IconButton className={styles.topbarBell} onClick={handleOpenNotifications}>
            <Badge color="primary" badgeContent={unreadCount} invisible={unreadCount === 0}>
              <BellIcon />
            </Badge>
          </IconButton>
          {user ? (
            <Stack direction="row" spacing={1.2} alignItems="center" className={styles.topbarUser}>
              <Avatar>{initials(user.fullName)}</Avatar>
              <Stack spacing={0}>
                <Typography className={styles.topbarName}>{user.fullName}</Typography>
                <Typography className={styles.topbarRole}>{humanizeRole(user.role)}</Typography>
              </Stack>
            </Stack>
          ) : null}
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseNotifications}>
        {notifications.length ? (
          notifications.map((notification) => (
            <MenuItem key={notification.id} onClick={() => void handleNotificationClick(notification)} className={styles.notificationItem}>
              <Stack spacing={0.5}>
                <Typography fontWeight={600}>{notification.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(notification.createdAt)}
                </Typography>
              </Stack>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No notifications yet.</MenuItem>
        )}
      </Menu>
    </div>
  );
}
