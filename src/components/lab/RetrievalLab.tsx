import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Ban, CheckCircle, Cpu, Quote, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { inspect, synthesize, type AnswerSentence, type Retrieval, type Section, type Verdict } from '../../lib/retrieval';
import { getIndex } from '../../data/knowledge';
import SafeBoundary from '../SafeBoundary';
import { Magnetic3D, ScrambleText, SlotRollText } from '../KineticText';
import { EASE } from '../../lib/kineticPresets';

const EmbeddingSpace3D = lazy(() => import('./EmbeddingSpace3D'));

const SECTION_STYLE: Record<Section, { color: string; label: string }> = {
  experience: { color: '#f4b678', label: 'Experience' },
  project: { color: '#a5b4fc', label: 'Projects' },
  skills: { color: '#7ee0c0', label: 'Skills' },
  impact: { color: '#f5a3b7', label: 'Impact' },
  profile: { color: '#e9edf5', label: 'Profile' },
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

const cardTilt = (e: React.PointerEvent<HTMLElement>) => {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--cty', `${((e.clientX - r.left) / r.width - 0.5) * 4.5}deg`);
  el.style.setProperty('--ctx', `${-((e.clientY - r.top) / r.height - 0.5) * 4.5}deg`);
};

const cardUntilt = (e: React.PointerEvent<HTMLElement>) => {
  e.currentTarget.style.setProperty('--ctx', '0deg');
  e.currentTarget.style.setProperty('--cty', '0deg');
};

const RetrievalLab: React.FC<RetrievalLabProps> = ({ seed }) => {
  const index = getIndex();
  const [input, setInput] = useState('');
  const [run, setRun] = useState<Run | null>(null);
  const [activeHit, setActiveHit] = useState<number | null>(null);
  const [queryNonce, setQueryNonce] = useState(0);
  const reduce = useReducedMotion();

  const ask = (query: string) => {
    const q = query.trim().slice(0, 300);
    if (!q) return;
    setQueryNonce((n) => n + 1);
    setActiveHit(null);
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
  const qCoord = run?.retrieval?.queryCoord ?? null;

  return (
    <div className="flex flex-col gap-5 p-5 md:p-7">
      {/* Holographic Query Command Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="group/form relative flex items-center gap-2.5"
      >
        <label htmlFor="rag-query" className="sr-only">
          Ask about Koshal's experience
        </label>
        <div className="relative flex-1 overflow-hidden rounded-xl border border-white/15 bg-deep/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 focus-within:border-accent-300/65 focus-within:shadow-[0_0_24px_-8px_rgba(244,182,120,0.45)]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/form:text-accent-300" />
          <input
            id="rag-query"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
            placeholder="Ask anything about my work, e.g. “vector search in production”"
            className="w-full bg-transparent py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-300/70 to-transparent opacity-0 transition-opacity duration-300 group-focus-within/form:opacity-100"
          />
        </div>
        <Magnetic3D strength={0.18} tilt={5}>
          <button
            type="submit"
            className="slot-roll-trigger btn btn-primary !rounded-xl !px-5 !py-3.5 text-sm"
          >
            <Cpu className="h-4 w-4" />
            <SlotRollText text="Retrieve" className="hidden sm:inline-flex" accentClassName="text-deep" />
          </button>
        </Magnetic3D>
      </form>

      {/* Kinetic Suggestion Probes */}
      <div className="flex flex-wrap gap-2 -mt-1">
        {SUGGESTIONS.map((s) => {
          const selected = run?.query === s;
          return (
            <motion.button
              key={s}
              type="button"
              whileHover={reduce ? undefined : { y: -1.5 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              onClick={() => {
                setInput(s);
                ask(s);
              }}
              className={`relative cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[11px] transition-all duration-300 ${
                selected
                  ? 'border-accent-300/55 bg-accent-400/15 text-accent-200 shadow-[0_0_18px_-6px_rgba(244,182,120,0.55)]'
                  : 'border-white/10 bg-deep/60 text-slate-400 hover:border-white/25 hover:bg-white/[0.06] hover:text-slate-100'
              }`}
            >
              {s}
            </motion.button>
          );
        })}
      </div>

      {/* Main Split Workspace: Answer + Ranked Evidence | 3D Orbital Vector Observatory */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Answer + Evidence Cards */}
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          <div
            className="spotlight relative overflow-hidden rounded-2xl border border-white/[0.1] bg-deep/70 p-4 md:p-5"
            aria-live="polite"
          >
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.07] pb-2.5 font-mono text-[11px] uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Quote className="h-3.5 w-3.5 text-accent-400" />
                <ScrambleText text="Grounded Synthesis" trigger={queryNonce > 0} durationMs={480} />
              </span>
              {run?.verdict.blocked ? (
                <span className="flex items-center gap-1.5 rounded-full border border-rose-400/35 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-300">
                  <Ban className="h-3 w-3" /> Blocked
                </span>
              ) : run && run.answer.length === 0 ? (
                <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
                  No evidence
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                  <CheckCircle className="h-3 w-3" /> {run?.answer.length ?? 0} verified citations
                </span>
              )}
            </div>

            {run?.verdict.blocked ? (
              <p className="text-sm leading-relaxed text-rose-200">
                The input guardrail stopped this before retrieval:{' '}
                <span className="font-mono text-rose-300">{run.verdict.findings.map((f) => f.label).join(', ')}</span>.
                Try the Defense Sandbox tab to see the full audit.
              </p>
            ) : run && run.answer.length === 0 ? (
              <p className="text-sm leading-relaxed text-slate-300">
                Nothing in the index supports an answer to “{run.query}”. This engine refuses rather than guesses.
                Every sentence it returns exists verbatim in a cited source.
              </p>
            ) : (
              <motion.p
                key={`${run?.query}-${queryNonce}`}
                initial={reduce ? undefined : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="text-sm leading-relaxed text-slate-200 md:text-[15px]"
              >
                {run?.answer.map((s, i) => (
                  <motion.span
                    key={i}
                    initial={reduce ? undefined : { opacity: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.45, delay: i * 0.08, ease: EASE }}
                  >
                    {s.text}
                    <sup className="ml-0.5 mr-1.5 inline-flex items-center rounded bg-accent-400/15 px-1 py-0.5 font-mono text-[9.5px] text-accent-200">
                      [{s.cite}]
                    </sup>
                  </motion.span>
                ))}
              </motion.p>
            )}
          </div>

          {hits.length > 0 && (
            <ol className="flex flex-col gap-2.5 [perspective:900px]">
              {hits.map((h, i) => {
                const isLinked = activeHit === h.index;
                const dotColor = SECTION_STYLE[h.chunk.section].color;
                return (
                  <motion.li
                    key={`${h.chunk.id}-${queryNonce}`}
                    initial={reduce ? undefined : { opacity: 0, x: -14, rotateX: -12 }}
                    animate={{ opacity: 1, x: 0, rotateX: 0 }}
                    transition={{ duration: 0.48, delay: i * 0.055, ease: EASE }}
                  >
                    <a
                      href={h.chunk.href}
                      onPointerEnter={() => setActiveHit(h.index)}
                      onPointerLeave={(e) => {
                        setActiveHit((cur) => (cur === h.index ? null : cur));
                        cardUntilt(e);
                      }}
                      onPointerMove={reduce ? undefined : cardTilt}
                      style={
                        reduce
                          ? undefined
                          : {
                              transform: 'perspective(900px) rotateX(var(--ctx, 0deg)) rotateY(var(--cty, 0deg))',
                              transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), border-color 0.25s, background-color 0.25s',
                            }
                      }
                      className={`spotlight group block rounded-xl border px-4 py-3 ${
                        isLinked
                          ? 'border-accent-300/55 bg-white/[0.07] shadow-[0_14px_30px_-14px_rgba(244,182,120,0.38)]'
                          : 'border-white/[0.08] bg-deep/55 hover:border-accent-300/35 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="w-5 shrink-0 font-mono text-[11px] font-semibold text-accent-300">
                          [{i + 1}]
                        </span>
                        <span
                          className="h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px_currentColor]"
                          style={{ backgroundColor: dotColor, color: dotColor }}
                        />
                        <span className="flex-1 truncate text-sm font-medium text-slate-100 transition-colors group-hover:text-accent-100">
                          {h.chunk.title}
                        </span>
                        <span className="font-mono text-[11px] font-semibold tabular-nums text-accent-200">
                          {h.score.toFixed(2)}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-300" />
                      </div>

                      {/* Luminous relevance bar with glowing leading photon */}
                      <div className="relative ml-7 mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(h.score / topScore) * 100}%` }}
                          transition={{ duration: 0.65, delay: i * 0.06, ease: EASE }}
                          className="relative h-full rounded-full bg-gradient-to-r from-accent-400/50 via-accent-300 to-white"
                        />
                      </div>

                      <div className="ml-7 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-slate-500">
                        <span className="text-slate-400">BM25 {h.bm25.toFixed(2)}</span>
                        <span className="text-slate-400">cos {h.cosine.toFixed(2)}</span>
                        {h.chunk.meta && <span className="max-w-[14rem] truncate">{h.chunk.meta}</span>}
                        <span className="text-accent-300/80">matched: {h.matched.join(', ')}</span>
                      </div>
                    </a>
                  </motion.li>
                );
              })}
            </ol>
          )}
        </div>

        {/* 3D Orbital Vector Observatory + Live Telemetry */}
        <div className="flex min-w-0 flex-col gap-3.5 lg:col-span-5">
          <div className="relative h-72 overflow-hidden rounded-2xl border border-white/[0.12] bg-deep/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] md:h-80">
            {/* Subtle holographic chamber backdrops */}
            <div aria-hidden="true" className="lab-chamber-grid pointer-events-none absolute inset-0 opacity-45" />
            <div aria-hidden="true" className="lab-scanlines pointer-events-none absolute inset-0 opacity-45" />

            {/* Top HUD overlay */}
            <div className="pointer-events-none absolute inset-x-3 top-2.5 z-10 flex items-center justify-between gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-deep/80 px-2.5 py-1 text-slate-300 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-accent-300" />
                PCA(3) Orbital Manifold
              </span>
              {qCoord && (
                <span className="hidden rounded-full border border-white/10 bg-deep/75 px-2 py-1 tabular-nums text-accent-200/90 sm:inline-block">
                  [{qCoord[0].toFixed(1)}, {qCoord[1].toFixed(1)}, {qCoord[2].toFixed(1)}]
                </span>
              )}
            </div>

            {/* Bottom hint + corner targeting reticles */}
            <span className="pointer-events-none absolute bottom-2.5 right-3 z-10 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">
              Drag to orbit · Hover nodes
            </span>
            <span aria-hidden="true" className="pointer-events-none absolute bottom-2.5 left-2.5 h-3 w-3 border-b border-l border-accent-300/45" />

            <SafeBoundary>
              <Suspense fallback={<div className="absolute inset-0 animate-pulse bg-white/[0.02]" />}>
                <EmbeddingSpace3D
                  points={points}
                  query={qCoord}
                  hits={hits.map((h) => h.index)}
                  activeHit={activeHit}
                  onHoverPoint={setActiveHit}
                  queryNonce={queryNonce}
                  reducedMotion={!!reduce}
                />
              </Suspense>
            </SafeBoundary>
          </div>

          {/* Cluster Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 rounded-xl border border-white/[0.07] bg-deep/45 px-3 py-2 font-mono text-[10px] text-slate-400">
            {Object.values(SECTION_STYLE).map((s) => (
              <span key={s.label} className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
                />
                {s.label}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-slate-200">
              <span className="h-1.5 w-1.5 rotate-45 bg-white shadow-[0_0_6px_#ffffff]" /> Query probe
            </span>
          </div>

          {/* Execution Trace HUD */}
          {run && (
            <ol className="flex flex-col gap-2 rounded-2xl border border-white/[0.09] bg-deep/70 p-4 font-mono text-[11px]">
              <li className="flex justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className={`h-3.5 w-3.5 ${run.verdict.blocked ? 'text-rose-400' : 'text-emerald-400'}`} />
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
                    <span className="truncate text-slate-200">{run.retrieval.terms.join(' ') || '∅'}</span>
                  </li>
                  <li className="flex justify-between gap-3 text-slate-400">
                    <span>BM25 ⊕ cosine (α 0.6)</span>
                    <span className="text-slate-200">
                      {index.chunks.length} chunks · {index.vocab.size} terms
                    </span>
                  </li>
                  <li className="flex justify-between gap-3 border-t border-white/[0.06] pt-1.5 text-slate-400">
                    <span>Retrieve + rank latency</span>
                    <span className="font-semibold text-accent-300">{fmt(run.retrieval.ms)}</span>
                  </li>
                </>
              )}
            </ol>
          )}
        </div>
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-slate-500">
        Not a mock: this is a working hybrid retriever (BM25 + TF‑IDF cosine) with PCA computed by power iteration,
        running entirely in your browser. No API calls, no canned answers. Answers are extractive and cited, so it
        cannot hallucinate.
      </p>
    </div>
  );
};

export default RetrievalLab;
