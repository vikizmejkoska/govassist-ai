import { Alert, Button, Card, CardContent, InputAdornment, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, TextField } from '@mui/material';
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

type SortField = 'createdAt' | 'status';
type SortOrder = 'asc' | 'desc';

export function RequestsPage() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<RequestHistoryItemDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        void requestsApi
            .mine()
            .then((items) => {
                if (!active) return;
                setRequests(items);
                setLoading(false);
            })
            .catch((err: unknown) => {
                if (!active) return;
                setError(err instanceof Error ? err.message : 'Could not load requests.');
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const filtered = useMemo(() => {
        const result = requests.filter((request) => {
            const matchesStatus = !statusFilter || request.status === statusFilter;
            const term = searchTerm.trim().toLowerCase();
            const matchesSearch =
                !term ||
                [request.serviceTitle, request.title, request.description].some((value) =>
                    value.toLowerCase().includes(term),
                );
            return matchesStatus && matchesSearch;
        });

        result.sort((a, b) => {
            let comparison = 0;
            if (sortField === 'createdAt') {
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortField === 'status') {
                comparison = a.status.localeCompare(b.status);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [requests, searchTerm, statusFilter, sortField, sortOrder]);

    const handleDownloadPdf = async (requestId: number) => {
        try {
            await requestsApi.downloadPdf(requestId);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Could not download PDF.');
        }
    };

    const handleReuse = async (requestId: number) => {
        try {
            const existing = await requestsApi.details(requestId);
            navigate(`/services/${existing.serviceId}/request`, {
                state: {
                    reuseTitle: existing.title,
                    reuseDescription: existing.description,
                },
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Could not reuse request.');
        }
    };

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
                        <TextField
                            select
                            label="Status"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value as RequestStatus | '')}
                            className={styles.minWidth220}
                        >
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
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortField === 'createdAt'}
                                            direction={sortField === 'createdAt' ? sortOrder : 'asc'}
                                            onClick={() => handleSort('createdAt')}
                                        >
                                            Created
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Documents</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortField === 'status'}
                                            direction={sortField === 'status' ? sortOrder : 'asc'}
                                            onClick={() => handleSort('status')}
                                        >
                                            Status
                                        </TableSortLabel>
                                    </TableCell>
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
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button variant="text" onClick={() => navigate(`/requests/${request.id}`)}>
                                                    Open
                                                </Button>
                                                <Button variant="outlined" size="small" onClick={() => void handleReuse(request.id)}>
                                                    Reuse
                                                </Button>
                                                <Button variant="outlined" size="small" onClick={() => void handleDownloadPdf(request.id)}>
                                                    PDF
                                                </Button>
                                            </Stack>
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