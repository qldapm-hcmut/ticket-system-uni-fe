import { http, unwrap } from '../../lib/http';

/** B1 — GET /events/{id}/reports/summary: thống kê số lượng (Organizer/Admin). */
export async function getEventSummary(eventId) {
  const res = await http.get(`/events/${eventId}/reports/summary`);
  return unwrap(res); // ReportSummary
}
