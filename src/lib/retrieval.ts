// In-browser hybrid retrieval over the portfolio's own content.
// BM25 gives exact-term precision, TF-IDF cosine gives soft overlap; scores are fused
// like a production hybrid retriever. PCA (power iteration on the Gram matrix) projects
// the TF-IDF space to 3D so the UI can draw the real geometry of the index.

export type Section = 'experience' | 'project' | 'skills' | 'impact' | 'profile';

export interface Chunk {
  id: string;
  title: string;
  section: Section;
  /** Anchor the UI scrolls to when the chunk is cited. */
  href: string;
  /** Short context line, e.g. company + dates. */
  meta?: string;
  text: string;
}

export interface Hit {
  index: number;
  chunk: Chunk;
  bm25: number;
  cosine: number;
  score: number;
  matched: string[];
}

export interface Retrieval {
  terms: string[];
  hits: Hit[];
  /** Query position in the same PCA space as `Index.coords`; null when the query has no known terms. */
  queryCoord: [number, number, number] | null;
  ms: number;
}

export interface Index {
  chunks: Chunk[];
  vocab: Map<string, number>;
  coords: [number, number, number][];
  search: (query: string, k?: number) => Retrieval;
}

const STOP = new Set(
  ('a an and are as at be by for from has have he his i in is it its of on or that the to was were will with ' +
    'what who how why which do does did you your me my about can this these those there their they them than ' +
    'then into over under not no yes so any all also just more most some such tell show give koshal kumar ' +
    'he him did done using used use via per across').split(' ')
);

// Symmetric expansion (applied to documents and queries alike) so recruiter phrasing
// like "RAG" or "computer vision" lands on the right evidence.
const EXPAND: Record<string, string[]> = {
  rag: ['retrieval'],
  retriev: ['retrieval'],
  retriever: ['retrieval'],
  recall: ['retrieval'],
  llms: ['llm'],
  gpt: ['llm'],
  openai: ['llm'],
  gemini: ['llm'],
  langgraph: ['agent'],
  agentic: ['agent'],
  vision: ['vision'],
  cv: ['vision'],
  yolo: ['vision'],
  opencv: ['vision'],
  resnet18: ['vision'],
  clip: ['vision', 'embedd'],
  image: ['vision'],
  guardrail: ['security'],
  injection: ['security'],
  rbac: ['security'],
  jailbreak: ['security'],
  pii: ['security'],
  sqlglot: ['sql'],
  postgresql: ['sql'],
  postgres: ['sql'],
  mysql: ['sql'],
  faiss: ['vector'],
  pinecone: ['vector'],
  chromadb: ['vector'],
  embedd: ['vector'],
  aws: ['cloud'],
  s3: ['cloud'],
  lambda: ['cloud'],
  azure: ['cloud'],
  pytorch: ['ml'],
  tensorflow: ['ml'],
  machine: ['ml'],
  distilbert: ['ml', 'nlp'],
  email: ['contact'],
  hire: ['contact'],
  reach: ['contact'],
  degree: ['education'],
  btech: ['education'],
  university: ['education'],
  cost: ['cost'],
  latency: ['performance'],
  fast: ['performance'],
};

function stem(w: string): string {
  if (w.length > 5 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.toLowerCase().match(/[a-z0-9]+(?:\.[0-9]+)*/g) ?? []) {
    if (raw.length < 2 || STOP.has(raw)) continue;
    const s = stem(raw);
    out.push(s);
    for (const extra of EXPAND[raw] ?? EXPAND[s] ?? []) if (extra !== s) out.push(extra);
  }
  return out;
}

