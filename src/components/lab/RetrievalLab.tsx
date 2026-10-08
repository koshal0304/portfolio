import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Ban, CheckCircle, Cpu, Quote, Search, ShieldCheck } from 'lucide-react';
import { inspect, synthesize, type AnswerSentence, type Retrieval, type Section, type Verdict } from '../../lib/retrieval';
import { getIndex } from '../../data/knowledge';
import SafeBoundary from '../SafeBoundary';

const EmbeddingSpace3D = lazy(() => import('./EmbeddingSpace3D'));

const SECTION_STYLE: Record<Section, { color: string; label: string }> = {
  experience: { color: '#38bdf8', label: 'Experience' },
  project: { color: '#a78bfa', label: 'Projects' },
  skills: { color: '#34d399', label: 'Skills' },
  impact: { color: '#f472b6', label: 'Impact' },
  profile: { color: '#fbbf24', label: 'Profile' },
};

const SUGGESTIONS = [
  'How did he improve RAG recall?',
  'What has he built with LangGraph?',
  'Computer vision experience',
  'How does he secure NL-to-SQL?',
  'Why should we hire him?',
];

interface Run {
  query: string;
  verdict: Verdict;
  retrieval?: Retrieval;
  answer: AnswerSentence[];
}

interface RetrievalLabProps {
  /** Externally requested query (e.g. from the command palette); `n` makes repeats re-run. */
  seed?: { q: string; n: number } | null;
}

const fmt = (ms: number) => (ms < 0.1 ? '<0.1 ms' : `${ms.toFixed(1)} ms`);

