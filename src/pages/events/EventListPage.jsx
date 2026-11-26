import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { useEvents } from '../../features/events/useEvents';
import { useUnits } from '../../features/units/useUnits';
import { useAuth } from '../../features/auth/AuthContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { EventCard } from '../../features/events/EventCard';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { EventListSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/states';
import { Pagination } from '../../components/ui/Pagination';
import { weekRangeVN } from '../../utils/datetime';

function firstName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
        active
          ? 'bg-brand-700 text-white'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

/** Ô tìm kiếm (map `q`, debounce 300ms ở page). */
function SearchBar({ value, onChange, onOpenUnits, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={20}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm theo tên sự kiện…"
        aria-label="Tìm sự kiện theo tên"
        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-[15px] text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <button
        type="button"
        onClick={onOpenUnits}
        aria-label="Lọc theo đơn vị"
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Bottom sheet (mobile) / dialog (desktop) chọn đơn vị. */
function UnitSheet({ open, onClose, units, value, onPick }) {
  if (!open) return null;
  const Item = ({ id, name }) => (
    <li>
      <button
        type="button"
        onClick={() => onPick(id)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[15px] text-slate-700 hover:bg-slate-50"
      >
        <span className="truncate">{name}</span>
        {value === id && <Check size={18} className="shrink-0 text-brand-600" aria-hidden="true" />}
      </button>
    </li>
  );
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chọn đơn vị"
        className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-auto rounded-t-2xl bg-white p-4 shadow-e2 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-80 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <h3 className="mb-2 px-1 text-base font-semibold text-slate-900">Chọn đơn vị</h3>
        <ul className="space-y-0.5">
          <Item id="" name="Tất cả đơn vị" />
          {(units ?? []).map((u) => (
            <Item key={u.id} id={u.id} name={u.name} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/** A27/E1 — Danh mục sự kiện cho sinh viên. */
export function EventListPage() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [week, setWeek] = useState(false);
  const [unitId, setUnitId] = useState('');
  const [page, setPage] = useState(1);
  const [unitsOpen, setUnitsOpen] = useState(false);
  const debouncedQ = useDebouncedValue(q, 300);

  const range = week ? weekRangeVN() : null;
  const params = {
    q: debouncedQ || undefined,
    availableOnly: availableOnly || undefined,
    unitId: unitId || undefined,
    from: range?.from,
    to: range?.to,
    page,
    pageSize: 12,
  };

  const { data, isPending, isError, error, refetch, isFetching } = useEvents(params);
  const { data: units } = useUnits();
  const events = data?.data ?? [];

  const set = (fn) => (value) => {
    setPage(1);
    fn(value);
  };
  const clearAll = () => {
    setPage(1);
    setAvailableOnly(false);
    setWeek(false);
    setUnitId('');
  };
  const noFilter = !availableOnly && !week && !unitId;
  const selectedUnitName = units?.find((u) => u.id === unitId)?.name;

  const chips = (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <Chip active={noFilter} onClick={clearAll}>
        Tất cả
      </Chip>
      <Chip active={availableOnly} onClick={() => set(setAvailableOnly)(!availableOnly)}>
        Còn nhận đăng ký
      </Chip>
      <Chip active={week} onClick={() => set(setWeek)(!week)}>
        Tuần này
      </Chip>
      <Chip active={Boolean(unitId)} onClick={() => setUnitsOpen(true)}>
        <span className="max-w-[140px] truncate">{selectedUnitName ?? 'Đơn vị'}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </Chip>
    </div>
  );

  return (
    <div>
      {/* ===== Hero desktop ===== */}
      <div className="bg-brand-hero -mx-10 -mt-10 mb-6 hidden px-10 py-12 lg:block">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-[32px] font-bold leading-10 tracking-tight text-white">
              Sự kiện Bách khoa
            </h1>
            <p className="mt-2 text-[15px] text-white/85">
              Đăng ký một chạm, nhận vé QR, check-in trong 2 giây.
            </p>
            <SearchBar
              value={q}
              onChange={set(setQ)}
              onOpenUnits={() => setUnitsOpen(true)}
              className="mt-5 max-w-[560px]"
            />
          </div>
          <BrandLogo size={120} className="hidden shrink-0 xl:block" />
        </div>
      </div>

      {/* ===== Header mobile ===== */}
      <div className="lg:hidden">
        <p className="text-[13px] text-slate-500">Chào {firstName(user?.fullName)} 👋</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sự kiện sắp diễn ra</h1>
        <SearchBar
          value={q}
          onChange={set(setQ)}
          onOpenUnits={() => setUnitsOpen(true)}
          className="mt-4"
        />
      </div>

      {/* ===== Chips ===== */}
      <div className="mt-4 lg:mt-0">{chips}</div>

      {/* ===== Nội dung ===== */}
      <div className="mt-5">
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
              className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${
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

      <UnitSheet
        open={unitsOpen}
        onClose={() => setUnitsOpen(false)}
        units={units}
        value={unitId}
        onPick={(id) => {
          set(setUnitId)(id);
          setUnitsOpen(false);
        }}
      />
    </div>
  );
}
