// Rig-agnostic motion: gestures are pure functions → target pose; the director blends toward it
// with critically-damped smoothing so every transition is continuous. Both avatar bodies
// (procedural hologram, the GLB twin) consume the same pose, so choreography is written once.
// The face is layered on top: eyes lead and the head follows, brows lift on spoken emphasis,
// visemes come from the live voice, blinks land on pauses like a person's do.
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
  head: [-c.look.y * 0.22 + Math.sin(c.t * 0.7) * 0.025, c.look.x * 0.4, Math.sin(c.t * 0.5) * 0.025],
  torso: [0, c.look.x * 0.06, 0],
  lift: Math.sin(c.t * 1.6) * 0.01,
});

const explainArms = (c: Ctx, amp: number): Pick<Pose, 'armL' | 'armR'> => ({
  armL: [
    [-0.32, -0.9, 0.3],
    [-0.12 + amp * 0.22 * Math.sin(c.t * 2.6), -0.1 + amp * 0.18 * Math.sin(c.t * 1.9), 1],
  ],
  armR: [
    [0.32, -0.9, 0.3],
    [0.12 + amp * 0.22 * Math.sin(c.t * 2.3 + 1.3), -0.1 + amp * 0.18 * Math.sin(c.t * 1.7 + 2), 1],
  ],
});

export const POSES: Record<Gesture, (c: Ctx) => Pose> = {
  idle,
  wave: (c) => ({
    ...idle(c),
    armR: [[0.55, 0.72, 0.28], [0.1 + Math.sin(c.t * 8) * 0.35, 1, 0.25]],
    head: [0.02, 0.12, 0.1],
  }),
  point: (c) => {
    const right = c.point.x >= 0;
    const dir: V3 = [c.point.x, c.point.y, 0.35];
    const arm: [V3, V3] = [[dir[0], dir[1] - 0.15, dir[2]], dir];
    return {
      ...idle(c),
      armL: right ? IDLE_L : arm,
      armR: right ? arm : IDLE_R,
      head: [-c.point.y * 0.3, c.point.x * 0.5, 0],
      torso: [0, c.point.x * 0.18, 0],
    };
  },
  present: (c) => ({
    ...idle(c),
    armL: [[-0.7, -0.45, 0.45], [-0.45, 0.1, 0.9]],
    armR: [[0.7, -0.45, 0.45], [0.45, 0.1, 0.9]],
    head: [-0.04, Math.sin(c.t * 0.9) * 0.1, 0.05],
  }),
  think: (c) => ({
    ...idle(c),
    armR: [[0.25, -0.8, 0.55], [-0.4, 0.75, 0.5]],
    armL: [[-0.15, -1, 0.3], [0.6, -0.1, 0.8]],
    head: [-0.1, -0.12, 0.14],
  }),
  celebrate: (c) => ({
    ...idle(c),
    armL: [[-0.5, 0.85, 0.1], [-0.3 + Math.sin(c.t * 7) * 0.15, 1, 0]],
    armR: [[0.5, 0.85, 0.1], [0.3 - Math.sin(c.t * 7) * 0.15, 1, 0]],
    head: [-0.16, 0, Math.sin(c.t * 4) * 0.07],
    lift: Math.abs(Math.sin(c.t * 6)) * 0.06,
  }),
  explain: (c) => ({ ...idle(c), ...explainArms(c, 0.35 + c.talk * 0.5) }),
  nod: (c) => ({ ...idle(c), head: [Math.sin(c.t * 6) * 0.16, 0, 0] }),
  shake: (c) => ({
    ...idle(c),
    armL: [[-0.3, -0.9, 0.3], [0.85, 0.12, 0.5]],
    armR: [[0.3, -0.9, 0.3], [-0.85, 0.18, 0.5]],
    head: [0.05, Math.sin(c.t * 10) * 0.3, 0],
  }),
  // Open palms, a little head tilt: "no idea, honestly".
  shrug: (c) => ({
    ...idle(c),
    armL: [[-0.42, -0.82, 0.3], [-0.78, 0.12, 0.62]],
    armR: [[0.42, -0.82, 0.3], [0.78, 0.12, 0.62]],
    head: [0.06, 0, 0.14],
    lift: 0.025,
  }),
};

