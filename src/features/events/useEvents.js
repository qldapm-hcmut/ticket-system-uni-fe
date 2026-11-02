import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '../../lib/queryKeys';
import { toast } from '../../lib/toast';
import * as api from './events.api';

/** E1 — danh mục sự kiện PUBLISHED (sinh viên). */
export function useEvents(params) {
  return useQuery({
    queryKey: qk.events(params),
    queryFn: () => api.listPublishedEvents(params),
    placeholderData: (prev) => prev, // giữ dữ liệu cũ khi đổi trang/filter
  });
}

/** E2 — chi tiết sự kiện. */
export function useEvent(eventId, options = {}) {
  return useQuery({
    queryKey: qk.event(eventId),
    queryFn: () => api.getEvent(eventId),
    enabled: Boolean(eventId),
    ...options,
  });
}

/** E3 — sự kiện quản lý (Organizer/Admin). */
export function useManagedEvents(params) {
  return useQuery({
    queryKey: qk.managedEvents(params),
    queryFn: () => api.listManagedEvents(params),
    placeholderData: (prev) => prev,
  });
}

/** E4 — tạo sự kiện DRAFT. */
export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.createEvent(body),
    // Màn hình tự xử lý lỗi VALIDATION_ERROR theo field -> tắt toast chung.
    meta: { skipGlobalError: true },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['managed-events'] });
    },
  });
}

/** E5 — sửa sự kiện (If-Match). */
export function useUpdateEvent(eventId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, version }) => api.updateEvent(eventId, body, version),
    meta: { skipGlobalError: true },
    onSuccess: ({ event }) => {
      qc.setQueryData(qk.event(eventId), event);
      qc.invalidateQueries({ queryKey: ['managed-events'] });
    },
  });
}

/** E6 — xóa DRAFT. */
export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId) => api.deleteEvent(eventId),
    onSuccess: () => {
      toast.success('Đã xóa sự kiện nháp.');
      qc.invalidateQueries({ queryKey: ['managed-events'] });
    },
  });
}

/** P1 — gửi duyệt. */
export function useSubmitEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId) => api.submitEvent(eventId),
    onSuccess: (event) => {
      toast.success('Đã gửi duyệt sự kiện.');
      qc.setQueryData(qk.event(event.id), event);
      qc.invalidateQueries({ queryKey: ['managed-events'] });
    },
  });
}

/** E7 — hủy sự kiện đã công bố. */
export function useCancelEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, reason }) => api.cancelEvent(eventId, reason),
    onSuccess: ({ event, meta }) => {
      toast.success(`Đã hủy sự kiện. Đã thông báo ${meta?.affectedCount ?? 0} người.`);
      qc.setQueryData(qk.event(event.id), event);
      qc.invalidateQueries({ queryKey: ['managed-events'] });
    },
  });
}
