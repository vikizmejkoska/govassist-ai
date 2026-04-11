import { BrowserRouter } from 'react-router-dom';

import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/routes/AppRouter';

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProviders>
  );
}