const RetrievalLab: React.FC<RetrievalLabProps> = ({ seed }) => {
  const index = getIndex();
  const [input, setInput] = useState('');
  const [run, setRun] = useState<Run | null>(null);
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const ask = (query: string) => {
    const q = query.trim().slice(0, 300);
    if (!q) return;
    // Input guardrail runs before retrieval, like the production agent boundary.
    const verdict = inspect(q);
    if (verdict.blocked) return setRun({ query: q, verdict, answer: [] });
    const retrieval = index.search(q, 5);
    setRun({ query: q, verdict, retrieval, answer: synthesize(retrieval) });
  };

  useEffect(() => {
    ask(seed?.q ?? SUGGESTIONS[0]);
    if (seed) setInput(seed.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when a new seed arrives
  }, [seed]);

  const points = useMemo(
    () =>
      index.chunks.map((c, i) => ({ pos: index.coords[i], color: SECTION_STYLE[c.section].color, label: c.title })),
    [index]
  );
  const hits = run?.retrieval?.hits ?? [];
  const topScore = hits[0]?.score || 1;

  return (
    <div className="p-5 md:p-7 flex flex-col gap-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2"
      >
        <label htmlFor="rag-query" className="sr-only">
          Ask about Koshal's experience
        </label>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="rag-query"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
            placeholder="Ask anything about my work, e.g. “vector search in production”"
            className="w-full rounded-xl bg-[#07090e]/70 border border-white/10 pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400/60 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-medium text-sm flex items-center gap-2 hover:opacity-95 transition-opacity cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.2)]"
        >
          <Cpu className="w-4 h-4" />
          <span className="hidden sm:inline">Retrieve</span>
        </button>
      </form>

      <div className="flex flex-wrap gap-2 -mt-1">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setInput(s);
              ask(s);
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-mono border transition-all cursor-pointer ${
              run?.query === s
                ? 'bg-sky-500/15 border-sky-400/50 text-sky-200'
                : 'bg-[#07090e]/60 border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Answer + evidence */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-w-0">
          <div className="rounded-xl bg-[#07090e]/70 border border-white/[0.08] p-4" aria-live="polite">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 font-mono text-[11px] uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Quote className="w-3.5 h-3.5 text-sky-400" /> Grounded answer
              </span>
              {run?.verdict.blocked ? (
                <span className="flex items-center gap-1 text-rose-300">
                  <Ban className="w-3 h-3" /> Blocked
                </span>
              ) : run && run.answer.length === 0 ? (
                <span className="text-amber-300">No evidence</span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="w-3 h-3" /> {run?.answer.length ?? 0} citations
                </span>
              )}
            </div>

            {run?.verdict.blocked ? (
              <p className="text-sm text-rose-200 leading-relaxed">
                The input guardrail stopped this before retrieval:{' '}
                <span className="font-mono text-rose-300">{run.verdict.findings.map((f) => f.label).join(', ')}</span>.
                Try the Defense Sandbox tab to see the full audit.
              </p>
            ) : run && run.answer.length === 0 ? (
              <p className="text-sm text-slate-300 leading-relaxed">
                Nothing in the index supports an answer to “{run.query}”. This engine refuses rather than guesses.
                Every sentence it returns exists verbatim in a cited source.
              </p>
            ) : (
              <motion.p
                key={run?.query}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm md:text-[15px] text-slate-200 leading-relaxed"
              >
                {run?.answer.map((s, i) => (
                  <span key={i}>
                    {s.text}
                    <sup className="font-mono text-[10px] text-sky-300 ml-0.5 mr-1">[{s.cite}]</sup>
                  </span>
                ))}
              </motion.p>
            )}
          </div>

          {hits.length > 0 && (
            <ol className="flex flex-col gap-2">
              {hits.map((h, i) => (
                <li key={h.chunk.id}>
                  <a
                    href={h.chunk.href}
                    className="group block rounded-xl bg-[#07090e]/50 border border-white/[0.06] hover:border-sky-400/30 px-3.5 py-2.5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[11px] text-sky-300 w-5 shrink-0">[{i + 1}]</span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: SECTION_STYLE[h.chunk.section].color }}
                      />
                      <span className="text-sm text-slate-100 truncate flex-1">{h.chunk.title}</span>
                      <span className="font-mono text-[11px] text-slate-300 tabular-nums">{h.score.toFixed(2)}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-300 shrink-0" />
                    </div>
                    <div className="mt-2 ml-7 h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(h.score / topScore) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.06 }}
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-400"
                      />
                    </div>
                    <div className="mt-1.5 ml-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-slate-500">
                      <span>BM25 {h.bm25.toFixed(2)}</span>
                      <span>cos {h.cosine.toFixed(2)}</span>
                      {h.chunk.meta && <span className="truncate max-w-[16rem]">{h.chunk.meta}</span>}
                      <span className="text-slate-400">matched: {h.matched.join(', ')}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Vector space + trace */}
        <div className="lg:col-span-2 flex flex-col gap-3 min-w-0">
          <div className="relative h-64 md:h-72 rounded-xl overflow-hidden bg-[#07090e]/70 border border-white/[0.08]">
            <span className="absolute top-2.5 left-3 z-10 font-mono text-[10px] uppercase tracking-wider text-slate-400 pointer-events-none">
              PCA(3) of the live TF-IDF index
            </span>
            <SafeBoundary>
              <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-white/[0.02]" />}>
                <EmbeddingSpace3D
                  points={points}
                  query={run?.retrieval?.queryCoord ?? null}
                  hits={hits.map((h) => h.index)}
                  reducedMotion={reducedMotion}
                />
              </Suspense>
            </SafeBoundary>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-slate-400">
            {Object.values(SECTION_STYLE).map((s) => (
              <span key={s.label} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" /> Your query
            </span>
          </div>

          {run && (
            <ol className="rounded-xl bg-[#07090e]/70 border border-white/[0.08] p-3.5 font-mono text-[11px] flex flex-col gap-1.5">
              <li className="flex justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className={`w-3.5 h-3.5 ${run.verdict.blocked ? 'text-rose-400' : 'text-emerald-400'}`} />
                  Input guardrail
                </span>
                <span className={run.verdict.blocked ? 'text-rose-300' : 'text-emerald-300'}>
                  {run.verdict.blocked ? 'block' : 'pass'} · risk {run.verdict.risk.toFixed(2)}
                </span>
              </li>
              {run.retrieval && (
                <>
                  <li className="flex justify-between gap-3 text-slate-400">
                    <span>Tokenize + expand</span>
                    <span className="text-slate-300 truncate">{run.retrieval.terms.join(' ') || '∅'}</span>
                  </li>
                  <li className="flex justify-between gap-3 text-slate-400">
                    <span>BM25 ⊕ cosine (α 0.6)</span>
                    <span className="text-slate-300">
                      {index.chunks.length} chunks · {index.vocab.size} terms
                    </span>
                  </li>
                  <li className="flex justify-between gap-3 text-slate-400">
                    <span>Retrieve + rank</span>
                    <span className="text-sky-300">{fmt(run.retrieval.ms)}</span>
                  </li>
                </>
              )}
            </ol>
          )}
        </div>
      </div>

      <p className="font-mono text-[10px] text-slate-500 leading-relaxed">
        Not a mock: this is a working hybrid retriever (BM25 + TF‑IDF cosine) with PCA computed by power iteration,
        running entirely in your browser. No API calls, no canned answers. Answers are extractive and cited, so it
        cannot hallucinate.
      </p>
    </div>
  );
};

export default RetrievalLab;
