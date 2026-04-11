import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { AssistantPage } from '@/features/assistant/AssistantPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { AdminPanelOverviewPage } from '@/features/admin/AdminPanelOverviewPage';
import { AdminServiceDetailsPage } from '@/features/admin/AdminServiceDetailsPage';
import { AdminServicesPage } from '@/features/admin/AdminServicesPage';
import { CitizenDashboardPage } from '@/features/dashboard/CitizenDashboardPage';
import { OfficerDashboardPage } from '@/features/officer/OfficerDashboardPage';
import { OfficerPanelOverviewPage } from '@/features/officer/OfficerPanelOverviewPage';
import { OfficerRequestDetailsPage } from '@/features/officer/OfficerRequestDetailsPage';
import { OfficerRequestsPage } from '@/features/officer/OfficerRequestsPage';
import { SettingsPage } from '@/features/profile/SettingsPage';
import { RequestDetailsPage } from '@/features/requests/RequestDetailsPage';
import { RequestsPage } from '@/features/requests/RequestsPage';
import { ServiceDetailsPage } from '@/features/services/ServiceDetailsPage';
import { ServiceOverviewPage } from '@/features/services/ServiceOverviewPage';
import { ServicesPage } from '@/features/services/ServicesPage';
import { useAuth } from '@/lib/useAuth';

import { homePathForRole } from './paths';

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell />;
}

function RoleRoute({ allowed }: { allowed: string[] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:serviceId" element={<ServiceOverviewPage />} />
        <Route path="/services/:serviceId/request" element={<ServiceDetailsPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/:requestId" element={<RequestDetailsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route element={<RoleRoute allowed={['CITIZEN']} />}>
          <Route path="/dashboard" element={<CitizenDashboardPage />} />
        </Route>

        <Route element={<RoleRoute allowed={['OFFICER', 'ADMINISTRATOR']} />}>
          <Route path="/officer/dashboard" element={<OfficerDashboardPage />} />
          <Route path="/officer/panel" element={<OfficerPanelOverviewPage />} />
          <Route path="/officer/requests" element={<OfficerRequestsPage />} />
          <Route path="/officer/requests/:requestId" element={<OfficerRequestDetailsPage />} />
        </Route>

        <Route element={<RoleRoute allowed={['ADMINISTRATOR']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/panel" element={<AdminPanelOverviewPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />
          <Route path="/admin/services/:serviceId" element={<AdminServiceDetailsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
