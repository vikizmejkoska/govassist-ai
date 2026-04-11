import { Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import styles from '@/styles/page.module.css';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  size?: 'page' | 'section';
}

export function PageHeader({ eyebrow, title, description, actions, size = 'page' }: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <Stack className={styles.headingGroup}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <Typography variant={size === 'section' ? 'h3' : 'h2'}>{title}</Typography>
        {description ? <p className={styles.description}>{description}</p> : null}
      </Stack>
      {actions}
    </header>
  );
}
