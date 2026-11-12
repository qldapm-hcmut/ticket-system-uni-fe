import { http, unwrap, unwrapPage } from '../../lib/http';

/**
 * Service đăng ký (A29). SSOT: docs/openapi.yaml -> tag Registrations.
 */

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
}

/** R1 — POST /events/{id}/registrations: đăng ký (tự vào waitlist nếu hết chỗ). */
export async function registerForEvent(eventId) {
  const res = await http.post(`/events/${eventId}/registrations`);
  return unwrap(res); // Registration
}

/** R2 — POST /registrations/{id}/cancel: hủy đăng ký / rời waitlist. */
export async function cancelRegistration(registrationId, reason) {
  const res = await http.post(
    `/registrations/${registrationId}/cancel`,
    reason ? { reason } : {},
  );
  return { registration: res.data?.data, meta: res.data?.meta };
}

/** R3 — GET /me/registrations: đăng ký của tôi. */
export async function listMyRegistrations(params) {
  const res = await http.get('/me/registrations', { params: cleanParams(params) });
  return unwrapPage(res);
}

/** R4 — GET /registrations/{id}: chi tiết + qrToken. */
export async function getRegistration(registrationId) {
  const res = await http.get(`/registrations/${registrationId}`);
  return unwrap(res); // RegistrationDetail
}

/** R5 — GET /events/{id}/registrations: danh sách đăng ký của sự kiện (Organizer/Admin). */
export async function listEventRegistrations(eventId, params) {
  const res = await http.get(`/events/${eventId}/registrations`, {
    params: cleanParams(params),
  });
  return unwrapPage(res);
}
