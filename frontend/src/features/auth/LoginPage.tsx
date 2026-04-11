import { Alert, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { authApi } from '@/api/auth';
import type { StorageMode } from '@/api/types';
import { homePathForRole } from '@/app/routes/paths';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { validateLogin } from '@/lib/validation';
import { useAuth } from '@/lib/useAuth';

import styles from './AuthPages.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bullets = useMemo(
    () => [
      'Access hundreds of public services online',
      'Track requests and document status in one place',
      'Move faster with AI-assisted guidance',
    ],
    [],
  );

  const handleChange =
    (field: 'email' | 'password') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setServerError('');
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const session = await authApi.login(values);
      const storageMode: StorageMode = keepLoggedIn ? 'local' : 'session';
      await login(session, storageMode);
      navigate(homePathForRole(session.role), { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Your Gateway to"
      accentLine="AI-Powered Government Services"
      description="Access government services, manage requests, and stay informed with one secure, citizen-friendly workspace."
      bullets={bullets}
    >
      <div className={styles.header}>
        <Typography variant="h3" className={styles.headerTitle}>
          Log in
        </Typography>
        <Typography className={styles.headerBody}>Enter your credentials to continue.</Typography>
      </div>
      <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
        <TextField label="Email Address" value={values.email} onChange={handleChange('email')} error={Boolean(errors.email)} helperText={errors.email} />
        <TextField
          label="Password"
          type="password"
          value={values.password}
          onChange={handleChange('password')}
          error={Boolean(errors.password)}
          helperText={errors.password}
        />
        <div className={styles.row}>
          <FormControlLabel
            control={<Checkbox checked={keepLoggedIn} onChange={(event) => setKeepLoggedIn(event.target.checked)} />}
            label="Keep me logged in"
            className={styles.checkboxLabel}
          />
          <Typography className={styles.link}>Forgot password?</Typography>
        </div>
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
        <Typography className={styles.hint}>
          <span>Don&apos;t have an account?</span>
          <Link className={styles.link} to="/register">
            Sign up
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
