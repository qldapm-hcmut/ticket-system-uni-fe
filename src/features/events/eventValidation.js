/** Validate the complete form; published events may retain their existing deadline. */
export function validateEventForm(form, { initial, published = false, requireUnit = false, now = Date.now() } = {}) {
  const errors = {};
  if (requireUnit && !form.unitId) errors.unitId = 'Vui lòng chọn đơn vị tổ chức.';
  if (!form.title.trim()) errors.title = 'Vui lòng nhập tiêu đề.';
  if (!form.location.trim()) errors.location = 'Vui lòng nhập địa điểm.';

  const dates = {};
  for (const key of ['startAt', 'endAt', 'registrationOpensAt', 'registrationClosesAt']) {
    const value = form[key] ? new Date(form[key]).getTime() : NaN;
    if (!Number.isFinite(value)) errors[key] = 'Vui lòng nhập thời gian hợp lệ.';
    else dates[key] = value;
  }
  if (dates.startAt <= now) errors.startAt = 'Thời gian bắt đầu phải sau thời điểm hiện tại.';
  if (dates.endAt <= dates.startAt) errors.endAt = 'Thời gian kết thúc phải sau thời gian bắt đầu.';
  if (dates.registrationOpensAt >= dates.registrationClosesAt) {
    errors.registrationOpensAt = 'Thời gian mở đăng ký phải trước thời gian đóng đăng ký.';
  }
  if (dates.registrationClosesAt > dates.startAt) {
    errors.registrationClosesAt = 'Thời gian đóng đăng ký phải trước hoặc bằng lúc bắt đầu.';
  } else if (dates.registrationClosesAt <= now && (!published || form.registrationClosesAt !== initial?.registrationClosesAt)) {
    errors.registrationClosesAt = 'Thời gian đóng đăng ký phải sau thời điểm hiện tại.';
  }

  const capacity = Number(form.capacity);
  if (!form.capacity || !Number.isInteger(capacity) || capacity < 1 || capacity > 5000) {
    errors.capacity = 'Sức chứa phải là số nguyên từ 1 đến 5000.';
  }
  if (form.waitlistLimit !== '' && (!Number.isInteger(Number(form.waitlistLimit)) || Number(form.waitlistLimit) < 0)) {
    errors.waitlistLimit = 'Giới hạn hàng chờ phải là số nguyên không âm.';
  }
  return errors;
}
