/**
 * Tiện ích thời gian. Backend trả ISO 8601 có offset (vd 2026-11-05T08:00:00+07:00).
 */
const dtf = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const df = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** '20:00 05/11/2026' */
export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const parts = dtf.formatToParts(d).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${parts.hour}:${parts.minute} ${parts.day}/${parts.month}/${parts.year}`;
}

/** '05/11/2026' */
export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return df.format(d);
}

/** Khoảng thời gian sự kiện: '20:00 - 22:00 05/11/2026' (cùng ngày) hoặc đầy đủ 2 mốc. */
export function formatEventRange(startIso, endIso) {
  if (!startIso) return '—';
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : null;
  if (!end || start.toDateString() !== end.toDateString()) {
    return `${formatDateTime(startIso)}${end ? ` → ${formatDateTime(endIso)}` : ''}`;
  }
  const t = (d) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${t(start)} - ${t(end)} ${formatDate(startIso)}`;
}

/** true nếu mốc thời gian đã qua. */
export function isPast(iso) {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

/** Chuyển Date/local datetime-input value sang ISO có offset để gửi backend. */
export function toIsoWithOffset(localValue) {
  if (!localValue) return undefined;
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** Chuyển ISO sang value cho <input type="datetime-local"> (giờ địa phương). */
export function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
