import { Card, CardContent, Typography } from '@mui/material';
import { useMemo } from 'react';

import styles from './WeeklyRequestsCard.module.css';

interface WeeklyRequestsCardProps {
  requests: Array<{ createdAt: string }>;
  title?: string;
}

const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const chartWidth = 560;
const chartHeight = 220;
const padding = { top: 14, right: 18, bottom: 36, left: 34 };

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function niceMax(value: number): number {
  if (value <= 1) {
    return 1;
  }

  if (value <= 5) {
    return 5;
  }

  if (value <= 10) {
    return 10;
  }

  return Math.ceil(value / 5) * 5;
}

export function WeeklyRequestsCard({ requests, title = 'Weekly Requests' }: WeeklyRequestsCardProps) {
  const bars = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        key: localDateKey(date),
        label: dayFormatter.format(date),
        count: 0,
      };
    });

    const indexByKey = new Map(days.map((day, index) => [day.key, index]));

    requests.forEach((request) => {
      const date = new Date(request.createdAt);
      date.setHours(0, 0, 0, 0);
      const key = localDateKey(date);
      const index = indexByKey.get(key);

      if (index !== undefined) {
        days[index].count += 1;
      }
    });

    return days;
  }, [requests]);

  const maxCount = Math.max(...bars.map((bar) => bar.count), 1);
  const yMax = niceMax(maxCount + Math.max(1, Math.ceil(maxCount * 0.25)));
  const ticks = [yMax, Math.max(Math.round(yMax / 2), 1), 0];
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const slotWidth = innerWidth / bars.length;
  const barWidth = Math.min(22, slotWidth * 0.3);

  return (
    <Card>
      <CardContent className={styles.cardContent}>
        <Typography variant="h4">{title}</Typography>
        {requests.length ? (
          <div className={styles.chartWrap}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className={styles.chart} aria-label={title} role="img">
              <defs>
                <linearGradient id="weekly-bar-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c7bcff" />
                  <stop offset="100%" stopColor="#6f56f3" />
                </linearGradient>
              </defs>

              {ticks.map((tick) => {
                const y = padding.top + innerHeight - (tick / yMax) * innerHeight;

                return (
                  <g key={tick}>
                    <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} className={styles.gridLine} />
                    <text x={padding.left - 8} y={y + 4} textAnchor="end" className={styles.gridLabel}>
                      {tick}
                    </text>
                  </g>
                );
              })}

              {bars.map((bar, index) => {
                const x = padding.left + slotWidth * index + (slotWidth - barWidth) / 2;
                const barHeight = bar.count === 0 ? 0 : Math.max((bar.count / yMax) * innerHeight, 6);
                const y = padding.top + innerHeight - barHeight;

                return (
                  <g key={bar.key}>
                    <rect x={x} y={y} width={barWidth} height={barHeight} rx={10} ry={10} fill="url(#weekly-bar-gradient)" />
                    <text x={x + barWidth / 2} y={chartHeight - 10} textAnchor="middle" className={styles.barLabel}>
                      {bar.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <Typography color="text.secondary" className={styles.empty}>
            No requests created this week yet.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
