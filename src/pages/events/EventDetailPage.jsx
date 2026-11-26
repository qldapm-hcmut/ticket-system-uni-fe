import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEvent } from '../../features/events/useEvents';
import {
  useRegisterForEvent,
  useCancelRegistration,
} from '../../features/registrations/useRegistrations';
import { useAuth } from '../../features/auth/AuthContext';
import { ROLES, REGISTRATION_STATUS } from '../../constants/roles';
import { EventStatusBadge, RegistrationStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CenteredSpinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/states';
import { formatEventRange, formatDateTime } from '../../utils/datetime';

export function EventDetailPage() {
  const { eventId } = useParams();
  const { hasRole } = useAuth();
  const { data: event, isPending, isError, error, refetch } = useEvent(eventId);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const register = useRegisterForEvent();
  const cancelReg = useCancelRegistration();

  if (isPending) return <CenteredSpinner label="Đang tải sự kiện…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const reg = event.myRegistration;
  const isActiveReg =
    reg &&
    (reg.status === REGISTRATION_STATUS.REGISTERED ||
      reg.status === REGISTRATION_STATUS.WAITLISTED);
  const isStudent = hasRole(ROLES.STUDENT);
  const canManage = hasRole(ROLES.ORGANIZER) || hasRole(ROLES.ADMIN);
  const full = event.availableSeats <= 0;

  const handleCancel = () => {
    cancelReg.mutate(
      { registrationId: reg.id },
      { onSettled: () => setConfirmCancel(false) },
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/events" className="text-sm text-brand-600 hover:underline">
        ← Về danh sách sự kiện
      </Link>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-brand-600">{event.unit?.name}</span>
          <EventStatusBadge status={event.status} />
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">{event.title}</h1>

        {event.description && (
          <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{event.description}</p>
        )}

        <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <Info label="Thời gian" value={formatEventRange(event.startAt, event.endAt)} />
          <Info label="Địa điểm" value={event.location} />
          <Info
            label="Nhận đăng ký"
            value={`${formatDateTime(event.registrationOpensAt)} → ${formatDateTime(
              event.registrationClosesAt,
            )}`}
          />
          <Info label="Hạn tự hủy" value={formatDateTime(event.cancelDeadline)} />
          <Info
            label="Sức chứa"
            value={`${event.registeredCount}/${event.capacity} đã đăng ký`}
          />
          <Info
            label="Chỗ trống"
            value={full ? `Hết chỗ · ${event.waitlistCount} trong hàng chờ` : `${event.availableSeats} chỗ`}
          />
        </dl>

        {/* Khu vực hành động cho sinh viên (A29) */}
        {isStudent && (
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            {isActiveReg ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">Trạng thái của bạn:</span>
                  <RegistrationStatusBadge status={reg.status} />
                  {reg.status === REGISTRATION_STATUS.WAITLISTED && reg.waitlistPosition && (
                    <span className="text-slate-500">(vị trí {reg.waitlistPosition})</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/registrations/${reg.id}`}
                    className="inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                  >
                    Xem vé / QR
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={cancelReg.isPending}
                    onClick={() => setConfirmCancel(true)}
                  >
                    {reg.status === REGISTRATION_STATUS.WAITLISTED ? 'Rời hàng chờ' : 'Hủy đăng ký'}
                  </Button>
                </div>
              </div>
            ) : event.isRegistrationOpen ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  {full
                    ? 'Sự kiện đã hết chỗ — bạn sẽ được xếp vào hàng chờ.'
                    : 'Sự kiện đang mở đăng ký.'}
                </p>
                <Button loading={register.isPending} onClick={() => register.mutate(event.id)}>
                  {full ? 'Vào hàng chờ' : 'Đăng ký ngay'}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Hiện không trong thời gian nhận đăng ký.</p>
            )}
          </div>
        )}

        {/* Lối tắt cho Organizer/Admin */}
        {canManage && (
          <div className="mt-6 flex gap-2 border-t border-slate-200 pt-4">
            <Link
              to={`/manage/events/${event.id}`}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Quản lý sự kiện này →
            </Link>
          </div>
        )}
      </div>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Xác nhận hủy"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
              Không
            </Button>
            <Button variant="danger" loading={cancelReg.isPending} onClick={handleCancel}>
              Hủy đăng ký
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn chắc chắn muốn hủy đăng ký sự kiện <strong>{event.title}</strong>? Nếu có người
          trong hàng chờ, họ sẽ được chuyển lên thay bạn.
        </p>
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-700">{value}</dd>
    </div>
  );
}
