import { Alert, Button, Card, CardContent, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { officerApi } from '@/api/requests';
import type { RequestSearchItemDto } from '@/api/types';
import { PageHeader } from '@/components/common/PageHeader';
import { RolePanelTabs } from '@/components/common/RolePanelTabs';
import { StatCard } from '@/components/common/StatCard';
import { WeeklyRequestsCard } from '@/components/common/WeeklyRequestsCard';
import { AssistantIcon, CheckIcon, ClockIcon, DashboardIcon, RequestsIcon } from '@/components/icons/AppIcons';
import styles from '@/styles/page.module.css';

export function OfficerPanelOverviewPage() {
  const navigate = useNavigate();
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

        setError(err instanceof Error ? err.message : 'Could not load officer panel data.');
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const inProgress = requests.filter((item) => item.status === 'IN_PROGRESS').length;
    const approved = requests.filter((item) => item.status === 'APPROVED').length;
    const activeUsers = new Set(requests.map((item) => item.applicantEmail)).size;

    return { total: requests.length, inProgress, approved, activeUsers };
  }, [requests]);

  return (
    <div className={`${styles.page} ${styles.panelPage}`}>
      <PageHeader title="Officer Panel" description="Monitor platform activity and manage citizen requests" />
      <RolePanelTabs
        items={[
          { label: 'Overview', to: '/officer/panel', icon: <DashboardIcon fontSize="small" />, active: true },
          { label: 'Requests', to: '/officer/requests', icon: <RequestsIcon fontSize="small" /> },
        ]}
        onRefresh={() =>
          void loadRequests()
            .then((items) => setRequests(items))
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : 'Could not refresh officer panel data.');
            })
        }
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <div className={styles.statsGrid}>
        <StatCard icon={<RequestsIcon />} label="Total Requests" value={stats.total} tone="#5D89FF" />
        <StatCard icon={<ClockIcon />} label="In Progress" value={stats.inProgress} tone="#EDC941" />
        <StatCard icon={<CheckIcon />} label="Approved" value={stats.approved} tone="#56C788" />
        <StatCard icon={<AssistantIcon />} label="Active Users" value={stats.activeUsers} tone="#8B76F3" />
      </div>

      <div className={`${styles.panelInsightsGrid} ${styles.panelLowerSection}`}>
        <WeeklyRequestsCard requests={requests} title="Weekly Requests" />

        <Card className={`${styles.assistantCard} ${styles.assistantCardCompact}`}>
          <CardContent className={styles.assistantCardContent}>
            <Typography variant="h4" className={styles.assistantCardTitle}>
              Need help? Ask our AI assistant
            </Typography>
            <Typography className={styles.assistantCardText}>
              Get instant answers about services, eligibility, document requirements, and more.
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
