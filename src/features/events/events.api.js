import { http, unwrap, unwrapPage } from '../../lib/http';

/**
 * Service sự kiện + duyệt (A27). SSOT: docs/openapi.yaml -> tag Events, Approval.
 * Không viết axios trực tiếp trong component — luôn đi qua service này.
 */

/** Bỏ các param rỗng/undefined để URL sạch. */
function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
}

/** E1 — GET /events: danh mục PUBLISHED cho sinh viên. */
export async function listPublishedEvents(params) {
  const res = await http.get('/events', { params: cleanParams(params) });
  return unwrapPage(res);
}

/** E2 — GET /events/{id}: chi tiết (kèm myRegistration nếu là sinh viên). */
export async function getEvent(eventId) {
  const res = await http.get(`/events/${eventId}`);
  return unwrap(res);
}

/** E3 — GET /manage/events: Organizer theo đơn vị, Admin toàn trường. */
export async function listManagedEvents(params) {
  const p = cleanParams(params);
  if (Array.isArray(p.status)) p.status = p.status.join(','); // style=form, explode=false
  const res = await http.get('/manage/events', { params: p });
  return unwrapPage(res);
}

/** E4 — POST /events: tạo DRAFT. */
export async function createEvent(body) {
  const res = await http.post('/events', body);
  return unwrap(res);
}

/** E5 — PATCH /events/{id}: cần If-Match = version hiện tại (optimistic lock). */
export async function updateEvent(eventId, body, version) {
  const res = await http.patch(`/events/${eventId}`, body, {
    headers: { 'If-Match': String(version) },
  });
  return { event: res.data?.data, meta: res.data?.meta };
}

/** E6 — DELETE /events/{id}: chỉ khi DRAFT. */
export async function deleteEvent(eventId) {
  await http.delete(`/events/${eventId}`);
}

/** E7 — POST /events/{id}/cancel: hủy sự kiện đã công bố. */
export async function cancelEvent(eventId, reason) {
  const res = await http.post(`/events/${eventId}/cancel`, { reason });
  return { event: res.data?.data, meta: res.data?.meta };
}

/** P1 — POST /events/{id}/submit: gửi duyệt. */
export async function submitEvent(eventId) {
  const res = await http.post(`/events/${eventId}/submit`);
  return unwrap(res);
}

/** P2 — GET /approvals/pending: hàng chờ duyệt (Admin). */
export async function listPendingApprovals(params) {
  const res = await http.get('/approvals/pending', { params: cleanParams(params) });
  return unwrapPage(res);
}

/** P3 — POST /events/{id}/approve: duyệt & công bố (Admin, không phải người tạo). */
export async function approveEvent(eventId, comment) {
  const res = await http.post(`/events/${eventId}/approve`, comment ? { comment } : {});
  return unwrap(res);
}

/** P4 — POST /events/{id}/reject: từ chối (bắt buộc lý do). */
export async function rejectEvent(eventId, reason) {
  const res = await http.post(`/events/${eventId}/reject`, { reason });
  return unwrap(res);
}

/** P5 — GET /events/{id}/approval-logs: lịch sử submit/approve/reject. */
export async function listApprovalLogs(eventId) {
  const res = await http.get(`/events/${eventId}/approval-logs`);
  return unwrap(res);
}
