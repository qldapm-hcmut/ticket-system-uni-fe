import { http, unwrap } from '../../lib/http';
import { ApiError } from '../../lib/apiError';
import { filenameFromContentDisposition } from '../../lib/download';

/** B1 — GET /events/{id}/reports/summary: thống kê số lượng (Organizer/Admin). */
export async function getEventSummary(eventId) {
  const res = await http.get(`/events/${eventId}/reports/summary`);
  return unwrap(res); // ReportSummary
}

// Lỗi export được trả về dạng Blob (vì responseType blob) nên cần map status -> code dự phòng.
const STATUS_CODE = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  503: 'SERVICE_UNAVAILABLE',
};

/**
 * B2 — GET /events/{id}/exports/{kind}: tải CSV (contract chỉ hỗ trợ format=csv).
 *
 * responseType 'blob' khiến body lỗi cũng là Blob -> mất error.code. Theo ngoại lệ được phép
 * (chỉ trong file này), ta tự đọc Blob JSON và ném ApiError đúng `code`. Dùng validateStatus
 * để interceptor của http KHÔNG tự chuyển lỗi (giữ nguyên lib/http.js, lib/apiError.js).
 */
export async function exportEventData(eventId, kind = 'registrations') {
  const res = await http.get(`/events/${eventId}/exports/${kind}`, {
    params: { format: 'csv' },
    responseType: 'blob',
    validateStatus: () => true,
  });

  if (res.status >= 400) {
    let code;
    let details;
    let rawMessage;
    try {
      const body = JSON.parse(await res.data.text());
      code = body?.error?.code;
      details = body?.error?.details;
      rawMessage = body?.error?.message;
    } catch {
      /* body không phải JSON */
    }
    throw new ApiError({
      code: code ?? STATUS_CODE[res.status] ?? 'INTERNAL_ERROR',
      status: res.status,
      details,
      rawMessage,
    });
  }

  const filename = filenameFromContentDisposition(
    res.headers['content-disposition'],
    `${kind}_${eventId}.csv`,
  );
  return { blob: res.data, filename };
}
