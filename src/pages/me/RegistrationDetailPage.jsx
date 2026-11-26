import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRegistration } from '../../features/registrations/useRegistrations';
import { REGISTRATION_STATUS } from '../../constants/roles';
import { Ticket } from '../../features/registrations/Ticket';
import { Badge } from '../../components/ui/Badge';
import { CenteredSpinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/states';
import { formatDateTime } from '../../utils/datetime';

/** A29/R4 — Chi tiết đăng ký + vé QR (ASM-08: chỉ xuất trình QR, không tự check-in). */
export function RegistrationDetailPage() {
  const { registrationId } = useParams();
  const { data: reg, isPending, isError, error, refetch } = useRegistration(registrationId);

  if (isPending) return <CenteredSpinner label="Đang tải vé…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const isRegistered = reg.status === REGISTRATION_STATUS.REGISTERED;
  const metaText = `${formatDateTime(reg.event?.startAt)} · ${reg.event?.location}`;

  return (
    <div className="mx-auto max-w-md">
      <Link
        to="/my-registrations"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Về vé của tôi
      </Link>

      <div className="mt-3">
        {isRegistered ? (
          <>
            <Ticket
              title={reg.event?.title}
              metaText={metaText}
              statusBadge={
                <Badge tone="blue" dot>
                  Đã đăng ký
                </Badge>
              }
              qrToken={reg.qrToken}
              checkinCode={reg.checkinCode}
            />
            {reg.checkIn && (
              <p className="mt-3 rounded-control bg-emerald-50 px-3 py-2 text-center text-[13px] text-emerald-700">
                Đã check-in lúc {formatDateTime(reg.checkIn.checkedInAt)} ({reg.checkIn.method})
              </p>
            )}
          </>
        ) : (
          <div className="rounded-card border border-slate-200 bg-white p-5 shadow-e1">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-base font-semibold text-slate-900">{reg.event?.title}</h1>
              <Badge tone={reg.status === REGISTRATION_STATUS.WAITLISTED ? 'amber' : 'gray'}>
                {reg.status === REGISTRATION_STATUS.WAITLISTED
                  ? `Chờ #${reg.waitlistPosition ?? '—'}`
                  : 'Không còn hiệu lực'}
              </Badge>
            </div>
            <p className="mt-1 text-[13px] text-slate-500">{metaText}</p>
            <p className="mt-4 rounded-control bg-slate-50 p-3 text-[13px] text-slate-500">
              {reg.status === REGISTRATION_STATUS.WAITLISTED
                ? 'Bạn đang trong danh sách chờ. Vé QR sẽ xuất hiện khi được chuyển lên danh sách chính thức.'
                : 'Đăng ký này không còn hiệu lực nên không có vé QR.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
