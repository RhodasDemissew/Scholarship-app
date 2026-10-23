import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '@/lib/http';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { components } from '@/lib/api.generated';
type Draft = components['schemas']['DraftInput'];
type View = components['schemas']['CatalogueView'];
const fundingKinds = ['Tuition','Stipend','Travel','Insurance','Visa','Other'] as const;
const deadlineKinds = ['Admission','Scholarship','References','Documents'] as const;
const blank: Draft = { title:'', institutionName:'',domain:'',country:'',programmeName:'',programmeUrl:'',awardName:null,sponsor:null,awardUrl:null,intakeLabel:'',round:'main',isFictional:false,applicationStatus:'Unknown',deadlines:[],funding:fundingKinds.map(kind=>({kind,coverage:'Unknown',amount:null,currency:null,conditions:null})),evidence:[] };
export function Editor() {
 const { id }=useParams(); const navigate=useNavigate();
 const access=useQuery({queryKey:['editor-access'],queryFn:async()=>{await request('/api/v1/editor/access');return true;},retry:false});
 const list=useQuery({queryKey:['editor-list'],queryFn:()=>request<{id:string;title:string;publicationStatus:string}[]>('/api/v1/editor/opportunities/'),enabled:access.isSuccess});
 const item=useQuery({queryKey:['editor',id],queryFn:()=>request<View>('/api/v1/editor/opportunities/'+id),enabled:access.isSuccess && !!id && id!=='new'});
 if(access.isPending) return <p role="status">Checking editor access...</p>;
 if(access.isError) return <div className="panel"><h1>Editor access required</h1><p className="my-4">Sign in with an Editor or Administrator account and complete authenticator verification.</p><Link to="/security">Account security</Link></div>;
 if(!id) return <><h1>Editorial workspace</h1><Link to="/editor/reports" className="mt-4 inline-block underline">Review information reports</Link><p className="intro">Review sources before publishing. Drafts stay private.</p><Button className="my-6" onClick={()=>navigate('/editor/new')}>Create draft</Button>{list.error && <p role="alert">{list.error.message}</p>}<div className="space-y-3">{list.data?.map(c=><Link className="panel block" key={c.id} to={'/editor/'+c.id}><h2>{c.title}</h2><p>{c.publicationStatus}</p></Link>)}</div></>;
 if(id==='new') return <EditorForm key="new" initial={blank}/>;
 if(item.isPending) return <p role="status">Loading draft...</p>;
 if(item.error) return <p role="alert">{item.error.message}</p>;
 return <EditorForm key={item.data!.version} initial={item.data!.draft} record={item.data}/>;
}
function EditorForm({ initial, record }: {initial:Draft; record?:View}) {
 const [draft,setDraft]=useState<Draft>(structuredClone(initial));
 const [error,setError]=useState('');const [busy,setBusy]=useState(false); const errorRef=useRef<HTMLParagraphElement>(null); useEffect(()=>{if(error)errorRef.current?.focus();},[error]);
 const client=useQueryClient();const navigate=useNavigate();
 const audit=useQuery({queryKey:['audit',record?.id],queryFn:()=>request<{action:string;at:string;changedFields:string;newStatus:string}[]>('/api/v1/editor/opportunities/'+record!.id+'/audit'),enabled:!!record});
 function field(name:keyof Draft,label:string,type='text') {
  return <div key={name}><label htmlFor={name}>{label}</label><Input id={name} type={type} value={String(draft[name]??'')} onChange={e=>setDraft({...draft,[name]:e.target.value})}/></div>;
 }
 async function save(action?:string) {
  setBusy(true);setError('');
  try {
   const url='/api/v1/editor/opportunities/';
   const saved=await request<View>(url+(record?.id??'')+(action?'/'+action:''), action?'POST':record?'PUT':'POST',action?{version:record!.version}:record?{version:record.version,draft}:draft);
   await client.invalidateQueries({queryKey:['editor-list']});await client.invalidateQueries({queryKey:['editor',saved.id]});await client.invalidateQueries({queryKey:['audit',saved.id]});await client.invalidateQueries({queryKey:['opportunities']});
   navigate('/editor/'+saved.id);
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 const fields: [keyof Draft,string,string?][]=[['title','Listing title'],['institutionName','Institution name'],['domain','Official institution domain'],['country','Country'],['programmeName','Programme name'],['programmeUrl','Official programme URL','url'],['awardName','Award name (optional)'],['sponsor','Award sponsor'],['awardUrl','Official award URL','url'],['intakeLabel','Intake (e.g. 2027 intake)'],['round','Round']];
 return <><Link to="/editor" className="underline">All drafts</Link><h1 className="mt-4">{record?'Edit opportunity':'Create a draft'}</h1><p className="my-4">Status: {record?.publicationStatus??'New draft'}. Saving changes resets review and makes this record private until republished. Save changes before using review or publication actions.</p>
 <form noValidate onSubmit={e=>{e.preventDefault();void save();}} className="space-y-6">
 <fieldset className="panel grid gap-4 sm:grid-cols-2"><legend className="font-semibold">Programme and intake</legend>{fields.map(([k,l,t])=>field(k,l,t))}
 <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isFictional} onChange={e=>setDraft({...draft,isFictional:e.target.checked})}/>Fictional example</label>
 <div><label htmlFor="applicationStatus">Application opening state</label><select id="applicationStatus" value={draft.applicationStatus} onChange={e=>setDraft({...draft,applicationStatus:e.target.value as Draft['applicationStatus']})}>{['Unknown','Announced','Open','Closed','Withdrawn'].map(x=><option key={x}>{x}</option>)}</select></div></fieldset>
 <fieldset className="panel space-y-4"><legend className="font-semibold">Deadlines</legend><p>Preserve the source wording. Date-only means no invented closing time or timezone.</p>
 {draft.deadlines.map((d,i)=><div key={i} className="grid gap-3 border-t pt-4 sm:grid-cols-2">
 <label>Deadline kind<select value={d.kind} onChange={e=>setDraft({...draft,deadlines:draft.deadlines.map((x,j)=>j===i?{...x,kind:e.target.value as typeof d.kind}:x)})}>{deadlineKinds.map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Precision<select value={d.precision} onChange={e=>setDraft({...draft,deadlines:draft.deadlines.map((x,j)=>j===i?{...x,precision:e.target.value as typeof d.precision,localDate:null,localTime:null,timeZone:null}:x)})}>{['Unknown','Date','DateTime'].map(x=><option key={x}>{x}</option>)}</select></label>
 <label className="sm:col-span-2">Original wording<textarea value={d.originalText} onChange={e=>setDraft({...draft,deadlines:draft.deadlines.map((x,j)=>j===i?{...x,originalText:e.target.value}:x)})}/></label>
 {d.precision!=='Unknown' && <label>Local date<Input type="date" value={d.localDate??''} onChange={e=>setDraft({...draft,deadlines:draft.deadlines.map((x,j)=>j===i?{...x,localDate:e.target.value||null}:x)})}/></label>}
 {d.precision==='DateTime' && <><label>Local time<Input type="time" value={d.localTime??''} onChange={e=>setDraft({...draft,deadlines:draft.deadlines.map((x,j)=>j===i?{...x,localTime:e.target.value?e.target.value+':00':null}:x)})}/></label><label>IANA timezone (blank if unknown)<Input value={d.timeZone??''} onChange={e=>setDraft({...draft,deadlines:draft.deadlines.map((x,j)=>j===i?{...x,timeZone:e.target.value||null}:x)})}/></label></>}
 <Button type="button" variant="outline" onClick={()=>setDraft({...draft,deadlines:draft.deadlines.filter((_,j)=>j!==i)})}>Remove deadline</Button></div>)}
 <Button type="button" variant="outline" disabled={draft.deadlines.length===4} onClick={()=>setDraft({...draft,deadlines:[...draft.deadlines,{kind:deadlineKinds.find(k=>!draft.deadlines.some(d=>d.kind===k))!,precision:'Unknown',originalText:'Not specified by the source.',localDate:null,localTime:null,timeZone:null}]})}>Add deadline</Button></fieldset>
 <fieldset className="panel space-y-4"><legend className="font-semibold">Funding breakdown</legend>{draft.funding.map((f,i)=><div key={f.kind} className="grid gap-3 border-t pt-4 sm:grid-cols-2"><label>{f.kind} coverage<select value={f.coverage} onChange={e=>setDraft({...draft,funding:draft.funding.map((x,j)=>j===i?{...x,coverage:e.target.value as typeof f.coverage,amount:null,currency:null}:x)})}>{['Unknown','Covered','NotCovered'].map(x=><option key={x}>{x}</option>)}</select></label><label>{f.kind} conditions<Input value={f.conditions??''} onChange={e=>setDraft({...draft,funding:draft.funding.map((x,j)=>j===i?{...x,conditions:e.target.value||null}:x)})}/></label>{f.coverage==='Covered'&&<><label>{f.kind} amount (optional)<Input type="number" min="0" step=".01" value={f.amount??''} onChange={e=>setDraft({...draft,funding:draft.funding.map((x,j)=>j===i?{...x,amount:e.target.value?Number(e.target.value):null}:x)})}/></label><label>{f.kind} currency<Input value={f.currency??''} onChange={e=>setDraft({...draft,funding:draft.funding.map((x,j)=>j===i?{...x,currency:e.target.value||null}:x)})}/></label></>}</div>)}</fieldset>
 <fieldset className="panel space-y-4"><legend className="font-semibold">Source evidence</legend><p>Overview evidence must identify the programme, award and intake. Every known deadline, funding claim and opening state needs its own evidence.</p>
 {draft.evidence.map((e,i)=><div key={i} className="space-y-3 border-t pt-4"><label>Evidence field<select value={e.field} onChange={event=>setDraft({...draft,evidence:draft.evidence.map((x,j)=>j===i?{...x,field:event.target.value}:x)})}>{['overview','opening',...deadlineKinds.map(x=>'deadline.'+x),...fundingKinds.map(x=>'funding.'+x)].map(x=><option key={x}>{x}</option>)}</select></label><label>Official source URL<Input type="url" value={e.sourceUrl} onChange={event=>setDraft({...draft,evidence:draft.evidence.map((x,j)=>j===i?{...x,sourceUrl:event.target.value}:x)})}/></label><label>Short source excerpt<textarea value={e.excerpt} onChange={event=>setDraft({...draft,evidence:draft.evidence.map((x,j)=>j===i?{...x,excerpt:event.target.value}:x)})}/></label><Button type="button" variant="outline" onClick={()=>setDraft({...draft,evidence:draft.evidence.filter((_,j)=>j!==i)})}>Remove evidence</Button></div>)}
 <Button type="button" variant="outline" onClick={()=>setDraft({...draft,evidence:[...draft.evidence,{field:'overview',sourceUrl:'',excerpt:''}]})}>Add evidence</Button></fieldset>
 {error && <p ref={errorRef} tabIndex={-1} role="alert" className="notice border-red-300 text-red-800">{error}</p>}
 <div className="flex flex-wrap gap-3"><Button disabled={busy}>Save draft</Button>{record && ['Draft','InReview','Reviewed','Published'].includes(record.publicationStatus) && <Button type="button" variant="outline" disabled={busy || JSON.stringify(draft)!==JSON.stringify(initial)} onClick={()=>void save(({Draft:'submit',InReview:'review',Reviewed:'publish',Published:'archive'} as Record<string,string>)[record.publicationStatus])}>{{Draft:'Submit for review',InReview:'Approve evidence review',Reviewed:'Publish',Published:'Archive'}[record.publicationStatus as 'Draft']}</Button>}
 <Button type="button" variant="outline" onClick={()=>window.location.reload()}>Reload saved version</Button></div></form>
 {record && <section className="panel mt-8"><h2>Audit history</h2>{audit.data?.map((a,i)=><p className="mt-2 text-sm" key={i}>{new Date(a.at).toLocaleString()} · {a.action} → {a.newStatus}{a.changedFields && ' · '+a.changedFields}</p>)}</section>}
 </>;
}





