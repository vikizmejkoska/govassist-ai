import { Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Paper variant="outlined" className={styles.root}>
      <Stack spacing={1.5}>
        {icon ? <div className={styles.iconWrap}>{icon}</div> : null}
        <Typography variant="h4" className={styles.title}>
          {title}
        </Typography>
        <Typography className={styles.description}>{description}</Typography>
        {action ? <div className={styles.action}>{action}</div> : null}
      </Stack>
    </Paper>
  );
}
