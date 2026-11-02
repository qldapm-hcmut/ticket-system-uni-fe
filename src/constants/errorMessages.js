/**
 * Map error.code (SSOT: docs/openapi.yaml -> ErrorCode) sang thông điệp tiếng Việt cho UI.
 *
 * QUY TẮC BẮT BUỘC: UI chỉ hiển thị message theo error.code ở đây.
 * KHÔNG render thẳng error.message từ backend (backend có thể đổi message bất cứ lúc nào).
 *
 * Nếu gặp code lạ (backend thêm mới) -> rơi về FALLBACK_MESSAGE.
 */
export const ERROR_MESSAGES = {
  // Chung
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  UNAUTHENTICATED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy nội dung bạn yêu cầu.',
  PRECONDITION_REQUIRED: 'Thiếu thông tin phiên bản. Vui lòng tải lại trang.',
  INTERNAL_ERROR: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  METHOD_NOT_ALLOWED: 'Thao tác không được hỗ trợ.',
  SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',

  // Duyệt sự kiện
  SELF_APPROVAL_NOT_ALLOWED: 'Bạn không thể tự duyệt sự kiện do chính mình tạo.',
  INVALID_STATE_TRANSITION: 'Không thể thực hiện thao tác với trạng thái hiện tại của sự kiện.',
  CAPACITY_BELOW_REGISTERED: 'Sức chứa mới thấp hơn số người đã đăng ký.',
  VERSION_CONFLICT: 'Sự kiện vừa được cập nhật ở nơi khác. Vui lòng tải lại và thử lại.',

  // Đăng ký
  ALREADY_REGISTERED: 'Bạn đã đăng ký sự kiện này rồi.',
  EVENT_FULL: 'Sự kiện đã hết chỗ.',
  REGISTRATION_CLOSED: 'Sự kiện đã đóng đăng ký.',
  CANCEL_DEADLINE_PASSED: 'Đã quá hạn hủy đăng ký (trước giờ bắt đầu 24 giờ).',

  // Check-in
  SELF_CHECKIN_NOT_ALLOWED: 'Bạn không thể tự check-in cho đăng ký của chính mình.',
  ALREADY_CHECKED_IN: 'Sinh viên đã được check-in trước đó.',
  CHECKIN_WINDOW_CLOSED: 'Ngoài khung giờ cho phép check-in.',
  NOT_ELIGIBLE_FOR_CHECKIN: 'Đăng ký này không đủ điều kiện để check-in.',
  INVALID_QR: 'Mã QR hoặc mã check-in không hợp lệ.',
};

export const FALLBACK_MESSAGE = 'Đã có lỗi xảy ra. Vui lòng thử lại.';

/**
 * Lấy message tiếng Việt từ một ApiError đã chuẩn hoá.
 * @param {{ code?: string }} [error]
 */
export function messageForError(error) {
  if (!error || !error.code) return FALLBACK_MESSAGE;
  return ERROR_MESSAGES[error.code] ?? FALLBACK_MESSAGE;
}
