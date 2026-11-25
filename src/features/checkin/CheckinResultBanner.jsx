import { CircleCheck, CircleX } from 'lucide-react';
import { messageForError } from '../../constants/errorMessages';
import { Button } from '../../components/ui/Button';
import { formatDateTime, timeRange } from '../../utils/datetime';

/**
 * Banner kết quả lần check-in gần nhất.
 * Lỗi hiển thị theo error.code; ALREADY_CHECKED_IN hiện thêm chi tiết từ details.
 * Thành công có nút Hoàn tác (C3).
 */
export function CheckinResultBanner({ result, onDismiss, onUndo, undoPending }) {
  if (!result) return null;

  if (result.ok) {
    const c = result.checkIn;
    return (
      <div className="flex items-start gap-3 rounded-card border border-emerald-200 bg-emerald-50 px-4 py-3">
        <CircleCheck size={24} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-emerald-700">
            Đã check-in: {c.student.fullName}
          </p>
          <p className="text-xs text-emerald-700/80">
            {c.student.studentCode} · {timeRange(c.checkedInAt)} · {c.method}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          loading={undoPending}
          onClick={() => onUndo?.(c.registrationId)}
        >
          Hoàn tác
        </Button>
      </div>
    );
  }

  const err = result.error;
  const detail =
    err?.code === 'ALREADY_CHECKED_IN' && err.details
      ? `Đã check-in lúc ${formatDateTime(err.details.checkedInAt)}${
          err.details.checkedInBy ? ` bởi ${err.details.checkedInBy}` : ''
        }`
      : null;

  return (
    <div className="flex items-start gap-3 rounded-card border border-red-200 bg-red-50 px-4 py-3">
      <CircleX size={24} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-red-700">{messageForError(err)}</p>
        {detail && <p className="text-xs text-red-700/80">{detail}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-red-400 hover:text-red-600"
        aria-label="Đóng"
      >
        ✕
      </button>
    </div>
  );
}
