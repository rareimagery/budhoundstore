import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export function useSalesHistory({ page = 1, dateFrom, dateTo } = {}) {
  const params = new URLSearchParams();
  params.set('page[limit]', '25');
  params.set('page[offset]', String((page - 1) * 25));
  params.set('sort', '-created');
  params.set('filter[state]', 'completed');
  // Server-side filters by user role (budtender sees own, others see all).

  return useQuery({
    queryKey: ['sales', { page, dateFrom, dateTo }],
    queryFn: () =>
      apiClient.get(`${ENDPOINTS.ORDERS}?${params}`).then((r) => ({
        sales: r.data.data || [],
        total: r.data.meta?.count || 0,
      })),
    keepPreviousData: true,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartData) =>
      apiClient.post(ENDPOINTS.SALES_CREATE, cartData),
    onSuccess: () => {
      qc.invalidateQueries(['sales']);
      qc.invalidateQueries(['inventory']);
      qc.invalidateQueries(['dashboard']);
    },
  });
}
