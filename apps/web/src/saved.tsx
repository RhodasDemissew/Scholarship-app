import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from './auth';
import { request } from '@/lib/http';
import { Button } from '@/components/ui/button';
type Saved={id:string;title:string;available:boolean;savedAt:string};
function useSaved(enabled:boolean){return useQuery({queryKey:['saved'],queryFn:()=>request<Saved[]>('/api/v1/me/saved'),enabled,retry:false});}
export function SavedPage(){
 const session=useSession();const query=useSaved(!!session.data?.authenticated);const client=useQueryClient();const [error,setError]=useState('');
 if(session.isPending)return <p role="status">Checking your session...</p>;
 if(!session.data?.authenticated)return <div className="panel"><h1>Your shortlist</h1><p className="my-4">Sign in to keep your own saved opportunities.</p><Link className="underline" to="/login">Sign in</Link></div>;
 return <><p className="eyebrow">Keep possibilities close</p><h1>Your shortlist</h1><p className="intro">Saved opportunities are private to your account. Saving is not an application.</p>
 {query.isPending&&<p role="status">Loading saved opportunities...</p>}{(query.error||error)&&<p role="alert">{query.error?.message||error}</p>}
 {query.data?.length===0&&<div className="panel mt-6"><h2>No saved opportunities yet</h2><Link className="mt-3 inline-block underline" to="/">Explore opportunities</Link></div>}
 <div className="mt-6 space-y-4">{query.data?.map(item=><article className="panel" key={item.id}><h2>{item.available?<Link to={'/opportunities/'+item.id}>{item.title}</Link>:item.title}</h2>{!item.available&&<p>This listing is currently unpublished or archived.</p>}<Button className="mt-4" variant="outline" onClick={async()=>{setError('');try{await request('/api/v1/me/saved/'+item.id,'DELETE');await client.invalidateQueries({queryKey:['saved']});}catch(e){setError((e as Error).message);}}}>Remove from shortlist<span className="sr-only">: {item.title}</span></Button></article>)}</div></>;
}
const reportSchema=z.object({message:z.string().trim().min(1,'Describe what seems incorrect.').max(1000,'Use 1000 characters or fewer.')});
export function OpportunityActions({id}:{id:string}) {
 const session=useSession();const saved=useSaved(!!session.data?.authenticated);const client=useQueryClient();
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [message,setMessage]=useState('');
 const form=useForm<z.infer<typeof reportSchema>>({resolver:zodResolver(reportSchema),defaultValues:{message:''}});
 const isSaved=saved.data?.some(x=>x.id===id);
 if(!session.data?.authenticated)return <aside className="notice"><Link className="underline" to="/login">Sign in</Link> to save this opportunity or report incorrect information.</aside>;
 return <section className="panel my-6"><h2>Your next steps</h2><Button className="mt-4" disabled={busy||saved.isPending} variant={isSaved?'outline':'default'} onClick={async()=>{setBusy(true);setError('');try{await request('/api/v1/me/saved/'+id,isSaved?'DELETE':'PUT');await client.invalidateQueries({queryKey:['saved']});setMessage(isSaved?'Removed from your shortlist.':'Saved to your shortlist.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>{isSaved?'Remove from shortlist':'Save opportunity'}</Button>
 <details className="mt-6 border-t pt-4"><summary className="cursor-pointer font-semibold">Report incorrect information</summary><form noValidate className="mt-4 space-y-3" onSubmit={form.handleSubmit(async values=>{setError('');try{await request('/api/v1/me/reports/'+id,'POST',values);setMessage('Report received. Thank you for helping improve the catalogue.');form.reset();}catch(e){setError((e as Error).message);}})}>
 <label htmlFor="report-message">What should the editor check?</label><textarea id="report-message" {...form.register('message')} aria-invalid={!!form.formState.errors.message} aria-describedby="report-error"/><p id="report-error" role="alert">{form.formState.errors.message?.message}</p><p className="text-sm text-slate-600">Include the incorrect field and official source if you have one. Do not include personal documents or sensitive information.</p><Button disabled={form.formState.isSubmitting}>Send report</Button></form></details>
 {message&&<p role="status" className="mt-4">{message}</p>}{error&&<p role="alert" className="mt-4 text-red-700">{error}</p>}
 </section>;
}
export function ReportsPage(){
 const query=useQuery({queryKey:['editor-reports'],queryFn:()=>request<{id:string;cycleId:string;title:string;message:string;createdAt:string}[]>('/api/v1/editor/reports'),retry:false});
 return <><h1>Information reports</h1><p className="intro">Review each report against the source and use the normal correction workflow.</p>{query.error&&<p role="alert">{query.error.message}</p>}{query.isPending&&<p role="status">Loading reports...</p>}<div className="mt-6 space-y-4">{query.data?.map(r=><article className="panel" key={r.id}><h2><Link to={'/editor/'+r.cycleId}>{r.title}</Link></h2><p className="my-3 whitespace-pre-wrap">{r.message}</p><p className="text-sm">{new Date(r.createdAt).toLocaleString()}</p></article>)}</div></>;
}

