import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { useEvent } from '../../features/events/useEvents';
import {
  useRegisterForEvent,
  useCancelRegistration,
} from '../../features/registrations/useRegistrations';
import { useAuth } from '../../features/auth/AuthContext';
import { ROLES, REGISTRATION_STATUS } from '../../constants/roles';
import { Badge, EventStatusBadge, RegistrationStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CenteredSpinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/states';
import { formatDate, formatDateTime, timeRange, weekdayVi, hhmmMinus } from '../../utils/datetime';

function InfoRow({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-700"
        aria-hidden="true"
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-slate-900">{title}</p>
        {subtitle && <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

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
  const waitlisted = reg?.status === REGISTRATION_STATUS.WAITLISTED;
  const isActiveReg =
    reg && (reg.status === REGISTRATION_STATUS.REGISTERED || waitlisted);
  const isStudent = hasRole(ROLES.STUDENT);
  const canManage = hasRole(ROLES.ORGANIZER) || hasRole(ROLES.ADMIN);
  const full = event.availableSeats <= 0;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

  const handleCancel = () => {
    cancelReg.mutate({ registrationId: reg.id }, { onSettled: () => setConfirmCancel(false) });
  };

  /** Khối hành động (dùng cho CTA cố định mobile và card sticky desktop). */
  const cta = (
    <>
      {isStudent ? (
        isActiveReg ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <RegistrationStatusBadge status={reg.status} />
              {waitlisted && reg.waitlistPosition && (
                <span className="text-[13px] text-slate-500">Vị trí #{reg.waitlistPosition}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                to={`/registrations/${reg.id}`}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-control bg-brand-700 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
              >
                Xem vé / QR
              </Link>
              <Button
                variant="secondary"
                size="lg"
                loading={cancelReg.isPending}
                onClick={() => setConfirmCancel(true)}
              >
                {waitlisted ? 'Rời chờ' : 'Hủy'}
              </Button>
            </div>
          </div>
        ) : event.isRegistrationOpen ? (
          <div>
            <Button
              size="lg"
              className="w-full"
              loading={register.isPending}
              onClick={() => register.mutate(event.id)}
            >
              {full ? 'Vào danh sách chờ' : 'Đăng ký tham gia'}
            </Button>
            <p className="mt-2 text-center text-xs text-slate-500">
              Có thể tự hủy trước {formatDateTime(event.cancelDeadline)} (24 giờ trước giờ bắt đầu)
            </p>
          </div>
        ) : (
          <Button size="lg" className="w-full" disabled>
            Hiện không nhận đăng ký
          </Button>
        )
      ) : canManage ? (
        <Link
          to={`/manage/events/${event.id}`}
          className="inline-flex h-12 w-full items-center justify-center rounded-control bg-brand-700 text-[15px] font-semibold text-white hover:bg-brand-600"
        >
          Quản lý sự kiện này
        </Link>
      ) : null}
    </>
  );

  const hasCta = isStudent || canManage;

  return (
    <div className={hasCta ? 'pb-32 lg:pb-0' : ''}>
      {/* ===== Cover ===== */}
      <div className="bg-brand-cover -mx-4 -mt-6 px-6 pb-7 pt-6 lg:-mx-10 lg:-mt-10 lg:rounded-b-[28px] lg:px-10 lg:pt-10">
        <Link
          to="/events"
          aria-label="Về danh sách sự kiện"
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <div className="mb-3">
          {event.isRegistrationOpen ? (
            <Badge tone="green" dot>
              Đang mở đăng ký
            </Badge>
          ) : (
            <EventStatusBadge status={event.status} />
          )}
        </div>
        <h1 className="text-2xl font-bold leading-8 tracking-tight text-white lg:text-[28px]">
          {event.title}
        </h1>
        <p className="mt-2 text-[15px] text-white/85">{event.unit?.name}</p>
      </div>

      {/* ===== Body ===== */}
      <div className="lg:mx-auto lg:grid lg:max-w-[1000px] lg:grid-cols-[1fr_360px] lg:gap-6 lg:pt-6">
        <div className="space-y-4 pt-5 lg:pt-0">
          <div className="space-y-4 rounded-card border border-slate-200 bg-white p-4 shadow-e1">
            <InfoRow
              icon={Calendar}
              title={`${weekdayVi(event.startAt)}, ${formatDate(event.startAt)}`}
              subtitle={`${timeRange(event.startAt, event.endAt)} · Check-in mở từ ${hhmmMinus(
                event.startAt,
                60,
              )}`}
            />
            <InfoRow
              icon={MapPin}
              title={event.location}
              subtitle={
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  Mở trong Google Maps
                </a>
              }
            />
            <InfoRow
              icon={Users}
              title={`${event.registeredCount} / ${event.capacity} đã đăng ký`}
              subtitle={
                full
                  ? `Hết chỗ · ${event.waitlistCount} trong danh sách chờ`
                  : `Còn ${event.availableSeats} chỗ · hết chỗ sẽ tự vào danh sách chờ`
              }
            />
          </div>

          {event.description && (
            <div className="rounded-card border border-slate-200 bg-white p-4 shadow-e1">
              <h2 className="text-base font-semibold text-slate-900">Giới thiệu</h2>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-[22px] text-slate-700">
                {event.description}
              </p>
            </div>
          )}
        </div>

        {/* CTA sticky (desktop) */}
        {hasCta && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-card border border-slate-200 bg-white p-5 shadow-e2">
              {cta}
            </div>
          </aside>
        )}
      </div>

      {/* CTA cố định (mobile) — nằm trên cùng, che bottom nav ở màn này */}
      {hasCta && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 pt-3 shadow-e2 lg:hidden"
          style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
        >
          {cta}
        </div>
      )}

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
          Bạn chắc chắn muốn hủy đăng ký sự kiện <strong>{event.title}</strong>? Nếu có người trong
          danh sách chờ, họ sẽ được chuyển lên thay bạn.
        </p>
      </Modal>
    </div>
  );
}
