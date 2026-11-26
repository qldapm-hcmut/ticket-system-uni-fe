import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { dayBlock, timeRange, weekdayVi } from '../../utils/datetime';

/** Tính trạng thái thanh sức chứa theo spec (xanh / cam ≥90% / cam khi hết chỗ). */
function capacityState(event) {
  const full = event.availableSeats <= 0;
  const pct =
    event.capacity > 0
      ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))
      : 0;
  const near = !full && pct >= 90;
  const warn = full || near;
  return {
    full,
    pct: full ? 100 : pct,
    fill: warn ? 'bg-amber-600' : 'bg-brand-400',
    text: warn ? 'text-amber-700' : 'text-emerald-700',
    label: full ? 'Hết chỗ · vào danh sách chờ' : `Còn ${event.availableSeats} chỗ`,
  };
}

/** Thẻ sự kiện (spec 2:71). */
export function EventCard({ event }) {
  const { day, month } = dayBlock(event.startAt);
  const cap = capacityState(event);

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-slate-200 bg-white shadow-e1 transition-[box-shadow,transform] duration-150 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 active:scale-[0.99]"
    >
      {/* Cover */}
      <div className="bg-brand-cover flex items-start justify-between p-4">
        <span className="flex flex-col items-center rounded-control bg-white px-2.5 py-1.5 leading-none">
          <span className="text-xl font-bold text-brand-700">{day}</span>
          <span className="mt-0.5 text-[11px] font-medium text-slate-500">{month}</span>
        </span>
        <span className="max-w-[55%] truncate rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
          {event.unit?.name}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-3.5">
        <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900">
          {event.title}
        </h3>

        <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <Clock size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span>
            {timeRange(event.startAt, event.endAt)} · {weekdayVi(event.startAt)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-slate-500">
          <MapPin size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {/* Sức chứa */}
        <div className="mt-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${cap.text}`}>{cap.label}</span>
            <span className="text-slate-500">
              {event.registeredCount}/{event.capacity}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${cap.fill}`} style={{ width: `${cap.pct}%` }} />
          </div>
        </div>

        {/* Badge trạng thái */}
        <div className="mt-0.5 flex gap-2">
          {event.isRegistrationOpen ? (
            <Badge tone="green" dot>
              Đã mở đăng ký
            </Badge>
          ) : (
            <Badge tone="gray">Chưa/đã đóng đăng ký</Badge>
          )}
          {cap.full && <Badge tone="amber">Danh sách chờ</Badge>}
        </div>
      </div>
    </Link>
  );
}
