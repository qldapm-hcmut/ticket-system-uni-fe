import { useState } from 'react';
import { useEvents } from '../../features/events/useEvents';
import { useUnits } from '../../features/units/useUnits';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { EventCard } from '../../features/events/EventCard';
import { EventListSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/states';
import { Pagination } from '../../components/ui/Pagination';
import { Input, Select } from '../../components/ui/Field';

/** A27/E1 — Danh mục sự kiện cho sinh viên. */
export function EventListPage() {
  const [q, setQ] = useState('');
  const [unitId, setUnitId] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q);

  const params = {
    q: debouncedQ || undefined,
    unitId: unitId || undefined,
    availableOnly: availableOnly || undefined,
    page,
    pageSize: 12,
  };

  const { data, isPending, isError, error, refetch, isFetching } = useEvents(params);
  const { data: units } = useUnits();

  const events = data?.data ?? [];

  const resetToFirstPage = (fn) => (value) => {
    setPage(1);
    fn(value);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Sự kiện</h1>
          <p className="text-sm text-slate-500">Khám phá và đăng ký các sự kiện của trường.</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto]">
        <Input
          placeholder="Tìm theo tiêu đề…"
          value={q}
          onChange={(e) => resetToFirstPage(setQ)(e.target.value)}
        />
        <Select
          value={unitId}
          onChange={(e) => resetToFirstPage(setUnitId)(e.target.value)}
          className="sm:w-56"
        >
          <option value="">Tất cả đơn vị</option>
          {(units ?? []).map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
            checked={availableOnly}
            onChange={(e) => resetToFirstPage(setAvailableOnly)(e.target.checked)}
          />
          Chỉ còn chỗ
        </label>
      </div>

      {/* Nội dung */}
      {isPending ? (
        <EventListSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : events.length === 0 ? (
        <EmptyState
          title="Không có sự kiện phù hợp"
          description="Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác."
        />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
              isFetching ? 'opacity-60' : ''
            }`}
          >
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
          <Pagination meta={data?.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
