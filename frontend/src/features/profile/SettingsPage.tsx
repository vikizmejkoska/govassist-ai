import { Alert, Button, Card, CardContent, Stack, TextField } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';

import { usersApi } from '@/api/users';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/lib/useAuth';
import { validateProfile } from '@/lib/validation';
import styles from '@/styles/page.module.css';

export function SettingsPage() {
  const { user, setUser } = useAuth();
  const [values, setValues] = useState({ fullName: '', phoneNumber: '', address: '' });
  const [errors, setErrors] = useState<{ fullName?: string; phoneNumber?: string; address?: string }>({});
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState<AlertColor>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setValues({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber ?? '',
      address: user.address ?? '',
    });
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateProfile(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const updated = await usersApi.updateMe(values);
      setUser(updated);
      setMessageSeverity('success');
      setMessage('Profile updated successfully.');
    } catch (err: unknown) {
      setMessageSeverity('error');
      setMessage(err instanceof Error ? err.message : 'Could not update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader title="Settings" description="Keep your profile information up to date for accurate request handling." />

      <Card>
        <CardContent>
          <Stack component="form" className={styles.inlineForm} onSubmit={handleSubmit}>
            {message ? <Alert severity={messageSeverity}>{message}</Alert> : null}
            <TextField
              label="Full Name"
              value={values.fullName}
              onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName}
            />
            <TextField
              label="Phone Number"
              value={values.phoneNumber}
              onChange={(event) => setValues((current) => ({ ...current, phoneNumber: event.target.value }))}
              error={Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber}
            />
            <TextField
              label="Address"
              multiline
              minRows={3}
              value={values.address}
              onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))}
              error={Boolean(errors.address)}
              helperText={errors.address}
            />
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}
