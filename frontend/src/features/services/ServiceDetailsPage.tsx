import { Alert, Button, Card, CardContent, Divider, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { requestsApi } from '@/api/requests';
import { servicesApi } from '@/api/services';
import type { AdministrativeServiceDto } from '@/api/types';
import { PageHeader } from '@/components/common/PageHeader';
import { getServicePresentation } from '@/features/services/servicePresentation';
import { useAuth } from '@/lib/useAuth';
import { validateRequest } from '@/lib/validation';
import styles from '@/styles/page.module.css';

export function ServiceDetailsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { serviceId } = useParams();
  const [service, setService] = useState<AdministrativeServiceDto | null>(null);
  const [values, setValues] = useState({ title: '', description: '' });
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!serviceId) {
      return;
    }

    let active = true;

    void servicesApi
      .details(Number(serviceId))
      .then((item) => {
        if (!active) {
          return;
        }

        setService(item);
        setValues((current) => ({ ...current, title: item.title }));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Could not load this service.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [serviceId]);

  useEffect(() => {
    if (serviceId && user?.role && user.role !== 'CITIZEN') {
      navigate(`/services/${serviceId}`, { replace: true });
    }
  }, [navigate, serviceId, user?.role]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateRequest(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !service) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const created = await requestsApi.create({
        serviceId: service.id,
        title: values.title,
        description: values.description,
      });
      navigate(`/requests/${created.id}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Could not create request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentation = service ? getServicePresentation(service.title) : null;

  return (
    <div className={styles.page}>
      {service ? (
        <>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <PageHeader eyebrow={presentation?.category} title={service.title} description={service.description} />
              <p className={styles.heroText}>Prepare the required information below, then submit your request securely through GovAssist.AI.</p>
            </div>
          </section>

          <div className={styles.twoColumn}>
            <Card>
              <CardContent>
                <PageHeader title="Submit Request" description="Add a short title and describe what you need help with." size="section" />
                <Stack component="form" className={styles.inlineForm} onSubmit={handleSubmit}>
                  {submitError ? <Alert severity="error">{submitError}</Alert> : null}
                  <TextField
                    label="Request Title"
                    value={values.title}
                    onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
                    error={Boolean(errors.title)}
                    helperText={errors.title}
                  />
                  <TextField
                    label="Description"
                    multiline
                    minRows={6}
                    value={values.description}
                    onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                    error={Boolean(errors.description)}
                    helperText={errors.description}
                  />
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h4">Conditions</Typography>
                  <Typography color="text.secondary" className={styles.mutedTop}>
                    {service.conditions}
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h4">Required Documents</Typography>
                  <Divider className={styles.dividerY} />
                  <Typography color="text.secondary">{service.requiredDocuments}</Typography>
                </CardContent>
              </Card>
            </Stack>
          </div>
        </>
      ) : null}

      {loading ? <Typography color="text.secondary">Loading service...</Typography> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
    </div>
  );
}
