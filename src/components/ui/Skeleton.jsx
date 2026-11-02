/** Khối skeleton cơ bản (UX bắt buộc: hiển thị khi đang đợi API). */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-md bg-slate-200 ${className}`}
      style={{ animation: 'skeleton-pulse 1.4s ease-in-out infinite' }}
    />
  );
}

/** Skeleton cho một thẻ sự kiện trong danh sách. */
export function EventCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

/** Lưới nhiều skeleton card. */
export function EventListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton hàng danh sách (vd đăng ký của tôi). */
export function RowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex-1">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-2 h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-24" />
    </div>
  );
}
