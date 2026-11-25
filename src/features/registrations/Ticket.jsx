import { QRCodeCanvas } from 'qrcode.react';
import { ScanLine } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

/**
 * Vé tham dự (spec 7:190). QR vẽ thuần từ `qrToken` (ASM-08, không chèn logo).
 * Notch hai bên dùng màu nền trang (slate-50) để tạo hiệu ứng vé.
 */
export function Ticket({ title, metaText, statusBadge, qrToken, checkinCode, loadingQr = false }) {
  return (
    <div className="overflow-hidden rounded-ticket bg-white shadow-e2">
      {/* Đầu vé */}
      <div className="bg-brand-700 px-5 py-[18px]">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-white/75">
            Vé tham dự
          </span>
          {statusBadge}
        </div>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-white">{title}</h3>
        {metaText && <p className="mt-1 text-[13px] text-white/85">{metaText}</p>}
      </div>

      {/* Đường xé */}
      <div className="relative">
        <div className="mx-5 border-t-[1.5px] border-dashed border-slate-300" />
        <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-slate-50" />
        <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-slate-50" />
      </div>

      {/* QR + mã dự phòng */}
      <div className="flex flex-col items-center gap-3 px-5 pb-6 pt-4">
        {qrToken ? (
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <QRCodeCanvas value={qrToken} size={224} level="M" marginSize={0} />
          </div>
        ) : loadingQr ? (
          <Skeleton className="h-[248px] w-[248px] rounded-xl" />
        ) : (
          <div className="flex h-[248px] w-[248px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-center text-[13px] text-slate-400">
            Chưa có mã QR
          </div>
        )}

        {checkinCode && (
          <div className="text-center">
            <p className="text-[13px] text-slate-500">Mã dự phòng</p>
            <p className="mt-0.5 font-mono text-xl font-semibold tracking-[0.3em] text-slate-900">
              {checkinCode}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
          <ScanLine size={16} aria-hidden="true" />
          Đưa mã này cho Ban tổ chức quét khi đến nơi
        </div>
      </div>
    </div>
  );
}
