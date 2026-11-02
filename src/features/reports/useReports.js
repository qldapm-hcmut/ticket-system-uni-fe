import { useQuery } from '@tanstack/react-query';
import { qk } from '../../lib/queryKeys';
import { getEventSummary } from './reports.api';

/** B1 — thống kê sự kiện (dùng cho dải báo cáo trên màn check-in). */
export function useEventSummary(eventId, options = {}) {
  return useQuery({
    queryKey: qk.eventSummary(eventId),
    queryFn: () => getEventSummary(eventId),
    enabled: Boolean(eventId),
    ...options,
  });
}
