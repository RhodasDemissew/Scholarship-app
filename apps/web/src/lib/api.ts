import createClient from 'openapi-fetch';
import { useQuery } from '@tanstack/react-query';
import type { paths } from './api.generated';
const api = createClient<paths>({ baseUrl: '' });
export function useOpportunities() {
 return useQuery({
  queryKey: ['opportunities'],
  queryFn: async ({ signal }) => {
   const { data, response } = await api.GET('/api/v1/opportunities', { signal });
   if (!response.ok || !data) throw new Error('Could not load opportunities.');
   return data;
  },
  staleTime: 30_000, retry: false,
 });
}

