import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { ROLES } from './constants/roles';

import { LoginPage } from './pages/LoginPage';
import { EventListPage } from './pages/events/EventListPage';
import { EventDetailPage } from './pages/events/EventDetailPage';
import { MyRegistrationsPage } from './pages/me/MyRegistrationsPage';
import { RegistrationDetailPage } from './pages/me/RegistrationDetailPage';
import { ManageEventsPage } from './pages/manage/ManageEventsPage';
import { EventFormPage } from './pages/manage/EventFormPage';
import { PendingApprovalsPage } from './pages/admin/PendingApprovalsPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
