import { useState } from 'react';
import { useExportEventData } from './useReports';
import { Button } from '../../components/ui/Button';

const FORMATS = [
  { key: 'xlsx', label: 'XLSX' },
  { key: 'csv', label: 'CSV' },
];

/**
 * B2 — nút tải danh sách đăng ký (CSV/XLSX).
 * Chọn định dạng rồi bấm tải; nút tự disable + spinner khi đang tải.
 */
export function ExportRegistrationsButton({ eventId }) {
  const [format, setFormat] = useState('xlsx');
  const exportData = useExportEventData(eventId);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 text-xs">
        {FORMATS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFormat(f.key)}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              format === f.key ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        loading={exportData.isPending}
        onClick={() => exportData.mutate({ kind: 'registrations', format })}
      >
        ⬇ Tải danh sách đăng ký
      </Button>
    </div>
  );
}
