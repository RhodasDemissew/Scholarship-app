import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, NavLink, Link, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOpportunities } from '@/lib/api';
import './style.css';
const searchSchema = z.object({ search: z.string().trim().max(80, 'Use 80 characters or fewer.') });
const queryClient = new QueryClient();
function Opportunities() {
 const query = useOpportunities();
 const [search, setSearch] = useState('');
 const form = useForm<z.infer<typeof searchSchema>>({ resolver: zodResolver(searchSchema), defaultValues: { search: '' } });
 const items = query.data?.filter(item => [item.title, item.institutionName, item.intakeLabel].join(' ').toLowerCase().includes(search.toLowerCase())) ?? [];
 return <>
  <p className="eyebrow">A place to begin</p><h1>Find your next opportunity.</h1>
  <p className="intro">Explore the first sample listing as we build your scholarship companion.</p>
  <aside className="notice">This is a local preview. All listings are fictional examples, not scholarships you can apply for.</aside>
  <form className="panel my-6" noValidate onSubmit={form.handleSubmit(values => setSearch(values.search))}>
   <label htmlFor="search" className="mb-2 block font-semibold">Search sample opportunities</label>
   <div className="flex flex-col gap-3 sm:flex-row">
    <Input id="search" placeholder="Title, institution or intake" {...form.register('search')} aria-invalid={!!form.formState.errors.search} aria-describedby={form.formState.errors.search ? 'search-error' : 'search-hint'} />
    <Button type="submit">Search</Button><Button type="button" variant="outline" onClick={() => { form.reset(); setSearch(''); }}>Clear</Button>
   </div>
   <p id="search-hint" className="mt-2 text-sm text-slate-600">Search the loaded samples. Leave blank to see all.</p>
   {form.formState.errors.search && <p id="search-error" role="alert" className="mt-2 text-red-700">{form.formState.errors.search.message}</p>}
  </form>
  {query.isPending && <p role="status">Loading opportunities...</p>}
  {query.isError && <div role="alert" className="panel border-red-200"><h2>We couldn't load opportunities</h2><p className="my-3">Check that the API and database are running, then try again.</p><Button onClick={() => void query.refetch()} disabled={query.isFetching}>{query.isFetching ? 'Retrying...' : 'Try again'}</Button></div>}
  {!query.isPending && !query.isError && <>
   <p role="status" className="mb-4 text-sm text-slate-600">{items.length} {items.length === 1 ? 'opportunity' : 'opportunities'}{search && ' matching “' + search + '”'}</p>
   {items.length === 0 && <div className="panel"><h2>{query.data?.length ? 'No matching opportunities' : 'No opportunities are available yet'}</h2><p className="mt-2 text-slate-600">{query.data?.length ? 'Try another search or clear the form.' : 'Please check back later.'}</p></div>}
   {items.map(item => <article key={item.id} className="panel mb-4"><span className="badge">{item.isFictional ? 'Fictional demo' : 'Opportunity'}</span><h2 className="mt-4">{item.title}</h2><p className="mt-2 text-slate-600">{item.institutionName}</p><p className="mt-4 border-t border-slate-100 pt-4 text-sm">Intake · {item.intakeLabel}</p></article>)}
  </>}
 </>;
}
function App() {
 return <><a className="skip-link" href="#main">Skip to content</a><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5"><Link to="/" className="font-bold text-teal-900">Scholarship Assistant</Link><nav aria-label="Main navigation" className="flex gap-5 text-sm"><NavLink to="/" end>Opportunities</NavLink><NavLink to="/about">About this preview</NavLink></nav></div></header><main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-6 py-12"><Routes>
 <Route path="/" element={<Opportunities />} />
 <Route path="/about" element={<><p className="eyebrow">Small steps, solid foundations</p><h1>Your scholarship companion, in progress.</h1><div className="panel mt-6 space-y-4"><p>This preview lets you browse and search a fictional listing. Nothing entered in the search form is saved.</p><p>Real opportunities, accounts and application tracking will arrive in later milestones.</p><Button asChild><Link to="/">Explore the sample</Link></Button></div></>} />
 <Route path="*" element={<><h1>Page not found</h1><p className="my-5">This page isn't part of the preview.</p><Button asChild><Link to="/">Back to opportunities</Link></Button></>} />
 </Routes></main><footer className="mx-auto max-w-3xl px-6 pb-8 text-sm text-slate-500">Local preview · Fictional data only</footer></>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><QueryClientProvider client={queryClient}><BrowserRouter><App /></BrowserRouter></QueryClientProvider></StrictMode>);
