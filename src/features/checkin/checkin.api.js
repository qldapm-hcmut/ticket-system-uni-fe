import { http, unwrap, unwrapPage } from '../../lib/http';

/**
 * Service check-in (A35). SSOT: docs/openapi.yaml -> tag Check-in.
 * Chỉ ORGANIZER thuộc đơn vị của sự kiện được check-in (ADMIN KHÔNG có quyền).
 */

/** C1 — POST /events/{id}/check-ins bằng QR. */
export async function checkInByQr(eventId, qrToken) {
  const res = await http.post(`/events/${eventId}/check-ins`, { method: 'QR', qrToken });
  return unwrap(res); // CheckIn
}

/** C1 — POST /events/{id}/check-ins bằng mã nhập tay (8 ký tự, bỏ qua dấu '-'). */
export async function checkInByCode(eventId, checkinCode) {
  const res = await http.post(`/events/${eventId}/check-ins`, {
    method: 'CODE',
    checkinCode,
  });
  return unwrap(res);
}

/** C1 — POST /events/{id}/check-ins xác nhận thủ công (bắt buộc note). */
export async function checkInManual(eventId, registrationId, note) {
  const res = await http.post(`/events/${eventId}/check-ins`, {
    method: 'MANUAL',
    registrationId,
    note,
  });
  return unwrap(res);
}

/** C2 — GET /events/{id}/check-ins: danh sách đã check-in (mới nhất trước). */
export async function listCheckIns(eventId, params) {
  const clean = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
  const res = await http.get(`/events/${eventId}/check-ins`, { params: clean });
  return unwrapPage(res);
}

/** C3 — DELETE /registrations/{id}/check-in: hoàn tác check-in nhầm (ghi activity log). */
export async function undoCheckIn(registrationId) {
  await http.delete(`/registrations/${registrationId}/check-in`);
}
