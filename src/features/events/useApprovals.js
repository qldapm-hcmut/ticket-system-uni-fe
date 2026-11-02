import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '../../lib/queryKeys';
import { toast } from '../../lib/toast';
import * as api from './events.api';

/** P2 — hàng chờ duyệt (Admin). */
export function usePendingApprovals(params) {
  return useQuery({
    queryKey: qk.pendingApprovals(params),
    queryFn: () => api.listPendingApprovals(params),
    placeholderData: (prev) => prev,
  });
}

/** P5 — lịch sử duyệt. */
export function useApprovalLogs(eventId, options = {}) {
  return useQuery({
    queryKey: qk.approvalLogs(eventId),
    queryFn: () => api.listApprovalLogs(eventId),
    enabled: Boolean(eventId),
    ...options,
  });
}

/** P3 — duyệt & công bố. */
export function useApproveEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, comment }) => api.approveEvent(eventId, comment),
    onSuccess: (event) => {
      toast.success('Đã duyệt và công bố sự kiện.');
      qc.setQueryData(qk.event(event.id), event);
      qc.invalidateQueries({ queryKey: ['pending-approvals'] });
      qc.invalidateQueries({ queryKey: ['managed-events'] });
    },
  });
}

/** P4 — từ chối. */
export function useRejectEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, reason }) => api.rejectEvent(eventId, reason),
    meta: { skipGlobalError: true },
    onSuccess: (event) => {
      toast.success('Đã từ chối sự kiện.');
      qc.setQueryData(qk.event(event.id), event);
      qc.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
  });
}
