import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { authApi } from '@/api/auth';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { validateRegister } from '@/lib/validation';

import styles from './AuthPages.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bullets = useMemo(
    () => [
      'Secure document handling for public services',
      'Real-time application updates',
      'AI-powered assistance when you need clarity',
    ],
    [],
  );

  const handleChange =
    (field: keyof typeof values) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setServerError('');
      setSuccessMessage('');
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      await authApi.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber || undefined,
        address: values.address || undefined,
      });
      setSuccessMessage('Account created successfully. You can log in now.');
      setTimeout(() => navigate('/login', { replace: true }), 700);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Join"
      accentLine="GovAssist.AI"
      description="Create your secure account to access government services, upload documents, and track every request from one place."
      bullets={bullets}
    >
      <div className={styles.header}>
        <Typography variant="h3" className={styles.headerTitle}>
          Sign up
        </Typography>
        <Typography className={styles.headerBody}>Create your account to get started.</Typography>
      </div>
      <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
        {serverError ? <Alert severity="error">{serverError}</Alert> : null}
        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
        <TextField label="Full Name" value={values.fullName} onChange={handleChange('fullName')} error={Boolean(errors.fullName)} helperText={errors.fullName} />
        <TextField label="Email Address" value={values.email} onChange={handleChange('email')} error={Boolean(errors.email)} helperText={errors.email} />
        <TextField
          label="Password"
          type="password"
          value={values.password}
          onChange={handleChange('password')}
          error={Boolean(errors.password)}
          helperText={errors.password}
        />
        <TextField label="Phone Number" value={values.phoneNumber} onChange={handleChange('phoneNumber')} error={Boolean(errors.phoneNumber)} helperText={errors.phoneNumber || 'Optional'} />
        <TextField label="Address" value={values.address} onChange={handleChange('address')} error={Boolean(errors.address)} helperText={errors.address || 'Optional'} />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
        <Typography className={styles.hint}>
          <span>Already have an account?</span>
          <Link className={styles.link} to="/login">
            Log in
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
