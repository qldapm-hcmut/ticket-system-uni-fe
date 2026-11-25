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

const WEEKDAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

/** Thứ trong tuần tiếng Việt, vd 'Thứ Bảy'. */
export function weekdayVi(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : WEEKDAYS_VI[d.getDay()];
}

/** Ô ngày cho thẻ sự kiện: { day: '12', month: 'THG 12' }. */
export function dayBlock(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: '--', month: '' };
  return { day: String(d.getDate()).padStart(2, '0'), month: `THG ${d.getMonth() + 1}` };
}

const hhmm = (d) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** Khoảng giờ 'HH:mm – HH:mm'. */
export function timeRange(startIso, endIso) {
  if (!startIso) return '—';
  const s = new Date(startIso);
  if (!endIso) return hhmm(s);
  return `${hhmm(s)} – ${hhmm(new Date(endIso))}`;
}

/** 'HH:mm' tại thời điểm (startAt − minutes) — dùng cho "Check-in mở từ". */
export function hhmmMinus(iso, minutes) {
  if (!iso) return '—';
  const d = new Date(new Date(iso).getTime() - minutes * 60000);
  return Number.isNaN(d.getTime()) ? '—' : hhmm(d);
}

/**
 * Khoảng "tuần này" theo giờ VN: Thứ Hai 00:00:00 → Chủ Nhật 23:59:59, ISO có offset +07:00.
 * Giả định máy chạy theo giờ VN (Asia/Ho_Chi_Minh) — đúng với môi trường đồ án.
 */
export function weekRangeVN() {
  const now = new Date();
  const day = now.getDay(); // 0=CN..6=T7
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d, t) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${t}+07:00`;
  return { from: fmt(mon, '00:00:00'), to: fmt(sun, '23:59:59') };
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
