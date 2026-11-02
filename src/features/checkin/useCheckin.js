import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '../../lib/queryKeys';
import { toast } from '../../lib/toast';
import * as api from './checkin.api';

/** Invalidate mọi dữ liệu bị ảnh hưởng sau một lần check-in / hoàn tác. */
function useInvalidateCheckin(eventId) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['check-ins', eventId] });
    qc.invalidateQueries({ queryKey: ['event-registrations', eventId] });
    qc.invalidateQueries({ queryKey: qk.eventSummary(eventId) });
  };
}

/**
 * 3 cơ chế check-in (A35). Tắt toast lỗi toàn cục để màn hình tự hiển thị
 * banner kết quả + toast theo error.code.
 */
export function useCheckInActions(eventId) {
  const invalidate = useInvalidateCheckin(eventId);
  const common = {
    meta: { skipGlobalError: true },
    onSuccess: invalidate,
  };

  const qr = useMutation({ mutationFn: (qrToken) => api.checkInByQr(eventId, qrToken), ...common });
  const code = useMutation({
    mutationFn: (checkinCode) => api.checkInByCode(eventId, checkinCode),
    ...common,
  });
  const manual = useMutation({
    mutationFn: ({ registrationId, note }) => api.checkInManual(eventId, registrationId, note),
    ...common,
  });

  return { qr, code, manual };
}

/** C2 — danh sách đã check-in. */
export function useCheckIns(eventId, params) {
  return useQuery({
    queryKey: qk.checkIns(eventId, params),
    queryFn: () => api.listCheckIns(eventId, params),
    enabled: Boolean(eventId),
    placeholderData: (prev) => prev,
  });
}

/** C3 — hoàn tác check-in nhầm. */
export function useUndoCheckIn(eventId) {
  const invalidate = useInvalidateCheckin(eventId);
  return useMutation({
    mutationFn: (registrationId) => api.undoCheckIn(registrationId),
    onSuccess: () => {
      toast.success('Đã hoàn tác check-in.');
      invalidate();
    },
  });
}
