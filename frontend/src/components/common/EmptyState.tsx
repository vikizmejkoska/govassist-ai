import { Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Paper variant="outlined" className={styles.root}>
      <Stack spacing={1.5}>
        <Typography variant="h4">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
        {action}
      </Stack>
    </Paper>
  );
}
