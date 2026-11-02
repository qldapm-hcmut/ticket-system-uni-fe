import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useMyRegistrations,
  useCancelRegistration,
} from '../../features/registrations/useRegistrations';
import { REGISTRATION_STATUS, REGISTRATION_STATUS_LABELS } from '../../constants/roles';
import { RegistrationStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/states';
import { Pagination } from '../../components/ui/Pagination';
import { formatEventRange } from '../../utils/datetime';

/** A29/R3 — Đăng ký của tôi. */
export function MyRegistrationsPage() {
  const [status, setStatus] = useState('');
  const [upcoming, setUpcoming] = useState(false);
  const [page, setPage] = useState(1);
  const [toCancel, setToCancel] = useState(null);

  const params = {
    status: status || undefined,
    upcoming: upcoming || undefined,
    page,
    pageSize: 10,
  };
  const { data, isPending, isError, error, refetch, isFetching } = useMyRegistrations(params);
  const cancelReg = useCancelRegistration();

  const items = data?.data ?? [];

  const confirmCancel = () => {
    cancelReg.mutate(
      { registrationId: toCancel.id },
      { onSettled: () => setToCancel(null) },
    );
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">Đăng ký của tôi</h1>
      <p className="text-sm text-slate-500">Quản lý các sự kiện bạn đã đăng ký.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="w-48"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.values(REGISTRATION_STATUS).map((s) => (
            <option key={s} value={s}>
              {REGISTRATION_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
            checked={upcoming}
            onChange={(e) => {
              setPage(1);
              setUpcoming(e.target.checked);
            }}
          />
          Chỉ sự kiện sắp tới
        </label>
      </div>

      <div className="mt-5 space-y-3">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Bạn chưa có đăng ký nào"
            description="Khám phá các sự kiện và đăng ký tham gia."
            action={
              <Link
                to="/events"
                className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Xem sự kiện
              </Link>
            }
          />
        ) : (
          <div className={isFetching ? 'opacity-60' : ''}>
            {items.map((item) => {
              const active =
                item.status === REGISTRATION_STATUS.REGISTERED ||
                item.status === REGISTRATION_STATUS.WAITLISTED;
              return (
                <div
                  key={item.id}
                  className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/events/${item.event.id}`}
                      className="font-medium text-slate-800 hover:text-brand-600"
                    >
                      {item.event.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {formatEventRange(item.event.startAt, item.event.endAt)} · {item.event.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <RegistrationStatusBadge status={item.status} />
                    <Link
                      to={`/registrations/${item.id}`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Vé / QR
                    </Link>
                    {active && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setToCancel(item)}
                      >
                        Hủy
                      </Button>
                    )}
                  </div>
                </div>
              );
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
              Hủy đăng ký
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Hủy đăng ký sự kiện <strong>{toCancel?.event?.title}</strong>?
        </p>
      </Modal>
    </div>
  );
}
