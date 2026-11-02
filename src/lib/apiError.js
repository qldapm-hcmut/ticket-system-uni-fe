import { messageForError } from '../constants/errorMessages';

/**
 * Lỗi API đã chuẩn hoá cho toàn frontend.
 * Luôn có `code` để UI map ra message (xem constants/errorMessages.js).
 */
export class ApiError extends Error {
  /**
   * @param {object} params
   * @param {string}  params.code     ErrorCode từ backend (hoặc mã nội bộ bên dưới)
   * @param {number} [params.status]  HTTP status
   * @param {object} [params.details] error.details từ backend
   * @param {string} [params.rawMessage] message gốc từ backend — chỉ để log, KHÔNG render
   */
  constructor({ code, status, details, rawMessage }) {
    // message của Error object dùng cho hiển thị = message tiếng Việt theo code.
    super(messageForError({ code }));
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details ?? null;
    this.rawMessage = rawMessage ?? null;
  }
}

// Mã nội bộ (không phải từ backend) cho các lỗi tầng mạng.
export const CLIENT_ERROR_CODES = {
  NETWORK: 'INTERNAL_ERROR',
  TIMEOUT: 'INTERNAL_ERROR',
};

/**
 * Chuyển lỗi axios bất kỳ thành ApiError.
 * @param {import('axios').AxiosError} axiosError
 */
export function toApiError(axiosError) {
  const response = axiosError?.response;

  // Có response từ server
  if (response) {
    const body = response.data;
    const err = body?.error;
    if (err?.code) {
      return new ApiError({
        code: err.code,
        status: response.status,
        details: err.details,
        rawMessage: err.message,
      });
    }
    // Response không đúng format { error } — vẫn map theo status.
    return new ApiError({
      code: statusToCode(response.status),
      status: response.status,
      rawMessage: typeof body === 'string' ? body : undefined,
    });
  }

  // Không có response: lỗi mạng / timeout / huỷ request
  return new ApiError({
    code: 'INTERNAL_ERROR',
    rawMessage: axiosError?.message,
  });
}

function statusToCode(status) {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHENTICATED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 405:
      return 'METHOD_NOT_ALLOWED';
    case 409:
      return 'INVALID_STATE_TRANSITION';
    case 428:
      return 'PRECONDITION_REQUIRED';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'INTERNAL_ERROR';
  }
}

export function isApiError(err) {
  return err instanceof ApiError;
}