function counts(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

const K1 = 1.2;
const B = 0.75;
/** Weight of BM25 vs cosine in the fused score. */
const ALPHA = 0.6;

export function buildIndex(chunks: Chunk[]): Index {
  const docTf = chunks.map((c) => counts(tokenize(`${c.title} ${c.title} ${c.meta ?? ''} ${c.text}`)));
  const lengths = docTf.map((tf) => [...tf.values()].reduce((a, b) => a + b, 0));
  const avgdl = lengths.reduce((a, b) => a + b, 0) / chunks.length;
  const N = chunks.length;

  const df = new Map<string, number>();
  for (const tf of docTf) for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const vocab = new Map([...df.keys()].map((t, i) => [t, i]));
  const idf = (t: string) => {
    const d = df.get(t) ?? 0;
    return Math.log(1 + (N - d + 0.5) / (d + 0.5));
  };

  const tfidf = (tf: Map<string, number>) => {
    const v = new Float64Array(vocab.size);
    for (const [t, c] of tf) {
      const j = vocab.get(t);
      if (j !== undefined) v[j] = (1 + Math.log(c)) * idf(t);
    }
    const norm = Math.hypot(...v) || 1;
    for (let j = 0; j < v.length; j++) v[j] /= norm;
    return v;
  };
  const docVecs = docTf.map(tfidf);

  const { coords, project } = pca3(docVecs);

  const search = (query: string, k = 5): Retrieval => {
    const t0 = performance.now();
    const terms = [...new Set(tokenize(query))].filter((t) => vocab.has(t));
    const qVec = tfidf(counts(terms));

    const raw = chunks.map((chunk, index) => {
      let bm25 = 0;
      const matched: string[] = [];
      for (const t of terms) {
        const f = docTf[index].get(t);
        if (!f) continue;
        matched.push(t);
        bm25 += idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * lengths[index]) / avgdl)));
      }
      let cosine = 0;
      const d = docVecs[index];
      for (let j = 0; j < d.length; j++) cosine += d[j] * qVec[j];
      return { index, chunk, bm25, cosine, matched, score: 0 };
    });

    const maxBm25 = Math.max(...raw.map((h) => h.bm25)) || 1;
    for (const h of raw) h.score = ALPHA * (h.bm25 / maxBm25) + (1 - ALPHA) * h.cosine;
    const hits = raw
      .filter((h) => h.matched.length > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    return {
      terms,
      hits,
      queryCoord: terms.length ? project(qVec) : null,
      ms: performance.now() - t0,
    };
  };

  return { chunks, vocab, coords, search };
}

/** Top-3 principal components via power iteration on the centered Gram matrix (n × n, n = #chunks). */
function pca3(X: Float64Array[]) {
  const n = X.length;
  const dim = X[0]?.length ?? 0;
  const mean = new Float64Array(dim);
  for (const x of X) for (let j = 0; j < dim; j++) mean[j] += x[j] / n;
  const Xc = X.map((x) => x.map((v, j) => v - mean[j]));

  const K = Xc.map((a) => Xc.map((b) => a.reduce((s, v, j) => s + v * b[j], 0)));
  const axes: Float64Array[] = [];
  for (let c = 0; c < 3; c++) {
    // Deterministic start vector so the layout is stable across reloads.
    let v = Array.from({ length: n }, (_, i) => Math.sin(i * 1.7 + c + 1));
    let lambda = 0;
    for (let it = 0; it < 200; it++) {
      const w = K.map((row) => row.reduce((s, kij, j) => s + kij * v[j], 0));
      lambda = Math.hypot(...w);
      if (lambda < 1e-12) break;
      v = w.map((x) => x / lambda);
    }
    // Deflate so the next pass finds the next component.
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) K[i][j] -= lambda * v[i] * v[j];
    // Term-space axis u = Xcᵀ v / sqrt(λ), unit length.
    const u = new Float64Array(dim);
    const s = Math.sqrt(lambda) || 1;
    for (let i = 0; i < n; i++) for (let j = 0; j < dim; j++) u[j] += (Xc[i][j] * v[i]) / s;
    axes.push(u);
  }

  const rawProject = (x: Float64Array): [number, number, number] => {
    const p = axes.map((u) => u.reduce((acc, uj, j) => acc + uj * (x[j] - mean[j]), 0));
    return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0];
  };
  const rawCoords = X.map(rawProject);
  const scale = 2 / (Math.max(...rawCoords.flat().map(Math.abs)) || 1);
  const project = (x: Float64Array) => rawProject(x).map((v) => v * scale) as [number, number, number];
  return { coords: rawCoords.map((p) => p.map((v) => v * scale) as [number, number, number]), project };
}

