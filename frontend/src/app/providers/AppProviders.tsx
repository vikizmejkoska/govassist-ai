import { CssBaseline, ThemeProvider } from '@mui/material';
import type { PropsWithChildren } from 'react';

import { AuthProvider } from '@/app/providers/AuthProvider';
import { appTheme } from '@/styles/theme';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
