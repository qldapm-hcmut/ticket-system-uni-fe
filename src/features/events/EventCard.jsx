import { Link } from 'react-router-dom';
import { EventStatusBadge, Badge } from '../../components/ui/Badge';
import { formatEventRange } from '../../utils/datetime';

/** Thẻ sự kiện trong danh sách. */
export function EventCard({ event }) {
  const seatsLeft = event.availableSeats;
  const full = seatsLeft <= 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-brand-600">{event.unit?.name}</span>
        <EventStatusBadge status={event.status} />
      </div>

      <h3 className="mt-2 line-clamp-2 font-semibold text-slate-800">{event.title}</h3>

      <dl className="mt-3 space-y-1 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span aria-hidden>🗓️</span>
          <span>{formatEventRange(event.startAt, event.endAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden>📍</span>
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2">
        {full ? (
          <Badge tone="amber">Hết chỗ · còn waitlist</Badge>
        ) : (
          <Badge tone="green">Còn {seatsLeft} chỗ</Badge>
        )}
        {event.isRegistrationOpen ? (
          <Badge tone="blue">Đang mở đăng ký</Badge>
        ) : (
          <Badge tone="gray">Chưa/đã đóng đăng ký</Badge>
        )}
      </div>
    </Link>
  );
}
