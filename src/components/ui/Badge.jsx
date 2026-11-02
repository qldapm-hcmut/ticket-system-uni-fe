import {
  EVENT_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
} from '../../constants/roles';

const TONES = {
  gray: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-brand-50 text-brand-600 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
};

export function Badge({ tone = 'gray', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}
    >
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
