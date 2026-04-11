import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { notificationsApi } from '@/api/notifications';
import { requestsApi } from '@/api/requests';
import type { RequestHistoryItemDto } from '@/api/types';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AssistantIcon, CheckIcon, ClockIcon, RequestsIcon } from '@/components/icons/AppIcons';
import { formatDate } from '@/lib/format';
import { useAuth } from '@/lib/useAuth';
import styles from '@/styles/page.module.css';

export function CitizenDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestHistoryItemDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    void Promise.all([requestsApi.mine(), notificationsApi.list()])
      .then(([requestList, notificationList]) => {
        if (!active) {
          return;
        }

        setRequests(requestList);
        setUnreadCount(notificationList.filter((notification) => !notification.isRead).length);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Could not load your dashboard.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const inProgress = requests.filter((item) => item.status === 'IN_PROGRESS').length;
    const approved = requests.filter((item) => item.status === 'APPROVED').length;

    return {
      total: requests.length,
      inProgress,
      approved,
      notifications: unreadCount,
    };
  }, [requests, unreadCount]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Typography variant="h2">Welcome back, {user?.fullName.split(' ')[0] ?? 'Citizen'}!</Typography>
          <p className={styles.heroText}>Track your requests, browse services, and get clear guidance without leaving one workspace.</p>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button variant="contained" onClick={() => navigate('/services')}>
              Browse Services
            </Button>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/assistant')}>
              Ask AI Assistant
            </Button>
          </Stack>
        </div>
      </section>

      <div className={styles.statsGrid}>
        <StatCard icon={<RequestsIcon />} label="Total Requests" value={stats.total} tone="#5D89FF" />
        <StatCard icon={<ClockIcon />} label="In Progress" value={stats.inProgress} tone="#EDC941" />
        <StatCard icon={<CheckIcon />} label="Approved" value={stats.approved} tone="#56C788" />
        <StatCard icon={<AssistantIcon />} label="Unread Notices" value={stats.notifications} tone="#9B7DF2" />
      </div>

      <div className={styles.dashboardInsightsGrid}>
        <Card>
          <CardContent>
            <PageHeader title="Recent Requests" description="A quick view of your latest applications." size="section" />
            {error ? <Alert severity="error">{error}</Alert> : null}
            {!loading && requests.length === 0 ? (
              <EmptyState
                title="No requests yet"
                description="Start by browsing services and applying for the one you need."
                action={
                  <Button variant="contained" onClick={() => navigate('/services')}>
                    Browse Services
                  </Button>
                }
              />
            ) : (
              <Stack className={styles.list}>
                {requests.slice(0, 4).map((request) => (
                  <Stack
                    key={request.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                    className={styles.rowItem}
                  >
                    <Stack spacing={0.3}>
                      <Typography fontWeight={600}>{request.serviceTitle}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.title} - {formatDate(request.createdAt)}
                      </Typography>
                    </Stack>
                    <StatusBadge status={request.status} />
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card className={`${styles.assistantCard} ${styles.assistantCardCompact}`}>
          <CardContent className={styles.assistantCardContent}>
            <Typography variant="h4" className={styles.assistantCardTitle}>
              Need help? Ask our AI assistant
            </Typography>
            <Typography className={styles.assistantCardText}>
              Get instant answers about services, eligibility, required documents, and next steps.
            </Typography>
            <Button variant="contained" color="inherit" className={styles.assistantCardButton} onClick={() => navigate('/assistant')}>
              Chat with AI
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
