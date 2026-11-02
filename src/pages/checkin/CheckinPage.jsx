import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEvent } from '../../features/events/useEvents';
import { useCheckInActions } from '../../features/checkin/useCheckin';
import { QrScanner } from '../../features/checkin/QrScanner';
import { CheckinResultBanner } from '../../features/checkin/CheckinResultBanner';
import { CheckinRoster } from '../../features/checkin/CheckinRoster';
import { ReportSummaryStrip } from '../../features/reports/ReportSummaryStrip';
import { toast } from '../../lib/toast';
import { Button } from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Field';
import { CenteredSpinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/states';
import { formatDateTime } from '../../utils/datetime';

const TABS = [
  { key: 'qr', label: 'Quét QR' },
  { key: 'code', label: 'Nhập mã' },
  { key: 'list', label: 'Danh sách' },
];

/**
 * Màn hình check-in của Organizer (A35) — mobile-first.
 * 3 cơ chế: Quét QR (camera), Nhập mã 8 ký tự, Xác nhận thủ công từ danh sách.
 */
export function CheckinPage() {
  const { eventId } = useParams();
  const { data: event, isPending, isError, error, refetch } = useEvent(eventId);

  const actions = useCheckInActions(eventId);
  const [tab, setTab] = useState('qr');
  const [result, setResult] = useState(null);

  // Gom kết quả từ mọi cơ chế: hiện banner + toast theo error.code.
  const handleResult = (r) => {
    setResult(r);
    if (r.ok) toast.success(`Đã check-in: ${r.checkIn.student.fullName}`);
    else toast.apiError(r.error);
  };

  if (isPending) return <CenteredSpinner label="Đang tải sự kiện…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-md">
      <Link to={`/manage/events/${eventId}`} className="text-sm text-brand-600 hover:underline">
        ← Về chi tiết sự kiện
      </Link>

      <div className="mt-2">
        <h1 className="text-lg font-semibold text-slate-800">Check-in</h1>
        <p className="text-sm text-slate-500">{event.title}</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Cửa sổ check-in: từ 60 phút trước {formatDateTime(event.startAt)} đến{' '}
          {formatDateTime(event.endAt)}
        </p>
      </div>

      <div className="mt-4">
        <ReportSummaryStrip eventId={eventId} />
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1 text-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 font-medium transition-colors ${
              tab === t.key ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {tab !== 'list' && (
          <CheckinResultBanner result={result} onDismiss={() => setResult(null)} />
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

        {tab === 'code' && (
          <CodeEntry mutation={actions.code} onResult={handleResult} />
        )}

        {tab === 'list' && (
          <CheckinRoster
            eventId={eventId}
            manualMutation={actions.manual}
            onResult={handleResult}
          />
        )}
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
          className="text-center font-mono text-lg tracking-widest"
          inputMode="text"
        />
      </Field>
      <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!valid}>
        Check-in
      </Button>
    </form>
  );
}
