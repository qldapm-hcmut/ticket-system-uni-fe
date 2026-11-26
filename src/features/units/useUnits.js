import { useQuery } from '@tanstack/react-query';
import { qk } from '../../lib/queryKeys';
import { listUnits } from './units.api';

/** U1 — danh sách đơn vị (cache lâu vì ít đổi). */
export function useUnits(type) {
  return useQuery({
    queryKey: qk.units(type),
    queryFn: () => listUnits(type),
    staleTime: 5 * 60_000,
  });
}
