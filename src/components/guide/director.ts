// Rig-agnostic motion: gestures are pure functions → target pose; the director blends toward it
// with critically-damped smoothing so every transition is continuous. Both avatar bodies
// (procedural hologram, user-supplied GLB) consume the same pose, so choreography is written once.
import * as THREE from 'three';
import type { Gesture, GuideSignal, Mood } from './signal';

type V3 = [number, number, number];

/** Arm directions are unit-ish vectors in avatar space: +x screen-right, +y up, +z toward viewer. */
export interface Pose {
  armL: [V3, V3]; // screen-left arm: upper, fore
  armR: [V3, V3];
  head: V3; // pitch, yaw, roll
  torso: V3;
  lift: number;
}

interface Ctx {
  t: number;
  talk: number;
  /** Unit direction from the avatar's shoulders to the focused element (screen space, y up). */
  point: { x: number; y: number };
  /** Cursor direction, -1..1. */
  look: { x: number; y: number };
}

const IDLE_L: [V3, V3] = [[-0.28, -1, 0.05], [-0.12, -1, 0.25]];
const IDLE_R: [V3, V3] = [[0.28, -1, 0.05], [0.12, -1, 0.25]];

const idle = (c: Ctx): Pose => ({
  armL: IDLE_L,
  armR: IDLE_R,
  head: [-c.look.y * 0.25 + Math.sin(c.t * 0.7) * 0.03, c.look.x * 0.45, Math.sin(c.t * 0.5) * 0.03],
  torso: [0, c.look.x * 0.08, 0],
  lift: Math.sin(c.t * 1.6) * 0.015,
});

const explainArms = (c: Ctx, amp: number): Pick<Pose, 'armL' | 'armR'> => ({
  armL: [
    [-0.35, -0.85, 0.4],
    [-0.15 + amp * 0.3 * Math.sin(c.t * 3.1), 0.05 + amp * 0.25 * Math.sin(c.t * 2.3), 1],
  ],
  armR: [
    [0.35, -0.85, 0.4],
    [0.15 + amp * 0.3 * Math.sin(c.t * 2.7 + 1.3), 0.05 + amp * 0.25 * Math.sin(c.t * 2.1 + 2), 1],
  ],
});

export const POSES: Record<Gesture, (c: Ctx) => Pose> = {
  idle,
  wave: (c) => ({
    ...idle(c),
    armR: [[0.75, 0.7, 0.15], [0.2 + Math.sin(c.t * 9) * 0.5, 1, 0.2]],
    head: [0.02, 0.15, 0.12],
  }),
  point: (c) => {
    const right = c.point.x >= 0;
    const dir: V3 = [c.point.x, c.point.y, 0.35];
    const arm: [V3, V3] = [[dir[0], dir[1] - 0.15, dir[2]], dir];
    return {
      ...idle(c),
      armL: right ? IDLE_L : arm,
      armR: right ? arm : IDLE_R,
      head: [-c.point.y * 0.35, c.point.x * 0.55, 0],
      torso: [0, c.point.x * 0.2, 0],
    };
  },
  present: (c) => ({
    ...idle(c),
    armL: [[-0.7, -0.45, 0.45], [-0.45, 0.1, 0.9]],
    armR: [[0.7, -0.45, 0.45], [0.45, 0.1, 0.9]],
    head: [-0.04, Math.sin(c.t * 0.9) * 0.12, 0.06],
  }),
  think: (c) => ({
    ...idle(c),
    armR: [[0.25, -0.8, 0.55], [-0.4, 0.75, 0.5]],
    armL: [[-0.15, -1, 0.3], [0.6, -0.1, 0.8]],
    head: [-0.12, -0.15, 0.16],
  }),
  celebrate: (c) => ({
    ...idle(c),
    armL: [[-0.5, 0.85, 0.1], [-0.3 + Math.sin(c.t * 7) * 0.15, 1, 0]],
    armR: [[0.5, 0.85, 0.1], [0.3 - Math.sin(c.t * 7) * 0.15, 1, 0]],
    head: [-0.18, 0, Math.sin(c.t * 4) * 0.08],
    lift: Math.abs(Math.sin(c.t * 6)) * 0.08,
  }),
  explain: (c) => ({ ...idle(c), ...explainArms(c, 0.4 + c.talk * 0.6) }),
  nod: (c) => ({ ...idle(c), head: [Math.sin(c.t * 6) * 0.18, 0, 0] }),
  shake: (c) => ({
    ...idle(c),
    armL: [[-0.3, -0.9, 0.3], [0.85, 0.12, 0.5]],
    armR: [[0.3, -0.9, 0.3], [-0.85, 0.18, 0.5]],
    head: [0.05, Math.sin(c.t * 11) * 0.35, 0],
  }),
};

/** Gestures that play once, then hand back to explain/idle. Seconds. */
const TRANSIENT: Partial<Record<Gesture, number>> = { wave: 2.4, nod: 1.4, shake: 1.8, celebrate: 2.6 };

export const MOOD_COLOR: Record<Mood, string> = {
  neutral: '#38bdf8',
  happy: '#5eead4',
  excited: '#f472b6',
  curious: '#a78bfa',
  alert: '#fb7185',
};

