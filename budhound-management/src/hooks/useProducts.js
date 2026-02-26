import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { PRODUCT_BUNDLES } from '../api/endpoints';

/**
 * Fetch products from all bundles (flower, concentrate, edible, etc.)
 * and merge into a single list.
 */
export function useProducts({ page = 1, search, category, pageSize = 25 } = {}) {
  return useQuery({
    queryKey: ['products', { page, search, category }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page[limit]', String(pageSize));
      params.set('include', 'variations');
      params.set('sort', 'title');

      if (search) {
        params.set('filter[title][operator]', 'CONTAINS');
        params.set('filter[title][value]', search);
      }

      // Query a specific bundle if category is set, otherwise query all
      const bundles = category ? [category] : PRODUCT_BUNDLES;

      const responses = await Promise.all(
        bundles.map((bundle) =>
          apiClient
            .get(`/jsonapi/commerce_product/${bundle}?${params}`)
            .then((r) => ({
              data: r.data.data || [],
              included: r.data.included || [],
              count: r.data.meta?.count || (r.data.data || []).length,
            }))
            .catch(() => ({ data: [], included: [], count: 0 }))
        )
      );

      const allProducts = responses.flatMap((r) => r.data);
      const allIncluded = responses.flatMap((r) => r.included);
      const totalCount = responses.reduce((sum, r) => sum + r.count, 0);

      // Sort merged results by title
      allProducts.sort((a, b) =>
        (a.attributes?.title || '').localeCompare(b.attributes?.title || '')
      );

      // Client-side pagination across merged results
      const offset = (page - 1) * pageSize;
      const paged = allProducts.slice(offset, offset + pageSize);

      return {
        products: paged,
        included: allIncluded,
        total: totalCount,
      };
    },
    keepPreviousData: true,
  });
}

export function useProduct(productId) {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: async () => {
      // Try each bundle until we find the product
      for (const bundle of PRODUCT_BUNDLES) {
        try {
          const r = await apiClient.get(
            `/jsonapi/commerce_product/${bundle}/${productId}?include=variations`
          );
          if (r.data.data) {
            return {
              product: r.data.data,
              included: r.data.included || [],
            };
          }
        } catch {
          // Not in this bundle, try next
        }
      }
      throw new Error('Product not found');
    },
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bundle, productData }) =>
      apiClient.post(`/jsonapi/commerce_product/${bundle}`, { data: productData }),
    onSuccess: () => qc.invalidateQueries(['products']),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, bundle, productData }) =>
      apiClient.patch(`/jsonapi/commerce_product/${bundle}/${productId}`, {
        data: productData,
      }),
    onSuccess: (_, { productId }) => {
      qc.invalidateQueries(['products']);
      qc.invalidateQueries(['products', productId]);
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, bundle }) =>
      apiClient.delete(`/jsonapi/commerce_product/${bundle}/${productId}`),
    onSuccess: () => qc.invalidateQueries(['products']),
  });
}
