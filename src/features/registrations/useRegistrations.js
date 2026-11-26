import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '../../lib/queryKeys';
import { toast } from '../../lib/toast';
import { REGISTRATION_STATUS } from '../../constants/roles';
import * as api from './registrations.api';

/** R3 — đăng ký của tôi. */
export function useMyRegistrations(params) {
  return useQuery({
    queryKey: qk.myRegistrations(params),
    queryFn: () => api.listMyRegistrations(params),
    placeholderData: (prev) => prev,
  });
}

/** R4 — chi tiết đăng ký (+ qrToken). */
export function useRegistration(registrationId, options = {}) {
  return useQuery({
    queryKey: qk.registration(registrationId),
    queryFn: () => api.getRegistration(registrationId),
    enabled: Boolean(registrationId),
    ...options,
  });
}

/** R5 — danh sách đăng ký của 1 sự kiện (Organizer/Admin). */
export function useEventRegistrations(eventId, params) {
  return useQuery({
    queryKey: qk.eventRegistrations(eventId, params),
    queryFn: () => api.listEventRegistrations(eventId, params),
    enabled: Boolean(eventId),
    placeholderData: (prev) => prev,
  });
}

/** R1 — đăng ký sự kiện (tự vào waitlist nếu hết chỗ). */
export function useRegisterForEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId) => api.registerForEvent(eventId),
    onSuccess: (registration) => {
      if (registration.status === REGISTRATION_STATUS.WAITLISTED) {
        toast.info(`Sự kiện đã đầy. Bạn vào hàng chờ ở vị trí ${registration.waitlistPosition}.`);
      } else {
        toast.success('Đăng ký thành công!');
      }
      qc.invalidateQueries({ queryKey: qk.event(registration.eventId) });
      qc.invalidateQueries({ queryKey: ['my-registrations'] });
    },
  });
}

/** R2 — hủy đăng ký / rời waitlist. */
export function useCancelRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, reason }) => api.cancelRegistration(registrationId, reason),
    onSuccess: ({ registration }) => {
      toast.success('Đã hủy đăng ký.');
      if (registration?.eventId) {
        qc.invalidateQueries({ queryKey: qk.event(registration.eventId) });
      }
      qc.invalidateQueries({ queryKey: ['my-registrations'] });
      qc.invalidateQueries({ queryKey: ['event-registrations'] });
    },
  });
}
