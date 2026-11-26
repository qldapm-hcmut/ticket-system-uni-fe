import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  usePendingApprovals,
  useApproveEvent,
  useRejectEvent,
} from '../../features/events/useApprovals';
import { Button } from '../../components/ui/Button';
import { Field, Textarea } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/states';
import { Pagination } from '../../components/ui/Pagination';
import { formatEventRange } from '../../utils/datetime';

/** A27/P2 — Admin duyệt/từ chối sự kiện chờ duyệt. */
export function PendingApprovalsPage() {
  const [page, setPage] = useState(1);
  const params = { page, pageSize: 10 };
  const { data, isPending, isError, error, refetch, isFetching } = usePendingApprovals(params);

  const approve = useApproveEvent();
  const reject = useRejectEvent();
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');

  const items = data?.data ?? [];

  const doReject = () => {
    reject.mutate(
      { eventId: rejectTarget.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setReason('');
        },
      },
    );
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">Duyệt sự kiện</h1>
      <p className="text-sm text-slate-500">Hàng chờ duyệt toàn trường, cũ nhất trước.</p>

      <div className="mt-5 space-y-3">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState title="Không có sự kiện chờ duyệt" description="Hàng chờ đang trống." />
        ) : (
          <div className={isFetching ? 'opacity-60' : ''}>
            {items.map((ev) => (
              <div
                key={ev.id}
                className="mb-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/manage/events/${ev.id}`}
                      className="font-medium text-slate-800 hover:text-brand-600"
                    >
                      {ev.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {ev.unit?.name} · {formatEventRange(ev.startAt, ev.endAt)}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {ev.location} · sức chứa {ev.capacity}
                      {ev.createdBy ? ` · tạo bởi ${ev.createdBy.fullName}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setRejectTarget(ev)}
                    >
                      Từ chối
                    </Button>
                    <Button
                      size="sm"
                      loading={approve.isPending && approve.variables?.eventId === ev.id}
                      onClick={() => approve.mutate({ eventId: ev.id })}
                    >
                      Duyệt & công bố
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Pagination meta={data?.meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Từ chối sự kiện"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Đóng
            </Button>
            <Button
              variant="danger"
              loading={reject.isPending}
              disabled={!reason.trim()}
              onClick={doReject}
            >
              Từ chối
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-600">
          Lý do sẽ được gửi tới người tạo sự kiện <strong>{rejectTarget?.title}</strong>.
        </p>
        <Field label="Lý do từ chối" required>
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />
        </Field>
      </Modal>
    </div>
  );
}
