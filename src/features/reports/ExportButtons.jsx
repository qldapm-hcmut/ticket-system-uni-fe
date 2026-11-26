import { Download } from 'lucide-react';
import { useExportEventData } from './useReports';
import { Button } from '../../components/ui/Button';

/** B2 — hai nút tải CSV: điểm danh (attendance) và đăng ký (registrations). */
export function ExportButtons({ eventId }) {
  const exportData = useExportEventData(eventId);
  const pendingKind = exportData.isPending ? exportData.variables?.kind : null;

  const btn = (kind, label) => (
    <Button
      variant="secondary"
      loading={pendingKind === kind}
      disabled={exportData.isPending && pendingKind !== kind}
      onClick={() => exportData.mutate({ kind })}
    >
      {pendingKind !== kind && <Download size={16} aria-hidden="true" />}
      {label}
    </Button>
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      {btn('attendance', 'Điểm danh (CSV)')}
      {btn('registrations', 'Đăng ký (CSV)')}
    </div>
  );
}
