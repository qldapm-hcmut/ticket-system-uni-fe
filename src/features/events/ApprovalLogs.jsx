import { useApprovalLogs } from './useApprovals';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDateTime } from '../../utils/datetime';

const ACTION_LABELS = {
  SUBMIT: { text: 'Gửi duyệt', tone: 'text-amber-600' },
  APPROVE: { text: 'Duyệt', tone: 'text-emerald-600' },
  REJECT: { text: 'Từ chối', tone: 'text-red-600' },
};

/** P5 — timeline lịch sử submit/approve/reject. */
export function ApprovalLogs({ eventId }) {
  const { data: logs, isPending, isError } = useApprovalLogs(eventId);

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }
  if (isError) return <p className="text-sm text-slate-400">Không tải được lịch sử duyệt.</p>;
  if (!logs?.length) return <p className="text-sm text-slate-400">Chưa có hoạt động duyệt.</p>;

  return (
    <ol className="space-y-3 border-l-2 border-slate-100 pl-4">
      {logs.map((log) => {
        const action = ACTION_LABELS[log.action] ?? { text: log.action, tone: 'text-slate-600' };
        return (
          <li key={log.id} className="text-sm">
            <span className={`font-medium ${action.tone}`}>{action.text}</span>{' '}
            <span className="text-slate-600">bởi {log.actor?.fullName}</span>
            <span className="text-slate-400"> · {formatDateTime(log.createdAt)}</span>
            {log.comment && <p className="mt-0.5 text-slate-500">“{log.comment}”</p>}
          </li>
        );
      })}
    </ol>
  );
}
