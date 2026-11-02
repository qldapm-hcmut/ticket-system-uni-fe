import { http, unwrap } from '../../lib/http';
import { filenameFromContentDisposition } from '../../lib/download';

/** B1 — GET /events/{id}/reports/summary: thống kê số lượng (Organizer/Admin). */
export async function getEventSummary(eventId) {
  const res = await http.get(`/events/${eventId}/reports/summary`);
  return unwrap(res); // ReportSummary
}

/**
 * B2 — GET /events/{id}/exports/{kind}: tải file CSV/XLSX trực tiếp.
 * Dùng responseType 'blob' vì server trả file (không phải JSON {data,meta}).
 * Trả { blob, filename } để tầng trên kích hoạt tải về.
 */
export async function exportEventData(eventId, kind = 'registrations', format = 'xlsx') {
  const res = await http.get(`/events/${eventId}/exports/${kind}`, {
    params: { format },
    responseType: 'blob',
  });
  const filename = filenameFromContentDisposition(
    res.headers['content-disposition'],
    `${kind}_${eventId}.${format}`,
  );
  return { blob: res.data, filename };
}