/** Sentence boundary: terminal punctuation, then a capital or digit (keeps "0.48" and "B.Tech" intact). */
export const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z0-9])/;

export interface AnswerSentence {
  text: string;
  /** 1-based citation into `hits`. */
  cite: number;
}

/**
 * Extractive, cited answer: the best-matching sentence from each strong hit, in rank order.
 * Every sentence exists verbatim in retrieved evidence, so the answer cannot hallucinate.
 */
export function synthesize(r: Retrieval, maxSentences = 3): AnswerSentence[] {
  if (!r.hits.length) return [];
  const qs = new Set(r.terms);
  return r.hits
    .filter((h) => h.score >= r.hits[0].score * 0.45)
    .slice(0, maxSentences)
    .map((h, i) => {
      let best = '';
      let bestScore = -Infinity;
      for (const sentence of h.chunk.text.split(SENTENCE_SPLIT)) {
        const overlap = new Set(tokenize(sentence).filter((t) => qs.has(t))).size;
        // Prefer prose over comma-separated stack lists when overlap ties.
        const score = overlap - ((sentence.match(/,/g) ?? []).length >= 4 ? 0.5 : 0);
        if (score > bestScore) [best, bestScore] = [sentence.trim(), score];
      }
      return { text: best, cite: i + 1 };
    });
}

// ─── Guardrails ───────────────────────────────────────────────────────────

export interface Finding {
  rule: string;
  label: string;
  match: string;
  weight: number;
}

export interface Verdict {
  blocked: boolean;
  risk: number;
  findings: Finding[];
  /** Read-only SQL rewritten with a tenant filter, when the input was SQL and passed. */
  rewrittenSql?: string;
  ms: number;
}

const PROMPT_RULES: { rule: string; label: string; weight: number; re: RegExp }[] = [
  {
    rule: 'override',
    label: 'Instruction override',
    weight: 0.7,
    re: /\b(ignore|disregard|forget|override|bypass)\b.{0,40}?\b(instructions?|prompts?|rules?|polic(?:y|ies)|guidelines?|guardrails?)\b/i,
  },
  {
    rule: 'exfiltration',
    label: 'Secret / system-prompt exfiltration',
    weight: 0.6,
    re: /\b(reveal|print|show|output|leak|dump|repeat|expose)\b.{0,40}\b(system prompt|hidden prompt|instructions|api[ _-]?keys?|secrets?|credentials?|passwords?|tokens?)\b/i,
  },
  {
    rule: 'role-hijack',
    label: 'Role hijack',
    weight: 0.5,
    re: /\b(you are now|act as (?:an? )?(?:unfiltered|unrestricted|admin|root)|pretend (?:to be|you are)|from now on,? you|developer mode|jailbreak|DAN mode)\b/i,
  },
  {
    rule: 'delimiter',
    label: 'Chat-template / delimiter injection',
    weight: 0.6,
    re: /(<\|?(?:im_start|im_end|system|endoftext)\|?>|\[\/?(?:INST|SYS)\]|^\s*(?:system|assistant)\s*:)/im,
  },
  {
    rule: 'pii',
    label: 'PII exfiltration',
    weight: 0.6,
    re: /\b(dump|export|leak|exfiltrate|send|unmask(?:ed)?|bulk)\b.{0,50}\b(ssn|social security|bank (?:details|accounts?)|salar(?:y|ies)|compensation|aadhaar|pan (?:number|card)|credit cards?|personal data|pii)\b/i,
  },
  { rule: 'encoded', label: 'Encoded payload (base64-like)', weight: 0.3, re: /[A-Za-z0-9+/]{48,}={0,2}/ },
];

const WRITE_KEYWORDS = /\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|GRANT|REVOKE|CREATE|EXEC(?:UTE)?|MERGE|REPLACE|CALL|COPY)\b/i;
/** A payload that opens by closing the surrounding literal: the classic injection shape. */
const BREAKOUT = /^\s*'\s*(?:;|\)|--|#|\b(?:OR|AND|UNION)\b)/i;

function looksLikeSql(s: string): boolean {
  return (
    /^\s*(SELECT|WITH|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|EXEC|MERGE)\b/i.test(s) ||
    BREAKOUT.test(s) ||
    /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE)\b/i.test(s)
  );
}

