import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine } from 'lucide-react';
import {
  useMyRegistrations,
  useCancelRegistration,
} from '../../features/registrations/useRegistrations';
import { REGISTRATION_STATUS } from '../../constants/roles';
import { Badge, RegistrationStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/states';
import { Pagination } from '../../components/ui/Pagination';
import { formatDateTime } from '../../utils/datetime';

// Tab map đúng tham số contract (status/upcoming). Bỏ "Đã tham gia" (không lọc được).
const TABS = [
  { key: 'upcoming', label: 'Sắp tới', params: { upcoming: true } },
  { key: 'all', label: 'Tất cả', params: {} },
  { key: 'cancelled', label: 'Đã hủy', params: { status: REGISTRATION_STATUS.CANCELLED } },
];

function metaOf(event) {
  return `${formatDateTime(event.startAt)} · ${event.location}`;
}

/**
 * Thẻ tóm tắt vé REGISTERED. KHÔNG nạp qrToken ở đây (tránh N+1) — QR chỉ render ở
 * trang chi tiết vé. Mã dự phòng (checkinCode) đã có sẵn trong item nên hiển thị trực tiếp.
 */
function RegisteredSummary({ item, onCancel }) {
  return (
    <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-e1">
      <div className="flex items-center justify-between bg-brand-700 px-4 py-2.5">
        <span className="text-xs font-medium uppercase tracking-wide text-white/75">
          Vé tham dự
        </span>
        <Badge tone="blue" dot>
          Đã đăng ký
        </Badge>
      </div>
      <div className="p-4">
        <p className="line-clamp-2 text-[15px] font-semibold text-slate-900">{item.event.title}</p>
        <p className="mt-0.5 text-[13px] text-slate-500">{metaOf(item.event)}</p>
        {item.checkinCode && (
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-slate-500">
            <ScanLine size={14} aria-hidden="true" />
            Mã dự phòng:{' '}
            <span className="font-mono font-semibold tracking-widest text-slate-800">
              {item.checkinCode}
            </span>
          </p>
        )}
        <div className="mt-3 flex gap-2">
          <Link
            to={`/registrations/${item.id}`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-control bg-brand-700 text-[13px] font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            Xem vé / QR
          </Link>
          <Button variant="secondary" onClick={() => onCancel(item)}>
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Item waitlist: hiện vị trí chờ. */
function WaitlistCard({ item, onLeave }) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-e1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-slate-900">{item.event.title}</p>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {metaOf(item.event)} · Tự động lên vé khi có người hủy
          </p>
        </div>
        <Badge tone="amber">Chờ #{item.waitlistPosition ?? '—'}</Badge>
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => onLeave(item)}>
          Rời danh sách chờ
        </Button>
      </div>
    </div>
  );
}

/** Item không còn hiệu lực (CANCELLED/EXPIRED/…). */
function InactiveCard({ item }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-card border border-slate-200 bg-white p-4">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-medium text-slate-900">{item.event.title}</p>
        <p className="mt-0.5 text-[13px] text-slate-500">{metaOf(item.event)}</p>
      </div>
      <RegistrationStatusBadge status={item.status} />
    </div>
  );
}

/** A29/R3 — Đăng ký của tôi (danh sách tóm tắt; QR ở trang chi tiết vé). */
export function MyRegistrationsPage() {
  const [tabKey, setTabKey] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [toCancel, setToCancel] = useState(null);

  const tab = TABS.find((t) => t.key === tabKey) ?? TABS[0];
  const params = { ...tab.params, page, pageSize: 10 };
  const { data, isPending, isError, error, refetch, isFetching } = useMyRegistrations(params);
  const cancelReg = useCancelRegistration();

  const items = data?.data ?? [];
  const total = data?.meta?.totalItems;

  const confirmCancel = () => {
    cancelReg.mutate({ registrationId: toCancel.id }, { onSettled: () => setToCancel(null) });
  };

  const switchTab = (key) => {
    setTabKey(key);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vé của tôi</h1>

      {/* Segmented tabs */}
      <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => {
          const active = t.key === tabKey;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              className={`flex-1 rounded-[9px] py-2 text-[13px] font-semibold transition-colors ${
                active ? 'bg-white text-brand-700 shadow-e1' : 'text-slate-500'
              }`}
            >
              {t.label}
              {active && typeof total === 'number' ? ` (${total})` : ''}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4">
        {isPending ? (
          <>
            <Skeleton className="h-40 w-full rounded-card" />
            <Skeleton className="h-24 w-full rounded-card" />
          </>
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Chưa có vé nào ở đây"
            description="Khám phá các sự kiện và đăng ký tham gia."
            action={
              <Link
                to="/events"
                className="inline-flex h-10 items-center rounded-control bg-brand-700 px-4 text-[13px] font-semibold text-white hover:bg-brand-600"
              >
                Xem sự kiện
              </Link>
            }
          />
        ) : (
          <div className={`space-y-4 ${isFetching ? 'opacity-60' : ''}`}>
            {items.map((item) => {
              if (item.status === REGISTRATION_STATUS.REGISTERED) {
                return <RegisteredSummary key={item.id} item={item} onCancel={setToCancel} />;
              }
              if (item.status === REGISTRATION_STATUS.WAITLISTED) {
                return <WaitlistCard key={item.id} item={item} onLeave={setToCancel} />;
              }
              return <InactiveCard key={item.id} item={item} />;
            })}
            <Pagination meta={data?.meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(toCancel)}
        onClose={() => setToCancel(null)}
        title="Xác nhận hủy"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToCancel(null)}>
              Không
            </Button>
            <Button variant="danger" loading={cancelReg.isPending} onClick={confirmCancel}>
              {toCancel?.status === REGISTRATION_STATUS.WAITLISTED ? 'Rời danh sách chờ' : 'Hủy đăng ký'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {toCancel?.status === REGISTRATION_STATUS.WAITLISTED ? 'Rời danh sách chờ của' : 'Hủy đăng ký'}{' '}
          sự kiện <strong>{toCancel?.event?.title}</strong>?
        </p>
      </Modal>
    </div>
  );
}
