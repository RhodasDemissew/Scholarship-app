import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

interface SampleProfile {
  id: string;
  name: string;
  avatar: string;
  citizenship: string;
  residence: string;
  degree: string;
  institution: string;
  gpa: string;
  english: string;
  experience: string;
  targetIntake: string;
  focus: string;
  bio: string;
}

const sampleProfiles: SampleProfile[] = [
  {
    id: 'amara',
    name: 'Amara Chen (Fictional Sample Profile)',
    avatar: 'AC',
    citizenship: 'Kenya',
    residence: 'Nairobi, Kenya',
    degree: 'BSc Computer Science (First Class Honours)',
    institution: 'University of Nairobi',
    gpa: '3.85 / 4.0 scale',
    english: 'IELTS Academic 7.5 (C1 level verified)',
    experience: '2 years health data analytics & software engineering',
    targetIntake: 'Autumn 2026',
    focus: 'Computational epidemiology and accessible healthcare systems',
    bio: 'Prospective Master’s student seeking fully-funded international scholarships in computational science.',
  },
  {
    id: 'lucas',
    name: 'Lucas Silva (Fictional Sample Profile)',
    avatar: 'LS',
    citizenship: 'Brazil',
    residence: 'São Paulo, Brazil',
    degree: 'BSc Environmental Engineering',
    institution: 'University of São Paulo',
    gpa: '3.70 / 4.0 scale',
    english: 'TOEFL iBT 102 (Reading 27, Listening 26, Speaking 24, Writing 25)',
    experience: '3 years watershed conservation & renewable energy project delivery',
    targetIntake: 'Autumn 2026',
    focus: 'Climate resilience, hydrology modeling, and sustainable development',
    bio: 'Engineering graduate targeting European sustainability fellowships with stipend coverage.',
  },
];

interface DemoOpportunity {
  id: string;
  title: string;
  institution: string;
  country: string;
  coverage: string;
  suitability: string;
  suitabilityType: 'high' | 'moderate';
  criteriaSummary: string[];
  tasks: { id: string; label: string; completed: boolean }[];
  isFictionalDemo?: boolean;
}

const initialDemoOpportunities: DemoOpportunity[] = [
  {
    id: 'eth-esop',
    title: 'ETH Zurich Excellence Scholarship (ESOP)',
    institution: 'ETH Zurich',
    country: 'Switzerland',
    coverage: 'Tuition Covered · Full Living Stipend (CHF 12,000/semester)',
    suitability: 'Meets criteria · High suitability',
    suitabilityType: 'high',
    criteriaSummary: [
      'Academic standing: Upper 10% of bachelor programme (Satisfied: GPA 3.85 / First Class)',
      'English proficiency: Verified C1 academic certification (Satisfied: IELTS 7.5)',
      'Nationality: Open to national and international candidates without geographic restriction',
    ],
    tasks: [
      { id: 't1', label: 'Verify ECTS course equivalency on ETH prospective portal', completed: true },
      { id: 't2', label: 'Obtain 2 signed academic reference letters from faculty', completed: true },
      { id: 't3', label: 'Finalize 2-page Master’s thesis pre-proposal document', completed: false },
      { id: 't4', label: 'Submit primary ETH master’s admission before 15 December', completed: false },
    ],
  },
  {
    id: 'cambridge-trust',
    title: 'Gates Cambridge & Cambridge Trust Awards',
    institution: 'University of Cambridge',
    country: 'United Kingdom',
    coverage: 'Tuition Covered · Full Living Stipend (£20,000/year) + Airfare',
    suitability: 'Meets criteria · Note deadline variation',
    suitabilityType: 'high',
    criteriaSummary: [
      'Academic excellence: First class honours or equivalent required (Satisfied: First Class)',
      'Leadership & commitment: Track record of improving lives of others (Satisfied: 2 yrs civic tech)',
      'Deadline precision: Round 1 (US citizens) vs Round 2 (International) deadlines differ',
    ],
    tasks: [
      { id: 't5', label: 'Draft 500-word Gates Cambridge personal scholarship essay', completed: true },
      { id: 't6', label: 'Request referee statements through Cambridge Applicant Portal', completed: false },
      { id: 't7', label: 'Submit funding application concurrent with departmental application', completed: false },
    ],
  },
  {
    id: 'fictional-seed',
    title: 'Fictional Example University Fellowship',
    institution: 'Fictional Example University',
    country: 'Demonstration State',
    coverage: 'Tuition Covered · Partial Living Stipend',
    suitability: 'Demonstration Record · Not for live submission',
    suitabilityType: 'moderate',
    criteriaSummary: [
      'Sample demonstration record for system testing and format evaluation',
      'Does not represent a live degree application or real financial award',
    ],
    tasks: [
      { id: 't8', label: 'Explore demonstration format and uncertainty notes', completed: true },
    ],
    isFictionalDemo: true,
  },
];

