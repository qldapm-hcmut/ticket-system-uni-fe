import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useSubmitEvent,
  useCancelEvent,
} from '../../features/events/useEvents';
import { useAuth } from '../../features/auth/AuthContext';
import { ROLES, EVENT_STATUS } from '../../constants/roles';
import { fieldErrorsFrom } from '../../lib/fieldErrors';
import { toast } from '../../lib/toast';
import { EventStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Field, Input, Textarea, Select } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { CenteredSpinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/states';
import { toDatetimeLocalValue, toIsoWithOffset } from '../../utils/datetime';
import { ApprovalLogs } from '../../features/events/ApprovalLogs';
import { validateEventForm } from '../../features/events/eventValidation';
import { messageForError } from '../../constants/errorMessages';
import { ExportRegistrationsButton } from '../../features/reports/ExportRegistrationsButton';

const EMPTY = {
  unitId: '',
  title: '',
  description: '',
  location: '',
  startAt: '',
  endAt: '',
  registrationOpensAt: '',
  registrationClosesAt: '',
  capacity: '',
  waitlistLimit: '',
};

export function EventFormPage() {
  const { eventId } = useParams();
  const isNew = !eventId;

  if (isNew) return <CreateEventForm />;
  return <EditEventForm eventId={eventId} />;
}

/* ----------------------------- Tạo mới ----------------------------- */
function CreateEventForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const create = useCreateEvent();
  const [form, setForm] = useState(EMPTY);
  const [clientErrors, setClientErrors] = useState({});
  const errors = { ...fieldErrorsFrom(create.error), ...clientErrors };
  const changeForm = (next) => {
    setForm(next);
    setClientErrors({});
    create.reset();
  };

  // Organizer chọn trong các đơn vị được gán.
  const unitOptions = user?.units?.map((u) => u.unit) ?? [];

  const submit = (e) => {
    e.preventDefault();
    const clientErr = validateEventForm(form, { requireUnit: true });
    setClientErrors(clientErr);
    if (Object.keys(clientErr).length) return toast.error(Object.values(clientErr)[0]);
    create.mutate(toPayload(form), {
      onError: (err) => toast.apiError(err),
      onSuccess: (ev) => {
        toast.success('Đã tạo sự kiện nháp.');
        navigate(`/manage/events/${ev.id}`);
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/manage/events" className="text-sm text-brand-600 hover:underline">
        ← Về danh sách quản lý
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-slate-800">Tạo sự kiện</h1>

      {unitOptions.length === 0 ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Tài khoản của bạn chưa được gán đơn vị nào nên không thể tạo sự kiện. Liên hệ Admin để
          được thêm vào một đơn vị.
        </p>
      ) : (
        <form noValidate onSubmit={submit} className="mt-4 space-y-4">
          {create.isError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{messageForError(create.error)}</p>}
          <Field label="Đơn vị tổ chức" htmlFor="event-unitId" required error={errors.unitId}>
            <Select
              id="event-unitId"
              value={form.unitId}
              onChange={(e) => changeForm({ ...form, unitId: e.target.value })}
            >
              <option value="">— Chọn đơn vị —</option>
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>

          <EventFields form={form} setForm={changeForm} serverErrors={errors} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" loading={create.isPending}>
              Tạo nháp
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ----------------------------- Chỉnh sửa ----------------------------- */
function EditEventForm({ eventId }) {
  const { user, hasRole } = useAuth();
  const { data: event, isPending, isError, error, refetch } = useEvent(eventId);

  const update = useUpdateEvent(eventId);
  const submitApproval = useSubmitEvent();
  const cancel = useCancelEvent();

  const [form, setForm] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [clientErrors, setClientErrors] = useState({});
  const changeForm = (next) => {
    setForm(next);
    setClientErrors({});
    update.reset();
    submitApproval.reset();
  };

  // Nạp dữ liệu vào form khi event đã tải xong.
  const initial = useMemo(() => (event ? eventToForm(event) : null), [event]);
  const current = form ?? initial;

  if (isPending) return <CenteredSpinner label="Đang tải sự kiện…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const serverErrors = { ...fieldErrorsFrom(submitApproval.error), ...fieldErrorsFrom(update.error), ...clientErrors };
  const status = event.status;
  const editable = status === EVENT_STATUS.DRAFT || status === EVENT_STATUS.REJECTED || status === EVENT_STATUS.PUBLISHED;
  const canSubmit = status === EVENT_STATUS.DRAFT || status === EVENT_STATUS.REJECTED;
  const canCancel = status === EVENT_STATUS.PUBLISHED;
  const canExport = hasRole(ROLES.ADMIN) || (
    hasRole(ROLES.ORGANIZER) && user?.units?.some(({ unit }) => unit.id === event.unit?.id)
  );

  const save = (e) => {
    e.preventDefault();
    const clientErr = validateEventForm(current, { initial, published: status === EVENT_STATUS.PUBLISHED });
    setClientErrors(clientErr);
    if (Object.keys(clientErr).length) return toast.error(Object.values(clientErr)[0]);
    // Keep untouched timestamps exactly as stored (datetime-local displays minutes).
    const body = Object.fromEntries(
      Object.entries(toPayload(current, { editable: true })).filter(([key]) => current[key] !== initial[key]),
    );
    if (!Object.keys(body).length) return toast.info('Chưa có thay đổi để lưu.');
    update.mutate(
      { body, version: event.version },
      {
        onError: (err) => toast.apiError(err),
        onSuccess: () => {
          setForm(null);
          toast.success('Đã lưu thay đổi.');
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/manage/events" className="text-sm text-brand-600 hover:underline">
        ← Về danh sách quản lý
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-slate-800">{event.title}</h1>
        <EventStatusBadge status={status} />
      </div>

      {/* Export remains available after the event ends, outside the disabled edit form. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {canExport && <ExportRegistrationsButton eventId={event.id} />}
        {hasRole(ROLES.ORGANIZER) && status === EVENT_STATUS.PUBLISHED && (
          <Link
            to={`/manage/events/${event.id}/check-in`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            📷 Mở màn hình check-in
          </Link>
        )}
      </div>

      {status === EVENT_STATUS.REJECTED && event.rejectReason && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Lý do từ chối:</strong> {event.rejectReason}
        </p>
      )}
      {status === EVENT_STATUS.PENDING_APPROVAL && (
        <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Sự kiện đang chờ duyệt nên không thể chỉnh sửa.
        </p>
      )}

      <form noValidate onSubmit={save} className="mt-4 space-y-4">
        {update.isError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{messageForError(update.error)}</p>}
        <fieldset disabled={!editable} className="space-y-4">
          <EventFields form={current} setForm={changeForm} serverErrors={serverErrors} />
        </fieldset>

        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4">
          <div className="flex gap-2">
            {canCancel && (
              <Button type="button" variant="danger" onClick={() => setConfirmCancel(true)}>
                Hủy sự kiện
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {editable && (
              <Button type="submit" variant="secondary" loading={update.isPending}>
                Lưu thay đổi
              </Button>
            )}
            {canSubmit && (
              <Button
                type="button"
                loading={submitApproval.isPending}
                onClick={() => submitApproval.mutate(event.id)}
              >
                Gửi duyệt
              </Button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-8">
        {submitApproval.isError && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <p>{messageForError(submitApproval.error)}</p>
            {Object.entries(fieldErrorsFrom(submitApproval.error)).map(([field, message]) => <p key={field}>{message}</p>)}
          </div>
        )}
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Lịch sử duyệt</h2>
        <ApprovalLogs eventId={event.id} />
      </div>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Hủy sự kiện đã công bố"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
              Đóng
            </Button>
            <Button
              variant="danger"
              loading={cancel.isPending}
              disabled={!cancelReason.trim()}
              onClick={() =>
                cancel.mutate(
                  { eventId: event.id, reason: cancelReason.trim() },
                  { onSuccess: () => setConfirmCancel(false) },
                )
              }
            >
              Xác nhận hủy
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-slate-600">
          Mọi người đã đăng ký và trong hàng chờ sẽ nhận thông báo hủy.
        </p>
        <Field label="Lý do hủy" required>
          <Textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            maxLength={500}
          />
        </Field>
      </Modal>
    </div>
  );
}

/* ----------------------------- Các field dùng chung ----------------------------- */
function EventFields({ form, setForm, serverErrors }) {
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  return (
    <>
      <Field label="Tiêu đề" htmlFor="event-title" required error={serverErrors.title}>
        <Input id="event-title" value={form.title} onChange={set('title')} maxLength={200} />
      </Field>
      <Field label="Mô tả" error={serverErrors.description}>
        <Textarea rows={4} value={form.description} onChange={set('description')} />
      </Field>
      <Field label="Địa điểm" htmlFor="event-location" required error={serverErrors.location}>
        <Input id="event-location" value={form.location} onChange={set('location')} maxLength={255} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Bắt đầu" htmlFor="event-startAt" required error={serverErrors.startAt}>
          <Input id="event-startAt" type="datetime-local" value={form.startAt} onChange={set('startAt')} />
        </Field>
        <Field label="Kết thúc" htmlFor="event-endAt" required error={serverErrors.endAt}>
          <Input id="event-endAt" type="datetime-local" value={form.endAt} onChange={set('endAt')} />
        </Field>
        <Field label="Mở đăng ký" htmlFor="event-registrationOpensAt" required error={serverErrors.registrationOpensAt}>
          <Input
            id="event-registrationOpensAt"
            type="datetime-local"
            value={form.registrationOpensAt}
            onChange={set('registrationOpensAt')}
          />
        </Field>
        <Field label="Đóng đăng ký" htmlFor="event-registrationClosesAt" required error={serverErrors.registrationClosesAt}>
          <Input
            id="event-registrationClosesAt"
            type="datetime-local"
            value={form.registrationClosesAt}
            onChange={set('registrationClosesAt')}
          />
        </Field>
        <Field label="Sức chứa" htmlFor="event-capacity" required error={serverErrors.capacity}>
          <Input id="event-capacity" type="number" min={1} max={5000} value={form.capacity} onChange={set('capacity')} />
        </Field>
        <Field
          label="Giới hạn hàng chờ"
          hint="Để trống = không giới hạn"
          error={serverErrors.waitlistLimit}
        >
          <Input type="number" min={0} value={form.waitlistLimit} onChange={set('waitlistLimit')} />
        </Field>
      </div>
    </>
  );
}

/* ----------------------------- Helpers ----------------------------- */
function eventToForm(ev) {
  return {
    unitId: ev.unit?.id ?? '',
    title: ev.title ?? '',
    description: ev.description ?? '',
    location: ev.location ?? '',
    startAt: toDatetimeLocalValue(ev.startAt),
    endAt: toDatetimeLocalValue(ev.endAt),
    registrationOpensAt: toDatetimeLocalValue(ev.registrationOpensAt),
    registrationClosesAt: toDatetimeLocalValue(ev.registrationClosesAt),
    capacity: String(ev.capacity ?? ''),
    waitlistLimit: ev.waitlistLimit == null ? '' : String(ev.waitlistLimit),
  };
}

function toPayload(form, { editable } = {}) {
  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    location: form.location.trim(),
    startAt: toIsoWithOffset(form.startAt),
    endAt: toIsoWithOffset(form.endAt),
    registrationOpensAt: toIsoWithOffset(form.registrationOpensAt),
    registrationClosesAt: toIsoWithOffset(form.registrationClosesAt),
    capacity: Number(form.capacity),
    waitlistLimit: form.waitlistLimit === '' ? null : Number(form.waitlistLimit),
  };
  // unitId chỉ gửi khi tạo mới (không đổi được khi sửa).
  if (!editable && form.unitId) payload.unitId = form.unitId;
  return payload;
}