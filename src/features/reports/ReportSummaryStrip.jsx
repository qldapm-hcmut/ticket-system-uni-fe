import { useEventSummary } from './useReports';
import { Skeleton } from '../../components/ui/Skeleton';

function Stat({ label, value, tone = 'text-slate-800' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center">
      <p className={`text-lg font-semibold ${tone}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

/** B1 — dải thống kê nhanh trên màn check-in (đã check-in / đăng ký / tỉ lệ). */
export function ReportSummaryStrip({ eventId }) {
  const { data, isPending, isError } = useEventSummary(eventId);

  if (isPending) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }
  if (isError || !data) return null;

  const rate = Math.round((data.attendanceRate ?? 0) * 100);
  return (
    <div className="grid grid-cols-3 gap-2">
      <Stat label="Đã check-in" value={data.checkedIn} tone="text-emerald-600" />
      <Stat label="Đã đăng ký" value={data.registered} />
      <Stat label="Tỉ lệ tham dự" value={`${rate}%`} tone="text-brand-600" />
    </div>
  );
}
