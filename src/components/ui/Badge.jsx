import {
  EVENT_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
} from '../../constants/roles';

// Spec mục 7: pill px10 py4, Caption, nền nhạt + chữ đậm theo tone.
const TONES = {
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-brand-50 text-brand-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
};

const DOT_TONES = {
  gray: 'bg-slate-500',
  blue: 'bg-brand-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

export function Badge({ tone = 'gray', dot = false, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOT_TONES[tone]}`} aria-hidden="true" />}
      {children}
    </span>
  );
}

const EVENT_STATUS_TONES = {
  DRAFT: 'gray',
  PENDING_APPROVAL: 'amber',
  REJECTED: 'red',
  PUBLISHED: 'green',
  CANCELLED: 'red',
  COMPLETED: 'blue',
};

export function EventStatusBadge({ status }) {
  return (
    <Badge tone={EVENT_STATUS_TONES[status] ?? 'gray'}>
      {EVENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const REG_STATUS_TONES = {
  REGISTERED: 'green',
  WAITLISTED: 'amber',
  CANCELLED: 'gray',
  CANCELLED_BY_EVENT: 'red',
  EXPIRED: 'gray',
};

export function RegistrationStatusBadge({ status }) {
  return (
    <Badge tone={REG_STATUS_TONES[status] ?? 'gray'}>
      {REGISTRATION_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
