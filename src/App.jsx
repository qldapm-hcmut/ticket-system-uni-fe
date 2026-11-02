import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CenteredSpinner } from './components/ui/Spinner';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { RequireOrganizer } from './routes/RequireOrganizer';
import { ROLES } from './constants/roles';

import { LoginPage } from './pages/LoginPage';
import { EventListPage } from './pages/events/EventListPage';
import { EventDetailPage } from './pages/events/EventDetailPage';
import { MyRegistrationsPage } from './pages/me/MyRegistrationsPage';
import { RegistrationDetailPage } from './pages/me/RegistrationDetailPage';
import { ManageEventsPage } from './pages/manage/ManageEventsPage';
import { EventFormPage } from './pages/manage/EventFormPage';
import { PendingApprovalsPage } from './pages/admin/PendingApprovalsPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Màn check-in kéo theo thư viện camera (html5-qrcode) khá nặng -> tách bundle, nạp khi cần.
const CheckinPage = lazy(() =>
  import('./pages/checkin/CheckinPage').then((m) => ({ default: m.CheckinPage })),
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Khu vực cần đăng nhập */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />

        <Route path="/my-registrations" element={<MyRegistrationsPage />} />
        <Route path="/registrations/:registrationId" element={<RegistrationDetailPage />} />

        {/* Organizer / Admin */}
        <Route
          path="/manage/events"
          element={
            <RoleRoute roles={[ROLES.ORGANIZER, ROLES.ADMIN]}>
              <ManageEventsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/manage/events/new"
          element={
            <RoleRoute roles={[ROLES.ORGANIZER, ROLES.ADMIN]}>
              <EventFormPage />
            </RoleRoute>
          }
        />
        <Route
          path="/manage/events/:eventId"
          element={
            <RoleRoute roles={[ROLES.ORGANIZER, ROLES.ADMIN]}>
              <EventFormPage />
            </RoleRoute>
          }
        />

        {/* Check-in (A35): CHỈ ORGANIZER; STUDENT/ADMIN -> /403 */}
        <Route
          path="/manage/events/:eventId/check-in"
          element={
            <RequireOrganizer>
              <Suspense fallback={<CenteredSpinner label="Đang mở màn hình check-in…" />}>
                <CheckinPage />
              </Suspense>
            </RequireOrganizer>
          }
        />

        <Route path="/403" element={<ForbiddenPage />} />

        {/* Admin */}
        <Route
          path="/admin/approvals"
          element={
            <RoleRoute roles={[ROLES.ADMIN]}>
              <PendingApprovalsPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
