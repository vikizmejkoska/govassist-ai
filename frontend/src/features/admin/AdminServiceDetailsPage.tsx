import { Alert, Button, Card, CardContent, Stack, TextField } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { adminServicesApi } from '@/api/services';
import { PageHeader } from '@/components/common/PageHeader';
import { validateService } from '@/lib/validation';
import styles from '@/styles/page.module.css';

export function AdminServiceDetailsPage() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [values, setValues] = useState({
    title: '',
    description: '',
    conditions: '',
    requiredDocuments: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState<AlertColor>('success');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!serviceId) {
      return;
    }

    let active = true;

    void adminServicesApi
      .details(Number(serviceId))
      .then((service) => {
        if (!active) {
          return;
        }

        setValues({
          title: service.title,
          description: service.description,
          conditions: service.conditions,
          requiredDocuments: service.requiredDocuments,
        });
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }

        setMessageSeverity('error');
        setMessage(err instanceof Error ? err.message : 'Could not load this service.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [serviceId]);

  const handleSave = async () => {
    if (!serviceId) {
      return;
    }

    const nextErrors = validateService(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      await adminServicesApi.update(Number(serviceId), values);
      setMessageSeverity('success');
      setMessage('Service updated.');
    } catch (err: unknown) {
      setMessageSeverity('error');
      setMessage(err instanceof Error ? err.message : 'Could not update service.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceId) {
      return;
    }

    try {
      await adminServicesApi.remove(Number(serviceId));
      navigate('/admin/services', { replace: true });
    } catch (err: unknown) {
      setMessageSeverity('error');
      setMessage(err instanceof Error ? err.message : 'Could not delete service.');
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader eyebrow="Admin" title="Edit Service" description="Update the public service definition without touching backend code." />

      {message ? <Alert severity={messageSeverity}>{message}</Alert> : null}

      <Card>
        <CardContent>
          {loading ? (
            <Alert severity="info">Loading service details...</Alert>
          ) : (
            <Stack className={styles.inlineForm}>
              <TextField label="Title" value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} error={Boolean(errors.title)} helperText={errors.title} />
              <TextField label="Description" multiline minRows={3} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} error={Boolean(errors.description)} helperText={errors.description} />
              <TextField label="Conditions" multiline minRows={3} value={values.conditions} onChange={(event) => setValues((current) => ({ ...current, conditions: event.target.value }))} error={Boolean(errors.conditions)} helperText={errors.conditions} />
              <TextField label="Required Documents" multiline minRows={3} value={values.requiredDocuments} onChange={(event) => setValues((current) => ({ ...current, requiredDocuments: event.target.value }))} error={Boolean(errors.requiredDocuments)} helperText={errors.requiredDocuments} />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Button variant="contained" onClick={() => void handleSave()} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outlined" color="error" onClick={() => void handleDelete()}>
                  Delete Service
                </Button>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
