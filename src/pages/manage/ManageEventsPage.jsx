import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useManagedEvents } from '../../features/events/useEvents';
import { useUnits } from '../../features/units/useUnits';
import { useAuth } from '../../features/auth/AuthContext';
import { ROLES, EVENT_STATUS, EVENT_STATUS_LABELS } from '../../constants/roles';
import { EventStatusBadge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Field';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/states';
import { Pagination } from '../../components/ui/Pagination';
import { formatEventRange } from '../../utils/datetime';

/** A27/E3 — Organizer/Admin quản lý sự kiện. */
export function ManageEventsPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(ROLES.ADMIN);
  const [status, setStatus] = useState('');
  const [unitId, setUnitId] = useState('');
  const [page, setPage] = useState(1);

  const params = {
    status: status ? [status] : undefined,
    unitId: unitId || undefined,
    page,
    pageSize: 10,
  };
  const { data, isPending, isError, error, refetch, isFetching } = useManagedEvents(params);
  const { data: units } = useUnits();
  const items = data?.data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Quản lý sự kiện</h1>
          <p className="text-sm text-slate-500">
            {isAdmin ? 'Toàn trường' : 'Theo đơn vị của bạn'}
          </p>
        </div>
        <Link
          to="/manage/events/new"
          className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Tạo sự kiện
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="w-52"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.values(EVENT_STATUS).map((s) => (
            <option key={s} value={s}>
              {EVENT_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        {isAdmin && (
          <Select
            value={unitId}
            onChange={(e) => {
              setPage(1);
              setUnitId(e.target.value);
            }}
            className="w-56"
          >
            <option value="">Tất cả đơn vị</option>
            {(units ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState title="Chưa có sự kiện nào" description="Tạo sự kiện đầu tiên của bạn." />
        ) : (
          <div className={isFetching ? 'opacity-60' : ''}>
            {items.map((ev) => (
              <Link
                key={ev.id}
                to={`/manage/events/${ev.id}`}
                className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{ev.title}</span>
                    <EventStatusBadge status={ev.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {ev.unit?.name} · {formatEventRange(ev.startAt, ev.endAt)}
                  </p>
                </div>
                <span className="text-sm text-slate-500">
                  {ev.registeredCount}/{ev.capacity} đăng ký
                </span>
              </Link>
            ))}
            <Pagination meta={data?.meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
