import {
  Alert,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { officerApi } from '@/api/requests';
import { adminServicesApi } from '@/api/services';
import { adminUsersApi } from '@/api/users';
import type { RequestSearchItemDto, Role, UserSummaryDto } from '@/api/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AssistantIcon, CheckIcon, RequestsIcon, ServicesIcon } from '@/components/icons/AppIcons';
import { formatDate } from '@/lib/format';
import styles from '@/styles/page.module.css';

export function AdminDashboardPage() {
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
        setMessage(err instanceof Error ? err.message : 'Could not load the admin overview.');
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
        setMessage(err instanceof Error ? err.message : 'Could not refresh the admin overview.');
      });
  };

  const handleRoleUpdate = async (userId: number, role: Role) => {
    try {
      const updated = await adminUsersApi.updateRole(userId, { role });
      setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role: updated.role } : user)));
      setMessageSeverity('success');
      setMessage('User role updated.');
    } catch (err: unknown) {
      setMessageSeverity('error');
      setMessage(err instanceof Error ? err.message : 'Could not update user role.');
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader title="Admin Dashboard" description="Review the health of the platform and jump into the admin panel when you need deeper control." />

      {message ? <Alert severity={messageSeverity}>{message}</Alert> : null}

      <div className={styles.statsGrid}>
        <StatCard icon={<ServicesIcon />} label="Services" value={servicesCount} tone="#5D89FF" />
        <StatCard icon={<RequestsIcon />} label="Officer Queue" value={queue.length} tone="#EDC941" />
        <StatCard icon={<CheckIcon />} label="Citizens" value={stats.citizens} tone="#56C788" />
        <StatCard icon={<AssistantIcon />} label="Admins / Officers" value={`${stats.administrators} / ${stats.officers}`} tone="#8B76F3" />
      </div>

      <div className={styles.twoColumn}>
        <Card>
          <CardContent className={styles.tableWrap}>
            <PageHeader eyebrow="Admin" title="User Role Management" description="Adjust access for platform users directly from the overview." size="section" />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={user.role ?? 'CITIZEN'}
                        onChange={(event) => void handleRoleUpdate(user.id, event.target.value as Role)}
                        className={styles.minWidth180}
                      >
                        <MenuItem value="CITIZEN">Citizen</MenuItem>
                        <MenuItem value="OFFICER">Officer</MenuItem>
                        <MenuItem value="ADMINISTRATOR">Administrator</MenuItem>
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <PageHeader eyebrow="Admin" title="Recent Queue Activity" description="A fast snapshot of the latest incoming applications." size="section" />
            <Stack className={styles.list}>
              {queue.slice(0, 5).map((item) => (
                <Stack key={item.id} spacing={0.5} className={styles.rowItem}>
                  <Typography fontWeight={600}>{item.serviceTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.applicantEmail} - {formatDate(item.createdAt)}
                  </Typography>
                  <StatusBadge status={item.status} />
                </Stack>
              ))}
            </Stack>
            <Typography component="button" className={styles.inlineAction} onClick={() => navigate('/admin/panel')}>
              Open admin panel
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
