import { Alert, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { servicesApi } from '@/api/services';
import type { AdministrativeServiceDto } from '@/api/types';
import { PageHeader } from '@/components/common/PageHeader';
import { getServicePresentation } from '@/features/services/servicePresentation';
import { useAuth } from '@/lib/useAuth';
import styles from '@/styles/page.module.css';

export function ServiceOverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { serviceId } = useParams();
  const [service, setService] = useState<AdministrativeServiceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const presentation = service ? getServicePresentation(service.title) : null;
  const isCitizen = user?.role === 'CITIZEN';

  return (
    <div className={styles.page}>
      {service ? (
        <>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <PageHeader eyebrow={presentation?.category} title={service.title} description={service.description} />
              <p className={styles.heroText}>
                Review the service requirements, expected processing time, and required documents before moving to the next step.
              </p>
            </div>
          </section>

          <div className={styles.twoColumn}>
            <Card>
              <CardContent className={styles.inlineForm}>
                <PageHeader title="Overview" description="Everything you need to know before starting this service." size="section" />
                <div className={styles.metricGrid}>
                  <div className={styles.metricTile}>
                    <span className={styles.metricLabel}>Category</span>
                    <Chip
                      label={presentation?.category ?? 'General'}
                      size="small"
                      style={{
                        color: presentation?.accent ?? '#5D89FF',
                        backgroundColor: `${presentation?.accent ?? '#5D89FF'}1e`,
                      }}
                    />
                  </div>
                  <div className={styles.metricTile}>
                    <span className={styles.metricLabel}>Processing Time</span>
                    <Typography fontWeight={600}>{presentation?.eta ?? '3-5 business days'}</Typography>
                  </div>
                  <div className={styles.metricTile}>
                    <span className={styles.metricLabel}>Fee</span>
                    <Typography fontWeight={600}>{presentation?.fee ?? '$0'}</Typography>
                  </div>
                </div>

                <Divider className={styles.dividerY} />

                <Stack spacing={1.1}>
                  <Typography variant="h4">Service Description</Typography>
                  <Typography color="text.secondary">{service.description}</Typography>
                </Stack>

                {isCitizen ? (
                  <Button variant="contained" onClick={() => navigate(`/services/${service.id}/request`)}>
                    Submit Request
                  </Button>
                ) : (
                  <Button variant="outlined" onClick={() => navigate('/services')}>
                    Back to Services
                  </Button>
                )}
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
