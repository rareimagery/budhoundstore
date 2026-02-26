import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS, VARIATION_BUNDLES } from '../api/endpoints';

/**
 * Fetch inventory (product variations) from all variation bundles
 * and merge into a single list.
 */
export function useInventory({ page = 1, search, lowStockOnly, pageSize = 50 } = {}) {
  return useQuery({
    queryKey: ['inventory', { page, search, lowStockOnly }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page[limit]', String(pageSize));
      params.set('sort', 'title');

      if (search) {
        params.set('filter[title][operator]', 'CONTAINS');
        params.set('filter[title][value]', search);
      }

      const responses = await Promise.all(
        VARIATION_BUNDLES.map((bundle) =>
          apiClient
            .get(`/jsonapi/commerce_product_variation/${bundle}?${params}`)
            .then((r) => ({
              data: r.data.data || [],
              count: r.data.meta?.count || (r.data.data || []).length,
            }))
            .catch(() => ({ data: [], count: 0 }))
        )
      );

      let allItems = responses.flatMap((r) => r.data);
      const totalCount = responses.reduce((sum, r) => sum + r.count, 0);

      // Filter low stock on client side
      if (lowStockOnly) {
        allItems = allItems.filter((item) => {
          const qty = item.attributes.field_stock_quantity ?? 0;
          const threshold = item.attributes.field_low_stock_threshold ?? 10;
          return qty <= threshold;
        });
      }

      // Sort by title
      allItems.sort((a, b) =>
        (a.attributes?.title || '').localeCompare(b.attributes?.title || '')
      );

      // Client-side pagination
      const offset = (page - 1) * pageSize;
      const paged = allItems.slice(offset, offset + pageSize);

      return {
        items: paged,
        total: lowStockOnly ? allItems.length : totalCount,
      };
    },
    keepPreviousData: true,
  });
}

export function useAdjustInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variationId, quantity_change, reason, adjustment_type }) =>
      apiClient.post(ENDPOINTS.INVENTORY_ADJUST(variationId), {
        quantity_change,
        reason,
        adjustment_type,
      }),
    onSuccess: () => {
      qc.invalidateQueries(['inventory']);
      qc.invalidateQueries(['dashboard']);
    },
  });
}

export function useInventoryAuditLog({ variationId, page = 1 } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (variationId) params.set('variation_id', variationId);

  return useQuery({
    queryKey: ['inventory-log', { variationId, page }],
    queryFn: () =>
      apiClient.get(`${ENDPOINTS.INVENTORY_LOG}?${params}`).then((r) => r.data),
    enabled: true,
  });
}
