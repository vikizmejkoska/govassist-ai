import { Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import type { MouseEvent, ReactNode } from 'react';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  title: string;
  description: string;
  category: string;
  eta: string;
  fee: string;
  accent: string;
  icon: ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  onCardClick?: () => void;
  secondaryAction?: ReactNode;
}

export function ServiceCard({
  title,
  description,
  category,
  eta,
  fee,
  accent,
  icon,
  primaryLabel,
  onPrimary,
  onCardClick,
  secondaryAction,
}: ServiceCardProps) {
  const handlePrimaryClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onPrimary?.();
  };

  return (
    <Card className={onCardClick ? styles.clickable : undefined} onClick={onCardClick}>
      <CardContent className={styles.content}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Stack className={styles.iconWrap} style={{ color: accent, backgroundColor: `${accent}22` }}>
            {icon}
          </Stack>
          <Chip label={category} size="small" style={{ color: accent, backgroundColor: `${accent}1e` }} />
        </Stack>
        <Stack spacing={1}>
          <Typography variant="h4">{title}</Typography>
          <Typography color="text.secondary" className={styles.description}>
            {description}
          </Typography>
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack spacing={0.4}>
            <Typography variant="caption" color="text.secondary">
              {eta}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fee}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {primaryLabel && onPrimary ? (
              <Button variant="text" onClick={handlePrimaryClick}>
                {primaryLabel}
              </Button>
            ) : null}
            {secondaryAction}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
