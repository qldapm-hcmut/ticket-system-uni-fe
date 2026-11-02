import { useQuery, useMutation } from '@tanstack/react-query';
import { qk } from '../../lib/queryKeys';
import { getEventSummary, exportEventData } from './reports.api';
import { triggerBlobDownload } from '../../lib/download';
import { toast } from '../../lib/toast';

/** B1 — thống kê sự kiện (dùng cho dải báo cáo trên màn check-in). */
export function useEventSummary(eventId, options = {}) {
  return useQuery({
    queryKey: qk.eventSummary(eventId),
    queryFn: () => getEventSummary(eventId),
    enabled: Boolean(eventId),
    ...options,
  });
}

/**
 * B2 — tải file export (CSV/XLSX). Mutation để nút có trạng thái loading.
 * Lỗi được toast theo error.code qua xử lý lỗi tập trung của mutation.
 */
export function useExportEventData(eventId) {
  return useMutation({
    mutationFn: ({ kind = 'registrations', format = 'xlsx' } = {}) =>
      exportEventData(eventId, kind, format),
    onSuccess: ({ blob, filename }) => {
      triggerBlobDownload(blob, filename);
      toast.success('Đã tải file xuống.');
    },
  });
}
