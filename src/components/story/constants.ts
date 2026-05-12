import * as THREE from 'three';

// ─── Act Progress Helper ───────────────────────────────────────────
export function act(t: number, start: number, end: number): number {
  return Math.max(0, Math.min(1, (t - start) / (end - start)));
}

// ─── Frame-rate independent lerp ───────────────────────────────────
export function flerp(current: number, target: number, factor: number, dt: number): number {
  return current + (target - current) * (1 - Math.pow(1 - factor, dt * 60));
}

// ─── Act Ranges ────────────────────────────────────────────────────
export const ACT = {
  STANDING:     { start: 0.00, end: 0.15 },
  PICKUP:       { start: 0.15, end: 0.28 },
  DEEP_WORK:    { start: 0.28, end: 0.50 },
  BREAKTHROUGH: { start: 0.50, end: 0.65 },
  WINDING_DOWN: { start: 0.65, end: 0.85 },
  GOODBYE:      { start: 0.85, end: 1.00 },
} as const;

// ─── Colors ────────────────────────────────────────────────────────
export const COLORS = {
  skin: '#FDBCB4',
  hair: '#1a0a0a',
  eyes: '#111118',
  hoodie: '#1e3a5f',
  jeans: '#1a1a2e',
  shoes: '#f0f0ff',
  laptop: '#2a3a4a',
  laptopDark: '#1a2a3a',
  cyan: '#00d4ff',
  purple: '#7c3aed',
  white: '#f0f0ff',
  screenBg: '#001a2e',
} as const;

// ─── Camera Targets Per Act ────────────────────────────────────────
export const CAMERA_TARGETS: THREE.Vector3[] = [
  new THREE.Vector3(0, 0.2, 3.8),    // Act 1 — medium shot
  new THREE.Vector3(0, 0.1, 3.2),    // Act 2 — zoom in
  new THREE.Vector3(0.3, 0.0, 2.8),  // Act 3 — intimate offset
  new THREE.Vector3(0, -0.1, 3.5),   // Act 4 — pull back
  new THREE.Vector3(-0.2, 0.2, 3.2), // Act 5 — relaxed
  new THREE.Vector3(0, 0.1, 3.0),    // Act 6 — eye contact
];

// ─── Code Lines for Screen ─────────────────────────────────────────
export const CODE_LINES: string[] = [
  'const model = await llm.invoke(prompt)',
  'rag_pipeline.run(query)',
  'embeddings = encoder.encode(texts)',
  'await sql_validator.check(query)',
  'LangGraph.invoke({ messages })',
  's3.upload(file, bucket)',
  'jwt.verify(token, RS256)',
  'redis.set(key, value, EX)',
  'const result = await agent.run()',
  'pipeline.add_step(retriever)',
  'db.query(sql, params)',
  'response = openai.chat(messages)',
  'vector_store.similarity_search(q)',
  'await celery.send_task(name)',
  'fastapi.post("/api/chat")',
];

// ─── Achievement Data ──────────────────────────────────────────────
export const ACHIEVEMENTS = ['69%', '98%', '60%', '80%'] as const;
