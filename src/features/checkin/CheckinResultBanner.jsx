import { messageForError } from '../../constants/errorMessages';
import { formatDateTime } from '../../utils/datetime';

/**
 * Banner kết quả lần check-in gần nhất (dùng cho tab Quét QR / Nhập mã).
 * Lỗi hiển thị theo error.code; riêng ALREADY_CHECKED_IN hiện thêm chi tiết từ details.
 */
export function CheckinResultBanner({ result, onDismiss }) {
  if (!result) return null;

  if (result.ok) {
    const s = result.checkIn.student;
    return (
      <Shell tone="success" onDismiss={onDismiss}>
        <p className="font-semibold">✓ Đã check-in</p>
        <p>
          {s.fullName} · {s.studentCode}
        </p>
        <p className="text-xs opacity-80">Phương thức: {result.checkIn.method}</p>
      </Shell>
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
    <Shell tone="error" onDismiss={onDismiss}>
      <p className="font-semibold">✕ Không check-in được</p>
      <p>{messageForError(err)}</p>
      {detail && <p className="text-xs opacity-80">{detail}</p>}
    </Shell>
  );
}

function Shell({ tone, children, onDismiss }) {
  const cls =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-800';
  return (
    <div className={`relative rounded-xl border p-4 text-sm ${cls}`}>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 text-current/60 hover:text-current"
        aria-label="Đóng"
      >
        ✕
      </button>
      {children}
    </div>
  );
}
