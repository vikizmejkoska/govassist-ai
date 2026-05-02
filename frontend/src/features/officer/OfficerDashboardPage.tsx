import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { officerApi } from '@/api/requests';
import type { RequestSearchItemDto } from '@/api/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CheckIcon, ClockIcon, RequestsIcon, ServicesIcon } from '@/components/icons/AppIcons';
import { formatDate } from '@/lib/format';
import { useAuth } from '@/lib/useAuth';
import styles from '@/styles/page.module.css';

export function OfficerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestSearchItemDto[]>([]);
  const [error, setError] = useState('');

  const loadRequests = () => officerApi.all();

  useEffect(() => {
    let active = true;

    void loadRequests()
      .then((items) => {
        if (!active) {
          return;
        }

        setRequests(items);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Could not load officer requests.');
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const inProgress = requests.filter((item) => item.status === 'IN_PROGRESS').length;
    const submitted = requests.filter((item) => item.status === 'SUBMITTED').length;
    const approved = requests.filter((item) => item.status === 'APPROVED').length;

    return { total: requests.length, inProgress, submitted, approved };
  }, [requests]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Typography variant="h2">Welcome back, {user?.fullName.split(' ')[0] ?? 'Officer'}!</Typography>
          <p className={styles.heroText}>
            Process incoming requests, leave comments, and keep citizens informed without leaving one workspace.
          </p>
          <div className={styles.heroActions}>
            <Button variant="contained" onClick={() => navigate('/officer/panel')}>
              Open Officer Panel
            </Button>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/assistant')}>
              Ask AI Assistant
            </Button>
          </div>
        </div>
      </section>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <div className={styles.statsGrid}>
        <StatCard icon={<RequestsIcon />} label="Incoming Requests" value={stats.total} tone="#5D89FF" />
        <StatCard icon={<ServicesIcon />} label="Submitted" value={stats.submitted} tone="#7C98FA" />
        <StatCard icon={<ClockIcon />} label="In Progress" value={stats.inProgress} tone="#EDC941" />
        <StatCard icon={<CheckIcon />} label="Approved" value={stats.approved} tone="#56C788" />
      </div>

      <Card>
        <CardContent>
          <PageHeader
            eyebrow="Officer"
            title="Latest Queue Items"
            description="Open the full queue to update statuses and leave comments."
            size="section"
            actions={
              <Stack direction="row" spacing={1}>
                <Typography component="button" className={styles.inlineAction} onClick={() => navigate('/officer/panel')}>
                  Open officer panel
                </Typography>
              </Stack>
            }
          />
          <Stack className={styles.list}>
            {requests.slice(0, 5).map((request) => (
              <Stack
                key={request.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                className={`${styles.rowItem} ${styles.rowItemClickable}`}
                onClick={() => navigate(`/officer/requests/${request.id}`)}
              >
                <Stack spacing={0.3}>
                  <Typography fontWeight={600}>{request.serviceTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.applicantEmail} - {formatDate(request.createdAt)}
                  </Typography>
                </Stack>
                <StatusBadge status={request.status} />
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}
