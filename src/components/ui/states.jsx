import { messageForError } from '../../constants/errorMessages';
import { isApiError } from '../../lib/apiError';
import { Button } from './Button';

/** Trạng thái rỗng (không có dữ liệu). */
export function EmptyState({ title = 'Chưa có dữ liệu', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center">
      <div className="mb-3 text-3xl">📭</div>
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Trạng thái lỗi inline. Hiển thị message theo error.code (không dùng error.message backend).
 */
export function ErrorState({ error, onRetry }) {
  const message = isApiError(error) ? messageForError(error) : messageForError(undefined);
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-14 text-center">
      <div className="mb-3 text-3xl">⚠️</div>
      <p className="font-medium text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
