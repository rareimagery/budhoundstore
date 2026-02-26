import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export function useSalesReport({ dateFrom, dateTo, groupBy = 'day' } = {}) {
  return useQuery({
    queryKey: ['reports', 'sales', { dateFrom, dateTo, groupBy }],
    queryFn: () =>
      apiClient.get(ENDPOINTS.REPORT_SALES, {
        params: { date_from: dateFrom, date_to: dateTo, group_by: groupBy },
      }).then((r) => r.data),
    enabled: !!dateFrom && !!dateTo,
  });
}

export function useTaxReport({ dateFrom, dateTo } = {}) {
  return useQuery({
    queryKey: ['reports', 'tax', { dateFrom, dateTo }],
    queryFn: () =>
      apiClient.get(ENDPOINTS.REPORT_TAX, {
        params: { date_from: dateFrom, date_to: dateTo },
      }).then((r) => r.data),
    enabled: !!dateFrom && !!dateTo,
  });
}
