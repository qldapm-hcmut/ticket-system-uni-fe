import { useEventSummary } from './useReports';
import { Skeleton } from '../../components/ui/Skeleton';

function Stat({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-3 text-center">
      <p className={`text-[20px] font-bold leading-7 ${tone}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}

/** B1 — 3 thẻ thống kê + thanh tỉ lệ tham dự. */
export function ReportSummaryStrip({ eventId }) {
  const { data, isPending, isError } = useEventSummary(eventId);

  if (isPending) {
    return (
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-card" />
          ))}
        </div>
        <Skeleton className="h-2 rounded-full" />
      </div>
    );
  }
  if (isError || !data) return null;

  const rate = Math.round((data.attendanceRate ?? 0) * 100);
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Đã check-in" value={data.checkedIn} tone="text-emerald-700" />
        <Stat label="Đã đăng ký" value={data.registered} />
        <Stat label="Tỉ lệ" value={`${rate}%`} tone="text-brand-700" />
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tỉ lệ tham dự"
      >
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
}
