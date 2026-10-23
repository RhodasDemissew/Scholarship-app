import createClient from 'openapi-fetch';
import { useQuery } from '@tanstack/react-query';
import type { paths } from './api.generated';
const api = createClient<paths>({ baseUrl: '' });
export type Filters = NonNullable<paths['/api/v1/opportunities']['get']['parameters']['query']>;
export function useOpportunities(filters: Filters = {}) {
 return useQuery({
  queryKey: ['opportunities',filters],
  queryFn: async ({ signal }) => {
   const { data, response } = await api.GET('/api/v1/opportunities', { signal, params:{query:filters} });
   if (!response.ok || !data) throw new Error('Could not load opportunities. Check that the API and database are running.');
   return data;
  },
  staleTime: 30_000, retry: false,
 });
}
export function useOpportunity(id: string) {
 return useQuery({queryKey:['opportunity',id],queryFn:async({signal})=>{
  const {data,response}=await api.GET('/api/v1/opportunities/{id}',{signal,params:{path:{id}}});
  if(!response.ok || !data) throw new Error(response.status===404?'This opportunity is unavailable or not published.':'Could not load this opportunity.');
  return data;
 },retry:false});
}

