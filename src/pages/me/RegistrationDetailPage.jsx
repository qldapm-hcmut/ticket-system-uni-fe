import { Link, useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useRegistration } from '../../features/registrations/useRegistrations';
import { REGISTRATION_STATUS } from '../../constants/roles';
import { RegistrationStatusBadge } from '../../components/ui/Badge';
import { CenteredSpinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/states';
import { formatEventRange, formatDateTime } from '../../utils/datetime';

/** A29/R4 — Chi tiết đăng ký + vé QR (Box QR để trống, nối thư viện QR sau). */
export function RegistrationDetailPage() {
  const { registrationId } = useParams();
  const { data: reg, isPending, isError, error, refetch } = useRegistration(registrationId);

  if (isPending) return <CenteredSpinner label="Đang tải vé…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const isRegistered = reg.status === REGISTRATION_STATUS.REGISTERED;

  return (
    <div className="mx-auto max-w-lg">
      <Link to="/my-registrations" className="text-sm text-brand-600 hover:underline">
        ← Về đăng ký của tôi
      </Link>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">{reg.event?.title}</h1>
          <RegistrationStatusBadge status={reg.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {formatEventRange(reg.event?.startAt, reg.event?.endAt)} · {reg.event?.location}
        </p>

        {isRegistered ? (
          <div className="mt-6 flex flex-col items-center">
            {/* QR vẽ từ qrToken (dạng v1.<regId>.<eventId>.<hmac>).
                Sinh viên chỉ xuất trình QR; KHÔNG có nút tự check-in (ASM-08). */}
            {reg.qrToken ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <QRCodeCanvas value={reg.qrToken} size={208} level="M" marginSize={2} />
              </div>
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-400">
                Chưa có mã QR
              </div>
            )}
            <p className="mt-3 text-center text-xs text-slate-400">
              Xuất trình mã này cho ban tổ chức để được check-in.
            </p>

            {reg.checkinCode && (
              <div className="mt-5 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-400">Mã check-in</p>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-widest text-slate-800">
                  {reg.checkinCode}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Đọc mã này cho ban tổ chức nếu không quét được QR.
                </p>
              </div>
            )}

            {reg.checkIn && (
              <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Đã check-in lúc {formatDateTime(reg.checkIn.checkedInAt)} ({reg.checkIn.method})
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
            {reg.status === REGISTRATION_STATUS.WAITLISTED
              ? `Bạn đang ở hàng chờ (vị trí ${reg.waitlistPosition ?? '—'}). Vé QR sẽ xuất hiện khi được chuyển lên danh sách chính thức.`
              : 'Đăng ký này không còn hiệu lực nên không có vé QR.'}
          </div>
        )}
      </div>
    </div>
  );
}
