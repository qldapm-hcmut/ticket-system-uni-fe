import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl">🧭</div>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">Không tìm thấy trang</h1>
      <p className="mt-1 text-sm text-slate-500">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <Link
        to="/events"
        className="mt-5 inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        Về trang sự kiện
      </Link>
    </div>
  );
}
