import { Alert, Card, CardContent, InputAdornment, Stack, TextField } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { servicesApi } from '@/api/services';
import type { AdministrativeServiceDto } from '@/api/types';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { ServiceCard } from '@/components/common/ServiceCard';
import { SearchIcon } from '@/components/icons/AppIcons';
import { getServicePresentation } from '@/features/services/servicePresentation';
import { useAuth } from '@/lib/useAuth';
import styles from '@/styles/page.module.css';

export function ServicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState<AdministrativeServiceDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    void servicesApi
      .list()
      .then((items) => {
        if (!active) {
          return;
        }

        setServices(items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Could not load services.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return services;
    }

    return services.filter((item) =>
      [item.title, item.description, item.conditions, item.requiredDocuments].some((value) => value.toLowerCase().includes(term)),
    );
  }, [services, searchTerm]);

  return (
    <div className={styles.page}>
      <PageHeader title="Browse Services" description="Search the full service catalog and open the service you need." />

      <Card>
        <CardContent className={styles.inlineForm}>
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
        </CardContent>
      </Card>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {!loading && filtered.length === 0 ? (
        <EmptyState title="No services found" description="Try a different search term or clear the filter." />
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
                primaryLabel={user?.role === 'CITIZEN' ? 'Apply Now' : 'Overview'}
                onPrimary={() => navigate(user?.role === 'CITIZEN' ? `/services/${service.id}/request` : `/services/${service.id}`)}
                onCardClick={() => navigate(`/services/${service.id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
