import { Link } from 'react-router-dom';

/** Trang 403 — hiển thị khi user truy cập khu vực không đủ quyền. */
export function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl">🚫</div>
      <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-red-500">Lỗi 403</p>
      <h1 className="mt-1 text-xl font-semibold text-slate-800">Không có quyền truy cập</h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Khu vực này chỉ dành cho cán bộ tổ chức (ORGANIZER) của đơn vị. Tài khoản của bạn không có
        quyền truy cập.
      </p>
      <Link
        to="/events"
        className="mt-5 inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        Về trang sự kiện
      </Link>
    </div>
  );
}
