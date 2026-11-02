import { Button } from './Button';

/**
 * Phân trang đơn giản dựa trên PageMeta { page, pageSize, totalItems, totalPages }.
 */
export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages, totalItems } = meta;

  return (
    <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
      <span>
        Trang {page}/{totalPages} · {totalItems} mục
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Trước
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
