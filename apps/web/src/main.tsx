import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, NavLink, Link, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Account, useSession } from './auth';
import { SecuritySettings } from './security';
import { Editor } from './editor';
import { Explorer, OpportunityDetail } from './catalogue';
import './style.css';
const queryClient=new QueryClient();
function App() {
 const session=useSession();
 return <><a className="skip-link" href="#main">Skip to content</a><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5"><Link to="/" className="font-bold text-teal-900">Scholarship Assistant</Link><nav aria-label="Main navigation" className="flex flex-wrap gap-5 text-sm"><NavLink to="/" end>Opportunities</NavLink><NavLink to="/about">About</NavLink><NavLink to="/account">Account</NavLink>{session.data?.roles.some(x=>['Editor','Administrator'].includes(x))&&<NavLink to="/editor">Editor workspace</NavLink>}</nav></div></header><main id="main" tabIndex={-1} className="mx-auto max-w-4xl px-6 py-12"><Routes>
 <Route path="/" element={<Explorer/>}/><Route path="/opportunities/:id" element={<OpportunityDetail/>}/>
 <Route path="/security" element={<SecuritySettings/>}/><Route path="/editor" element={<Editor/>}/><Route path="/editor/:id" element={<Editor/>}/>
 {['register','login','verify','forgot','reset','account','resend'].map(path=><Route key={path} path={'/'+path} element={<Account key={path}/>}/>)}
 <Route path="/about" element={<><p className="eyebrow">Preparation starts with reliable information</p><h1>Your scholarship companion.</h1><div className="panel mt-6 space-y-4"><p>Explore reviewed programme and funding records with original deadline wording and source evidence. Unknown facts remain visible.</p><p>Scholarship Assistant is independent of the providers. Applications are submitted on official portals. A listing does not guarantee eligibility, admission or funding.</p><p>Matching, application plans and reminders are later milestones.</p><Button asChild><Link to="/">Explore opportunities</Link></Button></div></>}/>
 <Route path="*" element={<><h1>Page not found</h1><p className="my-5">This page isn't available.</p><Button asChild><Link to="/">Back to opportunities</Link></Button></>}/>
 </Routes></main><footer className="mx-auto max-w-4xl px-6 pb-8 text-sm text-slate-500">Local development · Confirm details with the official provider</footer></>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><QueryClientProvider client={queryClient}><BrowserRouter><App/></BrowserRouter></QueryClientProvider></StrictMode>);

