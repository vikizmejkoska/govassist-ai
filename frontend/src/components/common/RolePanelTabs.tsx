import { Button, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { RefreshIcon } from '@/components/icons/AppIcons';

import styles from './RolePanelTabs.module.css';

interface RolePanelTabItem {
  label: string;
  to: string;
  icon?: ReactNode;
  active?: boolean;
}

interface RolePanelTabsProps {
  items: RolePanelTabItem[];
  onRefresh?: () => void;
}

export function RolePanelTabs({ items, onRefresh }: RolePanelTabsProps) {
  return (
    <div className={styles.wrap}>
      <Stack direction="row" className={styles.tabs}>
        {items.map((item) => (
          <Button
            key={item.to}
            component={RouterLink}
            to={item.to}
            variant="text"
            className={`${styles.tab}${item.active ? ` ${styles.tabActive}` : ''}`}
          >
            <span className={styles.tabLabel}>
              {item.icon}
              {item.label}
            </span>
          </Button>
        ))}
      </Stack>

      {onRefresh ? (
        <Button variant="outlined" className={styles.refresh} startIcon={<RefreshIcon fontSize="small" />} onClick={onRefresh}>
          Refresh
        </Button>
      ) : null}
    </div>
  );
}
