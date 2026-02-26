import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Fetch paginated, filterable order list.
 */
export function useOrders({ page = 1, status, search, pageSize = 25 } = {}) {
  const params = new URLSearchParams();
  params.set('page[limit]', String(pageSize));
  params.set('page[offset]', String((page - 1) * pageSize));
  params.set('include', 'order_items,order_items.purchased_entity');
  params.set('sort', '-created');

  if (status) params.set('filter[state]', status);
  if (search) {
    params.set('filter[order_number][operator]', 'CONTAINS');
    params.set('filter[order_number][value]', search);
  }

  return useQuery({
    queryKey: ['orders', { page, status, search }],
    queryFn: () =>
      apiClient.get(`${ENDPOINTS.ORDERS}?${params}`).then((r) => ({
        orders: r.data.data || [],
        included: r.data.included || [],
        meta: r.data.meta || {},
        total: r.data.meta?.count || 0,
      })),
    keepPreviousData: true,
  });
}

/**
 * Fetch single order with full details.
 */
export function useOrder(orderId) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () =>
      apiClient
        .get(`${ENDPOINTS.ORDERS}/${orderId}?include=order_items,order_items.purchased_entity`)
        .then((r) => ({
          order: r.data.data,
          included: r.data.included || [],
        })),
    enabled: !!orderId,
  });
}

/**
 * Update order status.
 */
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, note }) =>
      apiClient.patch(ENDPOINTS.ORDER_STATUS(orderId), { status, note }),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries(['orders']);
      qc.invalidateQueries(['orders', orderId]);
      qc.invalidateQueries(['dashboard']);
    },
  });
}

/**
 * Assign delivery driver to an order.
 */
export function useAssignDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, driverId }) =>
      apiClient.patch(ENDPOINTS.ORDER_ASSIGN_DRIVER(orderId), { driver_id: driverId }),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries(['orders', orderId]);
    },
  });
}

/**
 * Process a refund on an order.
 */
export function useProcessRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, amount, reason }) =>
      apiClient.post(ENDPOINTS.ORDER_REFUND(orderId), { amount, reason }),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries(['orders', orderId]);
      qc.invalidateQueries(['orders']);
      qc.invalidateQueries(['dashboard']);
    },
  });
}

/**
 * Receive COD payment — marks pending payment as received
 * and transitions order from cod_pending → completed.
 */
export function useReceivePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId }) =>
      apiClient.post(ENDPOINTS.ORDER_RECEIVE_PAYMENT(orderId)),
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries(['orders', orderId]);
      qc.invalidateQueries(['orders']);
      qc.invalidateQueries(['dashboard']);
    },
  });
}
