import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useSubmitEvent,
  useDeleteEvent,
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
  const serverErrors = fieldErrorsFrom(create.error);

  // Organizer chọn trong các đơn vị được gán.
  const unitOptions = user?.units?.map((u) => u.unit) ?? [];

  const submit = (e) => {
    e.preventDefault();
    const clientErr = validateDraft(form);
    if (clientErr) return toast.error(clientErr);
    create.mutate(toPayload(form), {
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
        <form onSubmit={submit} className="mt-4 space-y-4">
          <Field label="Đơn vị tổ chức" required error={serverErrors.unitId}>
            <Select
              value={form.unitId}
              onChange={(e) => setForm({ ...form, unitId: e.target.value })}
            >
              <option value="">— Chọn đơn vị —</option>
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>

          <EventFields form={form} setForm={setForm} serverErrors={serverErrors} />

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
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { data: event, isPending, isError, error, refetch } = useEvent(eventId);

  const update = useUpdateEvent(eventId);
  const submitApproval = useSubmitEvent();
  const del = useDeleteEvent();
  const cancel = useCancelEvent();

  const [form, setForm] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Nạp dữ liệu vào form khi event đã tải xong.
  const initial = useMemo(() => (event ? eventToForm(event) : null), [event]);
  const current = form ?? initial;

  if (isPending) return <CenteredSpinner label="Đang tải sự kiện…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const serverErrors = fieldErrorsFrom(update.error);
  const status = event.status;
  const editable = status === EVENT_STATUS.DRAFT || status === EVENT_STATUS.REJECTED || status === EVENT_STATUS.PUBLISHED;
  const canSubmit = status === EVENT_STATUS.DRAFT || status === EVENT_STATUS.REJECTED;
  const canDelete = status === EVENT_STATUS.DRAFT;
  const canCancel = status === EVENT_STATUS.PUBLISHED;

  const save = (e) => {
    e.preventDefault();
    const clientErr = validateDraft(current, { partial: true });
    if (clientErr) return toast.error(clientErr);
    update.mutate(
      { body: toPayload(current, { editable: true }), version: event.version },
      { onSuccess: () => toast.success('Đã lưu thay đổi.') },
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

      {/* A35: lối vào check-in — chỉ ORGANIZER, khi sự kiện đã công bố */}
      {hasRole(ROLES.ORGANIZER) && status === EVENT_STATUS.PUBLISHED && (
        <div className="mt-3">
          <Link
            to={`/manage/events/${event.id}/check-in`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            📷 Mở màn hình check-in
          </Link>
        </div>
      )}

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

      <form onSubmit={save} className="mt-4 space-y-4">
        <fieldset disabled={!editable} className="space-y-4">
          <EventFields form={current} setForm={setForm} serverErrors={serverErrors} />
        </fieldset>

        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4">
          <div className="flex gap-2">
            {canDelete && (
              <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
                Xóa nháp
              </Button>
            )}
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
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Lịch sử duyệt</h2>
        <ApprovalLogs eventId={event.id} />
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Xóa sự kiện nháp"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Không
            </Button>
            <Button
              variant="danger"
              loading={del.isPending}
              onClick={() =>
                del.mutate(event.id, { onSuccess: () => navigate('/manage/events') })
              }
            >
              Xóa
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Hành động này không thể hoàn tác.</p>
      </Modal>

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
      <Field label="Tiêu đề" required error={serverErrors.title}>
        <Input value={form.title} onChange={set('title')} maxLength={200} />
      </Field>
      <Field label="Mô tả" error={serverErrors.description}>
        <Textarea rows={4} value={form.description} onChange={set('description')} />
      </Field>
      <Field label="Địa điểm" required error={serverErrors.location}>
        <Input value={form.location} onChange={set('location')} maxLength={255} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Bắt đầu" required error={serverErrors.startAt}>
          <Input type="datetime-local" value={form.startAt} onChange={set('startAt')} />
        </Field>
        <Field label="Kết thúc" required error={serverErrors.endAt}>
          <Input type="datetime-local" value={form.endAt} onChange={set('endAt')} />
        </Field>
        <Field label="Mở đăng ký" required error={serverErrors.registrationOpensAt}>
          <Input
            type="datetime-local"
            value={form.registrationOpensAt}
            onChange={set('registrationOpensAt')}
          />
        </Field>
        <Field label="Đóng đăng ký" required error={serverErrors.registrationClosesAt}>
          <Input
            type="datetime-local"
            value={form.registrationClosesAt}
            onChange={set('registrationClosesAt')}
          />
        </Field>
        <Field label="Sức chứa" required error={serverErrors.capacity}>
          <Input type="number" min={1} max={5000} value={form.capacity} onChange={set('capacity')} />
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

/** Kiểm tra ràng buộc phía client (giảm số lần gọi API trả lỗi). */
function validateDraft(form) {
  if (!form.title.trim()) return 'Vui lòng nhập tiêu đề.';
  if (!form.location.trim()) return 'Vui lòng nhập địa điểm.';
  const start = new Date(form.startAt);
  const end = new Date(form.endAt);
  const regOpen = new Date(form.registrationOpensAt);
  const regClose = new Date(form.registrationClosesAt);
  if (form.startAt && form.endAt && end <= start) return 'Thời gian kết thúc phải sau thời gian bắt đầu.';
  if (form.registrationOpensAt && form.registrationClosesAt && regClose <= regOpen)
    return 'Thời gian mở đăng ký phải trước thời gian đóng đăng ký.';
  if (form.registrationClosesAt && form.startAt && regClose > start)
    return 'Thời gian đóng đăng ký phải trước hoặc bằng lúc bắt đầu.';
  if (!form.capacity || Number(form.capacity) < 1) return 'Sức chứa phải lớn hơn 0.';
  return null;
}