/** Gestures that play once, then hand back to explain/idle. Seconds. */
const TRANSIENT: Partial<Record<Gesture, number>> = { wave: 2.4, nod: 1.4, shake: 1.8, celebrate: 2.6, shrug: 2 };

/** How much the procedural arms override the body's own idle motion (the GLB's clip). */
const ARM_WEIGHT: Record<Gesture, number> = {
  idle: 0,
  nod: 0,
  explain: 0.45,
  wave: 1,
  point: 1,
  present: 1,
  think: 1,
  celebrate: 1,
  shake: 1,
  shrug: 1,
};

export const MOOD_COLOR: Record<Mood, string> = {
  neutral: '#f4b678',
  happy: '#f8c690',
  excited: '#fddbb4',
  curious: '#a5b4fc',
  alert: '#f5a3b7',
};

export interface Live {
  armL: [THREE.Vector3, THREE.Vector3];
  armR: [THREE.Vector3, THREE.Vector3];
  armWeight: number;
  head: THREE.Vector3;
  torso: THREE.Vector3;
  lift: number;
  /** Eye direction, -1..1 (x screen-right, y up). */
  gaze: THREE.Vector2;
  mouth: number;
  open: number;
  wide: number;
  round: number;
  hiss: number;
  blink: number;
  smile: number;
  brow: number;
  frown: number;
  /** Wide eyes for a beat after he's poked. */
  surprise: number;
  color: THREE.Color;
  gesture: Gesture;
}

const v = (a: V3) => new THREE.Vector3(...a);
const clamp = (x: number, a = -1, b = 1) => Math.min(b, Math.max(a, x));