/** Blanks out string literals (length-preserving) so keyword checks only see SQL structure. */
function maskStrings(sql: string): string {
  return sql.replace(/'(?:[^']|'')*'/g, (m) => `'${'_'.repeat(m.length - 2)}'`);
}

function checkSql(input: string): { findings: Finding[]; rewritten?: string } {
  const findings: Finding[] = [];
  const add = (rule: string, label: string, weight: number, match: string) =>
    findings.push({ rule, label, weight, match: match.trim().slice(0, 60) });

  const breakout = BREAKOUT.test(input);
  if (breakout) add('breakout', 'Literal breakout (quote closes the value)', 0.4, input.trim().slice(0, 12));
  // Evaluate breakout payloads the way the database would see them: inside WHERE col = '<payload>'.
  const sql = breakout ? `'${input}'` : input;
  const masked = maskStrings(sql);

  const comment = masked.match(/--.*$|\/\*[\s\S]*?\*\/|#.*$/m);
  if (comment) add('comment', 'Comment injection', 0.4, comment[0]);
  const statements = masked.split(';').map((s) => s.trim()).filter(Boolean);
  if (statements.length > 1) add('stacked', 'Stacked queries', 0.6, `${statements.length} statements`);
  const write = masked.match(WRITE_KEYWORDS);
  if (write) add('write', `Destructive keyword ${write[0].toUpperCase()}`, 0.9, write[0]);
  const union = masked.match(/\bUNION\b(\s+ALL)?\s+SELECT\b/i);
  if (union) add('union', 'UNION-based exfiltration', 0.6, union[0]);
  const taut = sql.match(/\bOR\b\s+('?)(\w+)\1\s*=\s*\1\2\1/i) ?? sql.match(/'(\w*)'\s*=\s*'\1'/);
  if (taut) add('tautology', 'Tautology (always-true predicate)', 0.6, taut[0]);
  if (!breakout && !write && statements[0] && !/^(SELECT|WITH)\b/i.test(statements[0]))
    add('not-select', 'Not a read-only SELECT', 0.5, statements[0].split(/\s+/)[0]);

  if (findings.length || statements.length !== 1) return { findings };

  // Passed: enforce tenant isolation and a row ceiling, as the production pipeline does post-AST.
  // ponytail: token-level rewrite targets the first WHERE; subqueries need a real AST (SQLGlot in prod).
  const stmt = sql.trim().replace(/;\s*$/, '');
  const m = maskStrings(stmt);
  const tail = m.search(/\b(GROUP\s+BY|ORDER\s+BY|LIMIT|HAVING)\b/i);
  const cut = tail === -1 ? stmt.length : tail;
  const head = stmt.slice(0, cut).trimEnd();
  const rest = tail === -1 ? '' : ' ' + stmt.slice(cut);
  const w = m.slice(0, cut).search(/\bWHERE\b/i);
  let rewritten =
    w === -1
      ? `${head} WHERE tenant_id = :session_tenant${rest}`
      : `${head.slice(0, w)}WHERE tenant_id = :session_tenant AND (${head.slice(w + 5).trim()})${rest}`;
  if (!/\bLIMIT\b/i.test(m)) rewritten += ' LIMIT 1000';
  return { findings, rewritten };
}

export function inspect(input: string): Verdict {
  const t0 = performance.now();
  const findings: Finding[] = [];
  for (const r of PROMPT_RULES) {
    const m = input.match(r.re);
    if (m) findings.push({ rule: r.rule, label: r.label, weight: r.weight, match: m[0].slice(0, 60) });
  }
  let rewrittenSql: string | undefined;
  if (looksLikeSql(input)) {
    const sql = checkSql(input);
    findings.push(...sql.findings);
    rewrittenSql = findings.length ? undefined : sql.rewritten;
  }
  // Noisy-OR: independent signals compound without exceeding 1.
  const risk = 1 - findings.reduce((p, f) => p * (1 - f.weight), 1);
  return { blocked: risk >= 0.5, risk, findings, rewrittenSql, ms: performance.now() - t0 };
}
