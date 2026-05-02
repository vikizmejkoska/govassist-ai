import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { CSSProperties, ReactNode } from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone: string;
}

export function StatCard({ icon, label, value, tone }: StatCardProps) {
  const cardStyle = { ['--toneTint' as string]: `${tone}33` } as CSSProperties;

  return (
    <Card className={styles.card} style={cardStyle}>
      <CardContent>
        <Stack spacing={1.5}>
          <div className={styles.toneIcon} style={{ color: tone, backgroundColor: `${tone}1f` }}>
            {icon}
          </div>
          <Typography className={styles.value}>{value}</Typography>
          <Typography className={styles.label}>{label}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
