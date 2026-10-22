import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

type Opportunity = {
  id: string;
  title: string;
  institutionName: string;
  intakeLabel: string;
  isFictional: boolean;
};

function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    async function load() {
      try {
        const response = await fetch('/api/v1/opportunities', { signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        const items = (await response.json()) as Opportunity[];
        setOpportunities(items);
        setStatus('ready');
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      }
    }

    void load();
    return () => controller.abort();
  }, [attempt]);

  return (
    <main>
      <h1>Scholarship Assistant</h1>
      <p className="intro">First database-backed listing</p>
      {status === 'loading' && <p role="status">Loading opportunities…</p>}
      {status === 'error' && (
        <div role="alert">
          <p>Could not load opportunities. Check that the API and database are running.</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
        </div>
      )}
      {status === 'ready' && opportunities.length === 0 && <p>No opportunities are available yet.</p>}
      {status === 'ready' && opportunities.map((opportunity) => (
        <article key={opportunity.id} className="opportunity">
          {opportunity.isFictional && <span className="badge">Fictional demo</span>}
          <h2>{opportunity.title}</h2>
          <p>{opportunity.institutionName}</p>
          <p>{opportunity.intakeLabel}</p>
        </article>
      ))}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
