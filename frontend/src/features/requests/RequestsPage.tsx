import { Alert, Button, Card, CardContent, InputAdornment, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { requestsApi } from '@/api/requests';
import type { RequestHistoryItemDto, RequestStatus } from '@/api/types';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SearchIcon } from '@/components/icons/AppIcons';
import { formatDate } from '@/lib/format';
import styles from '@/styles/page.module.css';

export function RequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestHistoryItemDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    void requestsApi
      .mine()
      .then((items) => {
        if (!active) {
          return;
        }

        setRequests(items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Could not load requests.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((request) => {
      const matchesStatus = !statusFilter || request.status === statusFilter;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        [request.serviceTitle, request.title, request.description].some((value) => value.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [requests, searchTerm, statusFilter]);

  return (
    <div className={styles.page}>
      <PageHeader title="My Requests" description="Track the progress, status, and documentation tied to each submission." />

      <Card>
        <CardContent className={styles.inlineForm}>
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
            <TextField select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as RequestStatus | '')} className={styles.minWidth220}>
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

      {!loading && filtered.length === 0 ? (
        <EmptyState
          title="No requests match your filters"
          description="Try adjusting the search or browse services to submit a new request."
          action={
            <Button variant="contained" onClick={() => navigate('/services')}>
              Browse Services
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className={styles.tableWrap}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Documents</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>{request.serviceTitle}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>{request.documentCount}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="text" onClick={() => navigate(`/requests/${request.id}`)}>
                        Open
                      </Button>
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
