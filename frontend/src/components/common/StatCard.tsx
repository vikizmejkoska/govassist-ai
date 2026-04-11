import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone: string;
}

export function StatCard({ icon, label, value, tone }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack className={styles.toneIcon} style={{ color: tone, backgroundColor: `${tone}22` }}>
            {icon}
          </Stack>
          <Typography variant="h3">{value}</Typography>
          <Typography color="text.secondary">{label}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
