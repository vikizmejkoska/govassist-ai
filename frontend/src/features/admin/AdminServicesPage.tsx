import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminServicesApi } from '@/api/services';
import type { AdministrativeServiceDto } from '@/api/types';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { RolePanelTabs } from '@/components/common/RolePanelTabs';
import { ServiceCard } from '@/components/common/ServiceCard';
import { DashboardIcon, DeleteIcon, EditIcon, SearchIcon, ServicesIcon } from '@/components/icons/AppIcons';
import { getServicePresentation } from '@/features/services/servicePresentation';
import { validateService } from '@/lib/validation';
import styles from '@/styles/page.module.css';

export function AdminServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<AdministrativeServiceDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState<AlertColor>('success');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [createValues, setCreateValues] = useState({
    title: '',
    description: '',
    conditions: '',
    requiredDocuments: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof createValues, string>>>({});

  const loadServices = async () => {
    const items = await adminServicesApi.list();
    setServices(items);
  };

  useEffect(() => {
    void loadServices().catch((err: unknown) => {
      setMessageSeverity('error');
      setMessage(err instanceof Error ? err.message : 'Could not load admin services.');
    });
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(services.map((service) => getServicePresentation(service.title).category))).sort();
  }, [services]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return services.filter((service) => {
      const presentation = getServicePresentation(service.title);
      const matchesSearch =
        !term ||
        [service.title, service.description, service.conditions, service.requiredDocuments].some((value) =>
          value.toLowerCase().includes(term),
        );
      const matchesCategory = categoryFilter === 'ALL' || presentation.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, categoryFilter]);

  const handleCreate = async () => {
    const nextErrors = validateService(createValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      await adminServicesApi.create(createValues);
      setCreateValues({ title: '', description: '', conditions: '', requiredDocuments: '' });
      setErrors({});
      setIsCreateOpen(false);
      setMessageSeverity('success');
      setMessage('Service created.');
      await loadServices();
    } catch (err: unknown) {
      setMessageSeverity('error');
      setMessage(err instanceof Error ? err.message : 'Could not create service.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (serviceId: number) => {
    try {
      await adminServicesApi.remove(serviceId);
      setServices((current) => current.filter((service) => service.id !== serviceId));
      setMessageSeverity('success');
      setMessage('Service deleted.');
    } catch (err: unknown) {
      setMessageSeverity('error');
      setMessage(err instanceof Error ? err.message : 'Could not delete service.');
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader title="Admin Panel" description="Browse and edit, add or delete services." />
      <RolePanelTabs
        items={[
          { label: 'Overview', to: '/admin/panel', icon: <DashboardIcon fontSize="small" /> },
          { label: 'Manage Services', to: '/admin/services', icon: <ServicesIcon fontSize="small" />, active: true },
        ]}
        onRefresh={() =>
          void loadServices().catch((err: unknown) => {
            setMessageSeverity('error');
            setMessage(err instanceof Error ? err.message : 'Could not refresh admin services.');
          })
        }
      />

      {message ? <Alert severity={messageSeverity}>{message}</Alert> : null}

      <Card>
        <CardContent className={styles.inlineForm}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarGrow}>
              <TextField
                placeholder="Search services..."
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
            <TextField select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={styles.minWidth180}>
              <MenuItem value="ALL">All</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={() => setIsCreateOpen(true)}>
              Create Service
            </Button>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="No services found" description="Try another search term or create a new service." />
      ) : (
        <div className={styles.cardGrid}>
          {filtered.map((service) => {
            const presentation = getServicePresentation(service.title);

            return (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                category={presentation.category}
                eta={presentation.eta}
                fee={presentation.fee}
                accent={presentation.accent}
                icon={presentation.icon}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <Button variant="text" color="inherit" onClick={() => navigate(`/admin/services/${service.id}`)}>
                      <EditIcon fontSize="small" />
                    </Button>
                    <Button variant="text" color="error" onClick={() => void handleDelete(service.id)}>
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </Stack>
                }
              />
            );
          })}
        </div>
      )}

      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Create Service</DialogTitle>
        <DialogContent>
          <Stack className={`${styles.inlineForm} ${styles.dialogForm}`}>
            <TextField label="Title" value={createValues.title} onChange={(event) => setCreateValues((current) => ({ ...current, title: event.target.value }))} error={Boolean(errors.title)} helperText={errors.title} />
            <TextField label="Description" multiline minRows={3} value={createValues.description} onChange={(event) => setCreateValues((current) => ({ ...current, description: event.target.value }))} error={Boolean(errors.description)} helperText={errors.description} />
            <TextField label="Conditions" multiline minRows={3} value={createValues.conditions} onChange={(event) => setCreateValues((current) => ({ ...current, conditions: event.target.value }))} error={Boolean(errors.conditions)} helperText={errors.conditions} />
            <TextField label="Required Documents" multiline minRows={3} value={createValues.requiredDocuments} onChange={(event) => setCreateValues((current) => ({ ...current, requiredDocuments: event.target.value }))} error={Boolean(errors.requiredDocuments)} helperText={errors.requiredDocuments} />
            <Button variant="contained" onClick={() => void handleCreate()} disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create Service'}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </div>
  );
}