export interface Live {
  armL: [THREE.Vector3, THREE.Vector3];
  armR: [THREE.Vector3, THREE.Vector3];
  head: THREE.Vector3;
  torso: THREE.Vector3;
  lift: number;
  mouth: number;
  blink: number;
  smile: number;
  color: THREE.Color;
  gesture: Gesture;
}

const v = (a: V3) => new THREE.Vector3(...a);

export function createDirector(signal: { current: GuideSignal }, stage: { current: HTMLElement | null }, reducedMotion: boolean) {
  const live: Live = {
    armL: [v(IDLE_L[0]).normalize(), v(IDLE_L[1]).normalize()],
    armR: [v(IDLE_R[0]).normalize(), v(IDLE_R[1]).normalize()],
    head: new THREE.Vector3(),
    torso: new THREE.Vector3(),
    lift: 0,
    mouth: 0,
    blink: 0,
    smile: 0,
    color: new THREE.Color(MOOD_COLOR.neutral),
    gesture: 'idle',
  };
  const cursor = { x: 0, y: 0, has: false };
  const onMove = (e: PointerEvent) => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
    cursor.has = true;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  const tmp = new THREE.Vector3();
  const moodColor = new THREE.Color();
  let nextBlink = 2;
  let blinkStart = -1;

  const ease = (k: number, dt: number) => 1 - Math.exp(-k * dt);
  const towardDir = (cur: THREE.Vector3, target: V3, a: number) => cur.lerp(tmp.set(...target).normalize(), a).normalize();

  function step(t: number, dt: number): Live {
    const s = signal.current;
    const now = performance.now();
    const age = (now - s.since) / 1000;

    // Screen geometry: avatar shoulder point → focus element / cursor.
    const rect = stage.current?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : innerWidth - 120;
    const cy = rect ? rect.top + rect.height * 0.42 : innerHeight - 200;
    let point = { x: 0, y: -1 };
    let focusVisible = false;
    if (s.focusEl?.isConnected) {
      const r = s.focusEl.getBoundingClientRect();
      const tx = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth);
      const ty = Math.min(Math.max(r.top + Math.min(r.height / 2, 160), 0), innerHeight);
      const dx = tx - cx;
      const dy = cy - ty;
      const len = Math.hypot(dx, dy) || 1;
      point = { x: dx / len, y: dy / len };
      focusVisible = r.bottom > 0 && r.top < innerHeight;
    }
    const look = cursor.has
      ? { x: Math.tanh((cursor.x - cx) / 500), y: Math.tanh((cy - cursor.y) / 400) }
      : { x: Math.sin(t * 0.3) * 0.3, y: 0 };

    let g = s.gesture;
    const fallback: Gesture = s.talking ? 'explain' : 'idle';
    if ((TRANSIENT[g] ?? Infinity) < age || (g === 'point' && !focusVisible)) g = fallback;
    if (now - s.pokedAt < 900) g = 'nod';
    live.gesture = g;

    const target = POSES[g]({ t: reducedMotion ? 0 : t, talk: s.talking ? 1 : 0, point, look });

    // Travel between docks: lean and float into the move.
    const travel = Math.max(0, 1 - (now - s.travelAt) / 1100);
    target.torso[2] -= s.travelDir * travel * 0.18;
    target.torso[1] += s.travelDir * travel * 0.35;
    target.lift += travel * 0.06;

    const aArm = reducedMotion ? 1 : ease(7, dt);
    const aHead = reducedMotion ? 1 : ease(9, dt);
    towardDir(live.armL[0], target.armL[0], aArm);
    towardDir(live.armL[1], target.armL[1], aArm);
    towardDir(live.armR[0], target.armR[0], aArm);
    towardDir(live.armR[1], target.armR[1], aArm);
    live.head.lerp(tmp.set(...target.head), aHead);
    live.torso.lerp(tmp.set(...target.torso), aArm);
    live.lift += (target.lift - live.lift) * aArm;

    // Face: jaw follows the real voice loudness; without audio, two incommensurate sines read as syllables.
    const level = s.level?.() ?? null;
    const flap = level !== null ? level : s.talking ? 0.12 + 0.6 * Math.abs(Math.sin(t * 13) * Math.sin(t * 4.7 + 1)) : 0;
    live.mouth += (flap - live.mouth) * ease(25, dt);
    if (t > nextBlink) {
      blinkStart = t;
      nextBlink = t + 2 + Math.random() * 3.5;
    }
    const bt = (t - blinkStart) / 0.16;
    live.blink = bt >= 0 && bt <= 1 ? Math.sin(bt * Math.PI) : 0;
    const happy = s.mood === 'happy' || s.mood === 'excited' ? 1 : 0;
    live.smile += (happy - live.smile) * ease(4, dt);
    live.color.lerp(moodColor.set(MOOD_COLOR[s.mood]), ease(3, dt));
    return live;
  }

  return { step, dispose: () => window.removeEventListener('pointermove', onMove) };
}

export type Director = ReturnType<typeof createDirector>;
