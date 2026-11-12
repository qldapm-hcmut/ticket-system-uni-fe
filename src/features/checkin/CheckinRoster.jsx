import { useState } from 'react';
import { useEventRegistrations } from '../registrations/useRegistrations';
import { useUndoCheckIn } from './useCheckin';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { REGISTRATION_STATUS } from '../../constants/roles';
import { Button } from '../../components/ui/Button';
import { Input, Field, Textarea } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/states';
import { Pagination } from '../../components/ui/Pagination';
import { formatDateTime } from '../../utils/datetime';

/**
 * Tab "Danh sách" — check-in thủ công (MANUAL).
 * Bấm "Check-in" mở Modal bắt buộc nhập `note` (lý do) trước khi gửi.
 */
export function CheckinRoster({ eventId, manualMutation, onResult }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q);

  const params = {
    status: REGISTRATION_STATUS.REGISTERED,
    q: debouncedQ || undefined,
    page,
    pageSize: 15,
  };
  const { data, isPending, isError, error, refetch, isFetching } = useEventRegistrations(
    eventId,
    params,
  );
  const undo = useUndoCheckIn(eventId);

  const [target, setTarget] = useState(null); // registration đang mở modal
  const [note, setNote] = useState('');

  const items = data?.data ?? [];

  const openManual = (reg) => {
    setTarget(reg);
    setNote('');
  };

  const submitManual = () => {
    manualMutation.mutate(
      { registrationId: target.id, note: note.trim() },
      {
        onSuccess: (checkIn) => {
          onResult?.({ ok: true, checkIn });
          setTarget(null);
        },
        onError: (err) => onResult?.({ ok: false, error: err }),
      },
    );
  };

  return (
    <div>
      <Input
        placeholder="Tìm theo tên hoặc MSSV…"
        value={q}
        onChange={(e) => {
          setPage(1);
          setQ(e.target.value);
        }}
      />

      <div className={`mt-4 space-y-2 ${isFetching ? 'opacity-60' : ''}`}>
        {isPending ? (
          Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState title="Không có đăng ký phù hợp" />
        ) : (
          <>
            {items.map((reg) => {
              const checkedIn = Boolean(reg.checkedInAt);
              return (
                <div
                  key={reg.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{reg.student.fullName}</p>
                    <p className="text-xs text-slate-500">{reg.student.studentCode}</p>
                  </div>
                  {checkedIn ? (
                    <div className="flex items-center gap-2">
                      <Badge tone="green">✓ {formatDateTime(reg.checkedInAt)}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={undo.isPending && undo.variables === reg.id}
                        onClick={() => undo.mutate(reg.id)}
                      >
                        Hoàn tác
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => openManual(reg)}>
                      Check-in
                    </Button>
                  )}
                </div>
              );
            })}
            <Pagination meta={data?.meta} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Modal MANUAL: bắt buộc note */}
      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Check-in thủ công"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>
              Hủy
            </Button>
            <Button
              loading={manualMutation.isPending}
              disabled={!note.trim()}
              onClick={submitManual}
            >
              Xác nhận check-in
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-600">
          Xác nhận thủ công cho <strong>{target?.student?.fullName}</strong> ({target?.student?.studentCode}).
          Vui lòng ghi lý do (vd: SV quên điện thoại, đã đối chiếu thẻ SV).
        </p>
        <Field label="Lý do (note)" required>
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={255}
            autoFocus
          />
        </Field>
      </Modal>
    </div>
  );
}
