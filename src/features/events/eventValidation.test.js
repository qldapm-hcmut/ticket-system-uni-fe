import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEventForm } from './eventValidation.js';

const now = new Date('2026-11-08T10:00:00+07:00').getTime();
const form = {
  unitId: 'unit', title: 'Demo', location: 'Campus', capacity: '10', waitlistLimit: '',
  startAt: '2026-11-08T12:00:00+07:00', endAt: '2026-11-08T13:00:00+07:00',
  registrationOpensAt: '2026-11-08T09:00:00+07:00', registrationClosesAt: '2026-11-08T11:00:00+07:00',
};

test('opening in the past is allowed while the deadline is in the future', () => {
  assert.deepEqual(validateEventForm(form, { now, requireUnit: true }), {});
});
test('past and exactly-current start/deadline show field errors', () => {
  for (const date of ['2026-11-08T09:59:59+07:00', '2026-11-08T10:00:00+07:00']) {
    assert.ok(validateEventForm({ ...form, startAt: date }, { now }).startAt);
    assert.ok(validateEventForm({ ...form, registrationClosesAt: date }, { now }).registrationClosesAt);
  }
});
test('missing and invalid dates show errors instead of silently omitting payload fields', () => {
  for (const field of ['startAt', 'endAt', 'registrationOpensAt', 'registrationClosesAt']) {
    for (const value of ['', 'not-a-date']) {
      assert.ok(validateEventForm({ ...form, [field]: value }, { now })[field]);
    }
  }
});
test('published event can keep its closed deadline when editing its title', () => {
  const initial = { ...form, registrationClosesAt: '2026-11-08T09:30:00+07:00' };
  assert.deepEqual(validateEventForm({ ...initial, title: 'Edited' }, { now, initial, published: true }), {});
  assert.ok(validateEventForm(initial, { now, initial }).registrationClosesAt);
  assert.ok(validateEventForm({ ...initial, registrationClosesAt: '2026-11-08T09:45:00+07:00' }, { now, initial, published: true }).registrationClosesAt);
});
test('date ordering and required unit remain enforced', () => {
  assert.ok(validateEventForm({ ...form, endAt: form.startAt }, { now }).endAt);
  assert.ok(validateEventForm({ ...form, registrationOpensAt: form.registrationClosesAt }, { now }).registrationOpensAt);
  assert.ok(validateEventForm({ ...form, registrationClosesAt: form.endAt }, { now }).registrationClosesAt);
  assert.ok(validateEventForm({ ...form, unitId: '' }, { now, requireUnit: true }).unitId);
});
