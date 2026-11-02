import { messageForError } from '../constants/errorMessages';
import { isApiError } from './apiError';

/**
 * Toast store nhỏ gọn theo pub/sub, không phụ thuộc React, để có thể gọi
 * toast.error(...) ở bất kỳ đâu (kể cả trong tầng service / query client).
 */
let listeners = new Set();
let toasts = [];
let nextId = 1;

function emit() {
  listeners.forEach((l) => l(toasts));
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}

function push(type, message, opts = {}) {
  const id = nextId++;
  toasts = [...toasts, { id, type, message, duration: opts.duration ?? 4000 }];
  emit();
  return id;
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  success: (msg, opts) => push('success', msg, opts),
  error: (msg, opts) => push('error', msg, opts),
  info: (msg, opts) => push('info', msg, opts),
  /**
   * Hiển thị lỗi theo QUY TẮC: map từ error.code, không dùng error.message của backend.
   */
  apiError: (error, opts) => {
    const message = isApiError(error)
      ? messageForError(error)
      : messageForError(undefined);
    return push('error', message, opts);
  },
};
