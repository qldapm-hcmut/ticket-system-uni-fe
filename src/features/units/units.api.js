import { http, unwrap } from '../../lib/http';

/** U1 — GET /units: danh sách đơn vị (dùng để lọc sự kiện). */
export async function listUnits(type) {
  const res = await http.get('/units', { params: type ? { type } : {} });
  return unwrap(res); // Unit[]
}
