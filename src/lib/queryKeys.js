/** Khóa query tập trung để invalidate nhất quán. */
export const qk = {
  me: ['me'],
  units: (type) => ['units', type ?? 'all'],
  events: (params) => ['events', params],
  event: (id) => ['event', id],
  managedEvents: (params) => ['managed-events', params],
  pendingApprovals: (params) => ['pending-approvals', params],
  approvalLogs: (id) => ['approval-logs', id],
  myRegistrations: (params) => ['my-registrations', params],
  registration: (id) => ['registration', id],
  eventRegistrations: (id, params) => ['event-registrations', id, params],
};
