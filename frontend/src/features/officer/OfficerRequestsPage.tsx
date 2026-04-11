import {
  Alert,
  Card,
  CardContent,
  InputAdornment,
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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { officerApi } from '@/api/requests';
import type { RequestSearchItemDto, RequestStatus } from '@/api/types';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { RolePanelTabs } from '@/components/common/RolePanelTabs';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DashboardIcon, RequestsIcon, SearchIcon } from '@/components/icons/AppIcons';
import { formatDate, formatTrackingNumber } from '@/lib/format';
import styles from '@/styles/page.module.css';

export function OfficerRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestSearchItemDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
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

  const filtered = useMemo(() => {
    return requests.filter((request) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term || [request.serviceTitle, request.title, formatTrackingNumber(request.id, request.createdAt)].some((value) => value.toLowerCase().includes(term));
      const matchesStatus = !statusFilter || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const handleStatusUpdate = async (requestId: number, status: RequestStatus) => {
    try {
      const updated = await officerApi.updateStatus(requestId, { status });
      setRequests((current) =>
        current.map((item) =>
          item.id === requestId
            ? {
                ...item,
                status: updated.status,
                updatedAt: updated.updatedAt,
              }
            : item,
        ),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update request status.');
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader title="Officer Panel" description="Monitor platform activity and manage citizen requests" />
      <RolePanelTabs
        items={[
          { label: 'Overview', to: '/officer/panel', icon: <DashboardIcon fontSize="small" /> },
          { label: 'Requests', to: '/officer/requests', icon: <RequestsIcon fontSize="small" />, active: true },
        ]}
        onRefresh={() =>
          void loadRequests()
            .then((items) => setRequests(items))
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : 'Could not refresh officer requests.');
            })
        }
      />

      <Card>
        <CardContent>
          <div className={styles.toolbar}>
            <div className={styles.toolbarGrow}>
              <TextField
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <TextField select label="All Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as RequestStatus | '')} className={styles.minWidth180}>
              <MenuItem value="">All statuses</MenuItem>
              <MenuItem value="SUBMITTED">Submitted</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="ADDITIONAL_DOCUMENTS_REQUIRED">Additional Documents Required</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </TextField>
          </div>
        </CardContent>
      </Card>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {filtered.length === 0 ? (
        <EmptyState title="No matching requests" description="Try a broader search or remove one of the filters." />
      ) : (
        <Card>
          <CardContent className={styles.tableWrap}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tracking#</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((request) => (
                  <TableRow key={request.id} hover onClick={() => navigate(`/officer/requests/${request.id}`)} className={styles.rowItemClickable}>
                    <TableCell>{formatTrackingNumber(request.id, request.createdAt)}</TableCell>
                    <TableCell>
                      <Stack spacing={0.3}>
                        <Typography fontWeight={600}>{request.serviceTitle}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {request.title}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        select
                        size="small"
                        value={request.status}
                        className={styles.minWidth180}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => void handleStatusUpdate(request.id, event.target.value as RequestStatus)}
                      >
                        <MenuItem value="SUBMITTED">Pending</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="ADDITIONAL_DOCUMENTS_REQUIRED">Docs Required</MenuItem>
                        <MenuItem value="APPROVED">Approved</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
