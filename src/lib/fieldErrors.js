import { isApiError } from './apiError';

/**
 * Lấy map { field: message } từ ApiError VALIDATION_ERROR (details.fields).
 * Đây là lỗi theo từng field do người dùng nhập — khác với error.message tổng
 * (vốn không được render). Trả {} nếu không phải lỗi validation.
 */
export function fieldErrorsFrom(error) {
  if (!isApiError(error) || error.code !== 'VALIDATION_ERROR') return {};
  const fields = error.details?.fields;
  if (!Array.isArray(fields)) return {};
  return fields.reduce((acc, f) => {
    if (f?.field) acc[f.field] = f.message ?? 'Giá trị không hợp lệ';
    return acc;
  }, {});
}