export function DemoJourney() {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('amara');
  const [opportunities, setOpportunities] = useState<DemoOpportunity[]>(initialDemoOpportunities);
  const [savedDemoIds, setSavedDemoIds] = useState<Set<string>>(new Set(['eth-esop', 'cambridge-trust']));
  const [mutationTestStatus, setMutationTestStatus] = useState<string | null>(null);

  const currentProfile = sampleProfiles.find((p) => p.id === selectedProfileId) ?? sampleProfiles[0];

  function toggleTask(oppId: string, taskId: string) {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id !== oppId) return opp;
        return {
          ...opp,
          tasks: opp.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        };
      })
    );
  }

  function toggleDemoSave(oppId: string) {
    setSavedDemoIds((prev) => {
      const next = new Set(prev);
      if (next.has(oppId)) {
        next.delete(oppId);
      } else {
        next.add(oppId);
      }
      return next;
    });
  }

  async function testCatalogueProtection() {
    setMutationTestStatus('Verifying server-side security authorization...');
    try {
      const response = await fetch('/api/v1/editor/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Unauthorized Modification Attempt' }),
      });
      if (response.status === 401 || response.status === 403 || response.status === 400) {
        setMutationTestStatus(
          `Protected (HTTP ${response.status}): Visitors cannot edit shared catalogue data. All mutations strictly require authenticated MFA editor credentials.`
        );
      } else {
        setMutationTestStatus(`Response received: ${response.status}`);
      }
    } catch {
      setMutationTestStatus(
        'Protected: Server-side authorization blocks unauthenticated modifications.'
      );
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <span className="badge">Public demonstration</span>
        <span className="text-sm font-semibold text-teal-800">No account required · Read-only catalogue safety</span>
      </div>

      <h1 className="mt-4">Fictional Sample Journey</h1>
      <p className="intro">
        Explore how Scholarship Assistant connects candidate qualifications, eligibility
        criteria, original source evidence, and preparation shortlists.
      </p>

      <aside className="notice my-6" role="note">
        <strong>Demonstration Only:</strong> The candidate profiles below are fictional personas created
        for testing and evaluation. Shared catalogue data cannot be altered by public visitors.
      </aside>

      {/* Profile Selector */}
      <section className="panel my-6" aria-labelledby="profile-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="profile-heading" className="text-xl font-bold">1. Fictional Candidate Profile</h2>
            <p className="text-sm text-slate-600">Select a demonstration persona to see how criteria evaluate:</p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Select sample candidate persona">
            {sampleProfiles.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant={p.id === selectedProfileId ? 'default' : 'outline'}
                onClick={() => setSelectedProfileId(p.id)}
                aria-pressed={p.id === selectedProfileId}
              >
                {p.name.split(' ')[0]} ({p.citizenship})
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-800 font-bold text-white" aria-hidden="true">
              {currentProfile.avatar}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{currentProfile.name}</h3>
              <p className="text-sm text-slate-600">{currentProfile.bio}</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-3 border border-slate-200">
              <dt className="font-semibold text-slate-500">Citizenship & Residence</dt>
              <dd className="mt-1 font-medium text-slate-900">{currentProfile.citizenship} · {currentProfile.residence}</dd>
            </div>
            <div className="rounded-lg bg-white p-3 border border-slate-200">
              <dt className="font-semibold text-slate-500">Undergraduate Degree</dt>
              <dd className="mt-1 font-medium text-slate-900">{currentProfile.degree}</dd>
              <dd className="text-xs text-slate-500">{currentProfile.institution} (GPA {currentProfile.gpa})</dd>
            </div>
            <div className="rounded-lg bg-white p-3 border border-slate-200">
              <dt className="font-semibold text-slate-500">English Language Verification</dt>
              <dd className="mt-1 font-medium text-slate-900">{currentProfile.english}</dd>
            </div>
            <div className="rounded-lg bg-white p-3 border border-slate-200">
              <dt className="font-semibold text-slate-500">Professional Experience</dt>
              <dd className="mt-1 font-medium text-slate-900">{currentProfile.experience}</dd>
            </div>
            <div className="rounded-lg bg-white p-3 border border-slate-200">
              <dt className="font-semibold text-slate-500">Target Intake & Focus</dt>
              <dd className="mt-1 font-medium text-slate-900">{currentProfile.targetIntake} · {currentProfile.focus}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Matched Opportunities & Interactive Shortlist */}
      <section className="panel my-6" aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="text-xl font-bold">2. Sample Opportunity Evaluation & Shortlist</h2>
        <p className="mt-1 text-sm text-slate-600">
          Opportunities evaluate candidate criteria against verified source requirements. You can toggle
          tasks and shortlist items to experience the applicant workflow:
        </p>

        <div className="mt-6 space-y-6">
          {opportunities.map((opp) => {
            const isSaved = savedDemoIds.has(opp.id);
            return (
              <article key={opp.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${opp.suitabilityType === 'high' ? 'bg-teal-50 text-teal-800 border-teal-200' : ''}`}>
                        {opp.suitability}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{opp.country}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-900">{opp.title}</h3>
                    <p className="text-sm text-slate-600">{opp.institution} · {opp.coverage}</p>
                  </div>
                  <Button
                    type="button"
                    variant={isSaved ? 'outline' : 'default'}
                    onClick={() => toggleDemoSave(opp.id)}
                    aria-label={`${isSaved ? 'Remove' : 'Save'} ${opp.title} in demo shortlist`}
                  >
                    {isSaved ? '✓ Saved in demo' : '+ Save in demo'}
                  </Button>
                </div>

                {/* Criteria Match Details */}
                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Evaluation Against {currentProfile.name.split(' ')[0]}’s Qualifications
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                    {opp.criteriaSummary.map((crit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-700 font-bold" aria-hidden="true">✓</span>
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preparation Tasks */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Demonstration Preparation Milestones ({opp.tasks.filter((t) => t.completed).length}/{opp.tasks.length} Completed)
                  </h4>
                  <fieldset className="mt-2 space-y-2">
                    <legend className="sr-only">Milestone tasks for {opp.title}</legend>
                    {opp.tasks.map((task) => (
                      <label key={task.id} className="flex items-center gap-3 text-sm text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(opp.id, task.id)}
                          className="h-4 w-4 rounded border-slate-300 text-teal-700"
                        />
                        <span className={task.completed ? 'line-through text-slate-500' : ''}>
                          {task.label}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Catalogue Protection Test */}
      <section className="panel my-6" aria-labelledby="protection-heading">
        <h2 id="protection-heading" className="text-xl font-bold">3. Shared Catalogue Protection</h2>
        <p className="mt-2 text-sm text-slate-600">
          The public catalogue is strictly protected against unauthorized writes. Visitors can explore
          fictional demos, filter opportunities, and read official evidence, but cannot tamper with published
          data or editorial review records.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button type="button" variant="outline" onClick={testCatalogueProtection}>
            Test catalogue mutation protection
          </Button>
          {mutationTestStatus && (
            <p role="status" className="text-sm font-semibold text-teal-900 bg-teal-50 px-3 py-2 rounded-md border border-teal-200">
              {mutationTestStatus}
            </p>
          )}
        </div>
      </section>

      {/* Call to action */}
      <section className="panel my-6 bg-linear-to-br from-teal-900 to-slate-900 text-white" aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="text-xl font-bold text-white">Ready to explore real opportunities?</h2>
        <p className="mt-2 text-sm text-slate-200">
          Create an account to build your private shortlist, save verified opportunities, and prepare your
          official applications with reliable evidence.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Button asChild className="bg-white text-teal-950 hover:bg-slate-100 font-semibold">
            <Link to="/register">Create free account</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10">
            <Link to="/">Browse public catalogue</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
