import { Alert, Button, Card, CardContent, Typography } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { officerApi } from '@/api/requests';
import { adminServicesApi } from '@/api/services';
import { adminUsersApi } from '@/api/users';
import type { RequestSearchItemDto, UserSummaryDto } from '@/api/types';
import { PageHeader } from '@/components/common/PageHeader';
import { RolePanelTabs } from '@/components/common/RolePanelTabs';
import { StatCard } from '@/components/common/StatCard';
import { WeeklyRequestsCard } from '@/components/common/WeeklyRequestsCard';
import { AssistantIcon, CheckIcon, DashboardIcon, RequestsIcon, ServicesIcon } from '@/components/icons/AppIcons';
import styles from '@/styles/page.module.css';

export function AdminPanelOverviewPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserSummaryDto[]>([]);
  const [queue, setQueue] = useState<RequestSearchItemDto[]>([]);
  const [servicesCount, setServicesCount] = useState(0);
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState<AlertColor>('success');

  const loadOverview = () => Promise.all([adminServicesApi.list(), adminUsersApi.all(), officerApi.all()]);

  useEffect(() => {
    let active = true;

    void loadOverview()
      .then(([services, adminUsers, requests]) => {
        if (!active) {
          return;
        }

        setServicesCount(services.length);
        setUsers(adminUsers);
        setQueue(requests);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }

        setMessageSeverity('error');
        setMessage(err instanceof Error ? err.message : 'Could not load the admin panel.');
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const officers = users.filter((user) => user.role === 'OFFICER').length;
    const administrators = users.filter((user) => user.role === 'ADMINISTRATOR').length;
    const citizens = users.filter((user) => user.role === 'CITIZEN').length;

    return { officers, administrators, citizens };
  }, [users]);

  const handleRefresh = () => {
    setMessage('');
    void loadOverview()
      .then(([services, adminUsers, requests]) => {
        setServicesCount(services.length);
        setUsers(adminUsers);
        setQueue(requests);
      })
      .catch((err: unknown) => {
        setMessageSeverity('error');
        setMessage(err instanceof Error ? err.message : 'Could not refresh the admin panel.');
      });
  };

  return (
    <div className={`${styles.page} ${styles.panelPage}`}>
      <PageHeader title="Admin Panel" description="Browse, monitor, and manage platform access from one administrative workspace." />
      <RolePanelTabs
        items={[
          { label: 'Overview', to: '/admin/panel', icon: <DashboardIcon fontSize="small" />, active: true },
          { label: 'Manage Services', to: '/admin/services', icon: <ServicesIcon fontSize="small" /> },
        ]}
        onRefresh={handleRefresh}
      />

      {message ? <Alert severity={messageSeverity}>{message}</Alert> : null}

      <div className={styles.statsGrid}>
        <StatCard icon={<ServicesIcon />} label="Services" value={servicesCount} tone="#5D89FF" />
        <StatCard icon={<RequestsIcon />} label="Officer Queue" value={queue.length} tone="#EDC941" />
        <StatCard icon={<CheckIcon />} label="Citizens" value={stats.citizens} tone="#56C788" />
        <StatCard icon={<AssistantIcon />} label="Admins / Officers" value={`${stats.administrators} / ${stats.officers}`} tone="#8B76F3" />
      </div>

      <div className={`${styles.panelInsightsGrid} ${styles.panelLowerSection}`}>
        <WeeklyRequestsCard requests={queue} title="Weekly Requests" />

        <Card className={`${styles.assistantCard} ${styles.assistantCardCompact}`}>
          <CardContent className={styles.assistantCardContent}>
            <Typography variant="h4" className={styles.assistantCardTitle}>
              Need help? Ask our AI assistant
            </Typography>
            <Typography className={styles.assistantCardText}>
              Get instant answers about services, eligibility, document requirements, and admin workflows.
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