export function createDirector(signal: { current: GuideSignal }, stage: { current: HTMLElement | null }, reducedMotion: boolean) {
  const live: Live = {
    armL: [v(IDLE_L[0]).normalize(), v(IDLE_L[1]).normalize()],
    armR: [v(IDLE_R[0]).normalize(), v(IDLE_R[1]).normalize()],
    armWeight: 0,
    head: new THREE.Vector3(),
    torso: new THREE.Vector3(),
    lift: 0,
    gaze: new THREE.Vector2(),
    mouth: 0,
    open: 0,
    wide: 0,
    round: 0,
    hiss: 0,
    blink: 0,
    smile: 0,
    brow: 0,
    frown: 0,
    surprise: 0,
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
  const gazeTarget = new THREE.Vector2();
  const saccade = new THREE.Vector2();
  let nextSaccade = 1;
  let nextBlink = 2;
  let blinkStart = -1;
  let wasLoud = false;
  let levelAvg = 0;
  let emphasis = 0;

  const ease = (k: number, dt: number) => 1 - Math.exp(-k * dt);
  const towardDir = (cur: THREE.Vector3, target: V3, a: number) => cur.lerp(tmp.set(...target).normalize(), a).normalize();
  const startBlink = (t: number) => {
    blinkStart = t;
    nextBlink = t + 2.2 + Math.random() * 3.8;
  };

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

    // While talking he holds the visitor's eye instead of chasing the cursor.
    const attention = s.talking ? { x: look.x * 0.3, y: look.y * 0.3 } : look;
    const target = POSES[g]({ t: reducedMotion ? 0 : t, talk: s.talking ? 1 : 0, point, look: attention });

    // Travel between docks: lean and float into the move.
    const travel = Math.max(0, 1 - (now - s.travelAt) / 1100);
    target.torso[2] -= s.travelDir * travel * 0.12;
    target.torso[1] += s.travelDir * travel * 0.3;
    target.lift += travel * 0.04;

    // Voice: loudness drives the jaw; peaks above the running average are emphasis (brows, small nods).
    const level = s.level?.() ?? null;
    const shape = level !== null ? s.shape?.(level) ?? null : null;
    const flap = level !== null ? level : s.talking ? 0.12 + 0.55 * Math.abs(Math.sin(t * 13) * Math.sin(t * 4.7 + 1)) : 0;
    levelAvg += ((level ?? 0) - levelAvg) * ease(1.5, dt);
    emphasis += (Math.max(0, (level ?? 0) - levelAvg * 1.35) * 2.2 - emphasis) * ease(10, dt);
    if (s.talking) {
      target.head[0] += emphasis * 0.07 - 0.015; // nod into stressed words, chin slightly up to the listener
      target.head[2] += Math.sin(t * 1.1) * 0.02;
    }
    if (s.listening) {
      target.head[0] += 0.05; // lean in
      target.head[2] += 0.08; // attentive tilt
    }

    const aArm = reducedMotion ? 1 : ease(6, dt);
    const aHead = reducedMotion ? 1 : ease(7, dt);
    towardDir(live.armL[0], target.armL[0], aArm);
    towardDir(live.armL[1], target.armL[1], aArm);
    towardDir(live.armR[0], target.armR[0], aArm);
    towardDir(live.armR[1], target.armR[1], aArm);
    live.armWeight += (ARM_WEIGHT[g] - live.armWeight) * ease(4, dt);
    live.head.lerp(tmp.set(...target.head), aHead);
    live.torso.lerp(tmp.set(...target.torso), aArm);
    live.lift += (target.lift - live.lift) * aArm;

    // Eyes lead the head: meet the visitor while talking, glance up while thinking, follow the
    // cursor or the focused element otherwise, with small saccades so they never look painted on.
    if (g === 'think') gazeTarget.set(-0.5, 0.55);
    else if (g === 'point' && focusVisible) gazeTarget.set(point.x * 0.8, point.y * 0.6);
    else if (s.listening) gazeTarget.set(-0.35 * s.side, -0.2);
    else if (s.talking) gazeTarget.set(0, 0.05);
    else gazeTarget.set(look.x * 0.7, look.y * 0.5);
    if (t > nextSaccade) {
      nextSaccade = t + (s.talking ? 0.5 + Math.random() * 1.4 : 0.8 + Math.random() * 2.2);
      saccade.set((Math.random() - 0.5) * (s.talking ? 0.16 : 0.28), (Math.random() - 0.5) * 0.12);
      if (Math.random() < 0.18) startBlink(t); // big gaze shifts often come with a blink
    }
    live.gaze.lerp(gazeTarget.add(saccade), reducedMotion ? 1 : ease(26, dt));
    live.gaze.set(clamp(live.gaze.x), clamp(live.gaze.y));

    // Mouth: jaw follows the real voice loudness; visemes from its spectrum when available.
    const mouthK = ease(level !== null && level > live.mouth ? 32 : 18, dt); // open fast, close a touch slower
    live.mouth += (flap - live.mouth) * mouthK;
    live.open += ((shape ? shape.open : flap) - live.open) * mouthK;
    live.wide += ((shape?.wide ?? (s.talking ? 0.3 * flap : 0)) - live.wide) * mouthK;
    live.round += ((shape?.round ?? (s.talking ? 0.25 * flap * (0.5 + 0.5 * Math.sin(t * 3.1)) : 0)) - live.round) * mouthK;
    live.hiss += ((shape?.hiss ?? 0) - live.hiss) * ease(30, dt);

    // Blinks: random, plus one at the end of a phrase (people blink at pauses).
    const loud = (level ?? 0) > 0.08;
    if (wasLoud && !loud && t - blinkStart > 1.2 && Math.random() < 0.35) startBlink(t);
    wasLoud = loud;
    if (t > nextBlink) startBlink(t);
    const bt = (t - blinkStart) / 0.15;
    live.blink = bt >= 0 && bt <= 1 ? Math.sin(bt * Math.PI) : 0;

    const happy = s.mood === 'happy' || s.mood === 'excited' ? 1 : 0;
    // A resting half-smile reads as friendly; full smile for happy beats and a poke.
    const smileTarget = Math.max(0.18, happy * 0.75, now - s.pokedAt < 1600 ? 0.9 : 0);
    live.smile += (smileTarget - live.smile) * ease(3, dt);
    const curious = s.mood === 'curious' || g === 'think' ? 0.45 : 0;
    live.brow += (Math.min(0.7, curious + emphasis * 0.45 + (s.listening ? 0.2 : 0)) - live.brow) * ease(8, dt);
    live.frown += ((s.mood === 'alert' ? 0.55 : 0) - live.frown) * ease(4, dt);
    live.surprise += ((now - s.pokedAt < 450 ? 0.75 : 0) - live.surprise) * ease(now - s.pokedAt < 450 ? 18 : 5, dt);
    live.color.lerp(moodColor.set(MOOD_COLOR[s.mood]), ease(3, dt));
    return live;
  }

  return { step, dispose: () => window.removeEventListener('pointermove', onMove) };
}

export type Director = ReturnType<typeof createDirector>;
