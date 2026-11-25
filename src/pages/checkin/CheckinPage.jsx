import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ScanLine, Ticket, Users } from 'lucide-react';
import { useEvent } from '../../features/events/useEvents';
import { useCheckInActions, useUndoCheckIn } from '../../features/checkin/useCheckin';
import { QrScanner } from '../../features/checkin/QrScanner';
import { CheckinResultBanner } from '../../features/checkin/CheckinResultBanner';
import { CheckinRoster } from '../../features/checkin/CheckinRoster';
import { ReportSummaryStrip } from '../../features/reports/ReportSummaryStrip';
import { ExportButtons } from '../../features/reports/ExportButtons';
import { toast } from '../../lib/toast';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Field';
import { CenteredSpinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/states';

const TABS = [
  { key: 'qr', label: 'Quét QR', icon: ScanLine },
  { key: 'code', label: 'Nhập mã', icon: Ticket },
  { key: 'list', label: 'Danh sách', icon: Users },
];

/** Pill trạng thái cửa sổ check-in: [startAt − 60', endAt]. */
function windowStatus(event) {
  const now = Date.now();
  const start = new Date(event.startAt).getTime();
  const end = new Date(event.endAt).getTime();
  if (now < start - 60 * 60000) return { label: 'Chưa mở', tone: 'gray' };
  if (now > end) return { label: 'Đã đóng', tone: 'gray' };
  return { label: 'Đang mở', tone: 'green' };
}

/**
 * Màn hình check-in của Organizer (A35) — mobile-first.
 * 3 cơ chế: Quét QR (camera), Nhập mã 8 ký tự, Xác nhận thủ công từ danh sách.
 */
export function CheckinPage() {
  const { eventId } = useParams();
  const { data: event, isPending, isError, error, refetch } = useEvent(eventId);

  const actions = useCheckInActions(eventId);
  const undo = useUndoCheckIn(eventId);
  const [tab, setTab] = useState('qr');
  const [result, setResult] = useState(null);

  const handleResult = (r) => {
    setResult(r);
    if (r.ok) toast.success(`Đã check-in: ${r.checkIn.student.fullName}`);
    else toast.apiError(r.error);
  };

  if (isPending) return <CenteredSpinner label="Đang tải sự kiện…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const pill = windowStatus(event);

  return (
    <div className="mx-auto max-w-md">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <Link
          to={`/manage/events/${eventId}`}
          aria-label="Về chi tiết sự kiện"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold text-slate-900">Check-in</h1>
          <p className="truncate text-xs text-slate-500">{event.title}</p>
        </div>
        <Badge tone={pill.tone} dot={pill.tone === 'green'}>
          {pill.label}
        </Badge>
      </div>

      {/* Thống kê B1 */}
      <div className="mt-4">
        <ReportSummaryStrip eventId={eventId} />
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-semibold transition-colors ${
                active ? 'bg-white text-brand-700 shadow-e1' : 'text-slate-500'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-4">
        {tab !== 'list' && (
          <CheckinResultBanner
            result={result}
            onDismiss={() => setResult(null)}
            onUndo={(registrationId) =>
              undo.mutate(registrationId, { onSuccess: () => setResult(null) })
            }
            undoPending={undo.isPending}
          />
        )}

        {tab === 'qr' && (
          <QrScanner
            paused={actions.qr.isPending}
            onScan={(qrToken) =>
              actions.qr.mutate(qrToken, {
                onSuccess: (checkIn) => handleResult({ ok: true, checkIn }),
                onError: (err) => handleResult({ ok: false, error: err }),
              })
            }
          />
        )}

        {tab === 'code' && <CodeEntry mutation={actions.code} onResult={handleResult} />}

        {tab === 'list' && (
          <CheckinRoster eventId={eventId} manualMutation={actions.manual} onResult={handleResult} />
        )}
      </div>

      {/* Export CSV */}
      <div className="mt-6 border-t border-slate-200 pt-4">
        <ExportButtons eventId={eventId} />
      </div>
    </div>
  );
}

/** Tab "Nhập mã": mã 8 ký tự, không phân biệt hoa thường, bỏ qua dấu '-'. */
function CodeEntry({ mutation, onResult }) {
  const [value, setValue] = useState('');
  const normalized = value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
  const valid = normalized.length === 8;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    mutation.mutate(normalized, {
      onSuccess: (checkIn) => {
        onResult({ ok: true, checkIn });
        setValue('');
      },
      onError: (err) => onResult({ ok: false, error: err }),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Mã check-in" hint="8 ký tự, ví dụ K7Q2-M9XD">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="K7Q2-M9XD"
          autoCapitalize="characters"
          className="text-center font-mono text-lg tracking-[0.3em]"
          inputMode="text"
        />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={mutation.isPending} disabled={!valid}>
        Check-in
      </Button>
    </form>
  );
}
