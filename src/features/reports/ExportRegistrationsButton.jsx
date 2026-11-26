import { useExportEventData } from './useReports';
import { Button } from '../../components/ui/Button';

export function ExportRegistrationsButton({ eventId }) {
  const exportData = useExportEventData(eventId);
  return (
    <Button
      variant="secondary"
      size="sm"
      loading={exportData.isPending}
      onClick={() => exportData.mutate()}
    >
      ⬇ Tải danh sách đăng ký (CSV)
    </Button>
  );
}
