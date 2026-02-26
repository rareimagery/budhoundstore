import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export function useDashboardStats(range = 'today') {
  return useQuery({
    queryKey: ['dashboard', range],
    queryFn: () =>
      apiClient.get(ENDPOINTS.DASHBOARD, { params: { range } }).then((r) => r.data),
    refetchInterval: 60_000, // Auto-refresh every minute.
    staleTime: 30_000,
  });
}
