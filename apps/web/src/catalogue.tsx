import { useQuery } from '@tanstack/react-query';
import { request } from '@/lib/http';
import { Link, useParams, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOpportunities, useOpportunity, type Filters } from '@/lib/api';
const schema=z.object({q:z.string().trim().max(80,'Use 80 characters or fewer.'),country:z.string(),intake:z.string(),status:z.string(),tuition:z.string()});
export function ReviewDate({value}:{value?:string|null}) {
 if(!value) return <>Review date not recorded</>;
 const stale=Date.now()-Date.parse(value)>7*86400000;
 return <>Reviewed {new Date(value).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}{stale?' · Recheck the official source':''}</>;
}
export function Explorer() {
 const [params,setParams]=useSearchParams(); const options=useQuery({queryKey:['catalogue-filters'],queryFn:()=>request<{countries:string[];intakes:string[]}>('/api/v1/opportunities/filters')});
 const form=useForm<z.infer<typeof schema>>({resolver:zodResolver(schema),values:{q:params.get('q')??'',country:params.get('country')??'',intake:params.get('intake')??'',status:params.get('status')??'',tuition:params.get('tuition')??''}});
 const current=Math.max(1,Number(params.get('page'))||1);
 const query=useOpportunities({q:params.get('q')??undefined,country:params.get('country')??undefined,intake:params.get('intake')??undefined,status:(params.get('status')||undefined) as Filters['status'],tuition:(params.get('tuition')||undefined) as Filters['tuition'],page:current,pageSize:6});
 function turn(page:number){const next=new URLSearchParams(params);next.set('page',String(page));setParams(next);}
 return <><p className="eyebrow">Explore your possibilities</p><h1>A clearer path to your next degree.</h1><p className="intro">Browse reviewed programmes and funding. See what is known, what is uncertain, and where to confirm it.</p>
 <form noValidate className="panel my-7 space-y-4" onSubmit={form.handleSubmit(values=>setParams(Object.fromEntries(Object.entries(values).filter(([,v])=>v))))}>
 <div><label htmlFor="search" className="font-semibold">Search opportunities</label><Input id="search" placeholder="Programme or institution" {...form.register('q')} aria-invalid={!!form.formState.errors.q} aria-describedby="search-error"/>{form.formState.errors.q&&<p id="search-error" role="alert" className="text-red-700">{form.formState.errors.q.message}</p>}</div>
 <div className="grid gap-4 sm:grid-cols-2"><label>Country<select aria-label="Country" {...form.register('country')}><option value="">All countries</option>{options.data?.countries.map(c=><option key={c}>{c}</option>)}</select></label><label>Intake<select aria-label="Intake" {...form.register('intake')}><option value="">All intakes</option>{options.data?.intakes.map(c=><option key={c}>{c}</option>)}</select></label><label>Opening state<select aria-label="Opening state" {...form.register('status')}><option value="">Any state</option>{['Unknown','Announced','Open','Closed','Withdrawn'].map(x=><option key={x}>{x}</option>)}</select></label><label>Tuition funding<select aria-label="Tuition funding" {...form.register('tuition')}><option value="">Any coverage</option><option value="Covered">Covered</option><option value="NotCovered">Not covered</option><option value="Unknown">Unknown</option></select></label></div>
 <div className="flex flex-wrap gap-3"><Button>Search</Button><Button type="button" variant="outline" onClick={()=>setParams({})}>Clear</Button></div></form>
 {query.isPending&&<p role="status">Loading opportunities...</p>}
 {query.isError&&<div role="alert" className="panel"><h2>We couldn't load opportunities</h2><p className="my-3">{query.error.message}</p><Button disabled={query.isFetching} onClick={()=>void query.refetch()}>Try again</Button></div>}
 {query.data&&<><p role="status" className="mb-4 text-sm text-slate-600">{query.data.total} reviewed {query.data.total===1?'opportunity':'opportunities'}</p>{query.data.items.length===0&&<div className="panel"><h2>No matching opportunities</h2><p className="mt-2">Try broader filters or clear your search.</p></div>}
 <div className="space-y-4">{query.data.items.map(item=><article className="panel" key={item.id}><div className="flex flex-wrap gap-2"><span className="badge">{item.applicationStatus==='Unknown'?'Opening unconfirmed':item.applicationStatus}</span><span className="text-sm text-slate-600">{item.country} · {item.intakeLabel}</span></div><h2 className="mt-4"><Link className="hover:underline" to={'/opportunities/'+item.id}>{item.title}</Link></h2><p className="mt-2 text-slate-600">{item.institutionName}</p><p className="mt-4 text-sm">Tuition: {item.tuition} · Living support: {item.stipend}</p><p className="mt-3 text-xs text-slate-500"><ReviewDate value={item.lastReviewedAt}/></p><Link className="mt-4 inline-block font-semibold text-teal-800 underline" to={'/opportunities/'+item.id}>View details and evidence<span className="sr-only"> for {item.title}</span></Link></article>)}</div>
 <nav aria-label="Results pages" className="mt-6 flex flex-wrap items-center gap-4"><Button variant="outline" disabled={current<=1} onClick={()=>turn(current-1)}>Previous</Button><span>Page {current} of {Math.max(1,Math.ceil(query.data.total/query.data.pageSize))}</span><Button variant="outline" disabled={current*query.data.pageSize>=query.data.total} onClick={()=>turn(current+1)}>Next</Button></nav></>}
 <aside className="notice">A listing is not an eligibility decision or an award guarantee. Always confirm requirements and deadlines with the official provider.</aside></>;
}
export function OpportunityDetail() {
 const {id=''}=useParams();const query=useOpportunity(id);
 if(query.isPending)return <p role="status">Loading opportunity...</p>;
 if(query.error)return <div className="panel" role="alert"><h1>Opportunity unavailable</h1><p className="my-4">{query.error.message}</p><Link to="/">Back to opportunities</Link></div>;
 const item=query.data!;const d=item.draft;
 return <><Link className="underline" to="/">Back to opportunities</Link><div className="mt-6 flex flex-wrap gap-3"><span className="badge">{d.isFictional?'Fictional demo':d.applicationStatus}</span><span>{d.country} · {d.intakeLabel}</span></div><h1 className="mt-4">{d.title}</h1><p className="intro">{d.institutionName} · {d.programmeName}</p><p className="mt-4 text-sm text-slate-600"><ReviewDate value={item.lastReviewedAt}/></p>
 {d.isFictional&&<aside className="notice">Fictional example. This is not a scholarship you can apply for.</aside>}
 <div className="my-6 flex flex-wrap gap-3">{!d.isFictional&&<><Button asChild><a href={d.programmeUrl} target="_blank" rel="noopener noreferrer">Official programme ↗</a></Button>{d.awardUrl&&<Button asChild variant="outline"><a href={d.awardUrl} target="_blank" rel="noopener noreferrer">Official funding ↗</a></Button>}</>}</div>
 <section className="panel my-6"><h2>Deadlines and uncertainty</h2>{d.deadlines.length===0?<p className="mt-3">Deadline not verified. Check the provider.</p>:d.deadlines.map(deadline=><div className="mt-5 border-t pt-4" key={deadline.kind}><h3 className="font-semibold">{deadline.kind}</h3><p className="mt-2 whitespace-pre-wrap">{deadline.originalText}</p><p className="mt-2 text-sm text-slate-600">{deadline.precision==='Unknown'?'Needs confirmation — no precise date is asserted.':deadline.precision==='Date'?'Date only — closing time and timezone are unconfirmed.':deadline.timeZone?'Source timezone: '+deadline.timeZone:'Local time supplied, timezone unconfirmed.'}</p></div>)}</section>
 <section className="panel my-6"><h2>Funding breakdown</h2><p className="mt-2 text-sm text-slate-600">Unknown means not verified, not excluded. Coverage applies only if the scholarship is awarded.</p><dl className="mt-4 grid gap-4 sm:grid-cols-2">{d.funding.map(f=><div key={f.kind} className="rounded-lg bg-slate-50 p-4"><dt className="font-semibold">{f.kind}</dt><dd>{f.coverage==='NotCovered'?'Not covered':f.coverage}{f.amount!=null&&' · '+f.amount+' '+f.currency}<p className="mt-2 text-sm text-slate-600">{f.conditions}</p></dd></div>)}</dl></section>
 <section className="panel my-6"><h2>Source evidence</h2><p className="mt-2 text-sm text-slate-600">Short quotations or labeled reviewer summaries. Follow the source for full requirements.</p>{d.evidence.map((e,i)=><div key={i} className="mt-5 border-t pt-4"><h3 className="font-semibold">{e.field.replace('.',' · ')}</h3><p className="my-2 whitespace-pre-wrap">{e.excerpt}</p><a className="break-all text-sm text-teal-800 underline" href={e.sourceUrl} target="_blank" rel="noopener noreferrer">{new URL(e.sourceUrl).hostname} — official source ↗</a></div>)}</section>
 </>;
}



