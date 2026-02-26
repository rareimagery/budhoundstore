import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export function useOrderCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) =>
      apiClient.post(ENDPOINTS.ORDERS_CREATE, orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
