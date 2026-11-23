import React, { useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CHAPTER_IDS } from '../data/chapters';
import { scrollVelocity } from '../lib/smoothScroll';
import { voiceLevel } from './guide/speech';

// The page's world, in one canvas. A dusk sky whose light changes mood chapter by chapter, slow
// cloud veils, drifting dust with a "neural" web around the cursor, and the swarm: a few thousand
// particles that reassemble into each chapter's idea as you scroll (a halo around the twin, an
// embedding galaxy, a time helix, a neural net, a pipeline tunnel, columns of light at the real
// metrics, a gear, a portal). They part around the cursor and swell with the twin's voice.

const pointer = { x: -1e4, y: -1e4, nx: 0.5, ny: 0.5 };
const onPointer = (e: PointerEvent) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.nx = e.clientX / innerWidth;
  pointer.ny = 1 - e.clientY / innerHeight;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const scrollProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  return max > 0 ? Math.min(1, scrollY / max) : 0;
};

/** Continuous chapter coordinate: 2.4 = in chapter 2, 40% of the way into the morph toward chapter 3. */
function chapterCoordinate() {
  const anchor = innerHeight * 0.55;
  let idx = 0;
  let next = Infinity;
  for (let i = 0; i < CHAPTER_IDS.length; i++) {
    const top = document.getElementById(CHAPTER_IDS[i])?.getBoundingClientRect().top ?? Infinity;
    if (top <= anchor) idx = i;
    else if (i === idx + 1) next = top;
  }
  if (idx >= CHAPTER_IDS.length - 1) return CHAPTER_IDS.length - 1;
  // The next shape assembles while the next chapter rises into view, however long this one is.
  const t = clamp01(1 - (next - anchor) / (innerHeight * 0.55));
  return idx + t * t * (3 - 2 * t);
}

// Each chapter's light: warm gold → periwinkle lab → amber career → mint stack → rose work → gold → ice → sunset.
const MOODS = ['#f4b678', '#a5b4fc', '#f8c690', '#7ee0c0', '#f5a3b7', '#fddbb4', '#bcd3ff', '#f7a072'].map((c) => new THREE.Color(c));
// Where the light pool sits per chapter (uv): behind the twin first, then wherever the shape is.
const POOLS: [number, number][] = [
  [0.74, 0.64],
  [0.5, 0.72],
  [0.5, 0.36],
  [0.5, 0.56],
  [0.5, 0.5],
  [0.5, 0.3],
  [0.76, 0.56],
  [0.5, 0.58],
];

const SKY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const SKY_FRAG = /* glsl */ `
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uPool;
  uniform vec3 uMood;
  uniform float uScroll;
  uniform float uScrollPx;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + 7.1; a *= 0.5; }
    return v;
  }
  float pool(vec2 p, vec2 c, float r) { vec2 d = (p - c) / r; return exp(-dot(d, d)); }
  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(vUv.x * aspect, vUv.y);
    float s = uScroll, t = uTime;
    vec3 top = mix(vec3(0.290, 0.314, 0.380), vec3(0.255, 0.278, 0.353), s);
    vec3 bottom = mix(vec3(0.200, 0.216, 0.271), vec3(0.165, 0.180, 0.235), s);
    vec3 col = mix(bottom, top, smoothstep(-0.1, 1.05, vUv.y));
    // The chapter's light pool, tinted by its mood.
    vec2 warm = vec2(uPool.x * aspect + 0.03 * sin(t * 0.07), uPool.y + 0.04 * cos(t * 0.05));
    col += uMood * pool(p, warm, 0.55) * 0.15;
    vec2 cool = vec2(aspect * (0.16 + 0.04 * cos(t * 0.06)), 0.22 + 0.05 * sin(t * 0.045));
    col += vec3(0.647, 0.706, 0.988) * pool(p, cool, 0.75) * mix(0.05, 0.1, s);
    // Slow luminous veils that drift and parallax with the scroll, catching the mood light.
    vec2 q = vec2(p.x * 0.8, p.y * 1.5) + vec2(t * 0.012, -uScrollPx * 0.00012);
    float veil = smoothstep(0.44, 0.76, fbm(q * 1.7));
    col += (uMood * 0.05 + 0.012) * veil;
    col += vec3(1.0, 0.86, 0.72) * pool(p, vec2(uMouse.x * aspect, uMouse.y), 0.35) * 0.045;
    vec2 v = vUv - 0.5;
    col *= 1.0 - dot(v, v) * 0.5;
    col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) * (2.0 / 255.0); // dither: no banding
    gl_FragColor = vec4(col, 1.0);
  }
`;

const Sky: React.FC<{ still: boolean; chapter: { current: number } }> = ({ still, chapter }) => {
  const { size } = useThree();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uRes: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uPool: { value: new THREE.Vector2(0.74, 0.64) },
          uMood: { value: MOODS[0].clone() },
          uScroll: { value: 0 },
          uScrollPx: { value: 0 },
        },
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);
  const mood = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const u = material.uniforms;
    u.uRes.value.set(size.width, size.height);
    u.uScroll.value = scrollProgress();
    u.uScrollPx.value = scrollY;
    const c = chapter.current;
    const a = Math.floor(c);
    const b = Math.min(a + 1, MOODS.length - 1);
    const k = c - a;
    mood.copy(MOODS[a]).lerp(MOODS[b], k);
    u.uMood.value.lerp(mood, still ? 1 : 1 - Math.exp(-delta * 3));
    const phone = size.width < 768;
    const px = phone ? 0.5 : POOLS[a][0] + (POOLS[b][0] - POOLS[a][0]) * k;
    const py = phone ? 0.75 : POOLS[a][1] + (POOLS[b][1] - POOLS[a][1]) * k;
    u.uPool.value.set(px, py);
    if (still) return;
    u.uTime.value = state.clock.elapsedTime;
    const m = 1 - Math.exp(-delta * 2.5);
    u.uMouse.value.x += (pointer.nx - u.uMouse.value.x) * m;
    u.uMouse.value.y += (pointer.ny - u.uMouse.value.y) * m;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-2} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};

// ─── The swarm ────────────────────────────────────────────────────────────────────────────────
const TAU = Math.PI * 2;

/** Deterministic randomness, so the shapes are the same on every visit. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildShapes(n: number) {
  const rand = rng(7);
  const gauss = () => Math.sqrt(-2 * Math.log(rand() || 1e-6)) * Math.cos(TAU * rand());
  const shapes = Array.from({ length: 8 }, () => new Float32Array(n * 3));
  const set = (k: number, i: number, x: number, y: number, z: number) => shapes[k].set([x, y, z], i * 3);

  const clusters = [
    [-1.7, 0.6, 0],
    [1.6, 0.9, -0.4],
    [0.1, -1.1, 0.3],
  ];
  const query = [0.3, 0.15, 0.9];
  const layers = [5, 7, 7, 4];
  const nodes = layers.map((count, l) => Array.from({ length: count }, (_, j) => [-3 + l * 2, (j - (count - 1) / 2) * 0.72, -Math.abs(j - (count - 1) / 2) * 0.12]));
  const metrics = [0.69, 0.98, 0.6, 0.8];

  for (let i = 0; i < n; i++) {
    let r = rand();
    // 0 · Hello: two orbit rings and a faint aura around the twin.
    {
      let a = rand() * TAU;
      if (r < 0.55) set(0, i, Math.cos(a) * (1.85 + gauss() * 0.05), gauss() * 0.03, Math.sin(a) * (1.85 + gauss() * 0.05));
      else if (r < 0.78) set(0, i, Math.cos(a) * (1.4 + gauss() * 0.03), gauss() * 0.02, Math.sin(a) * (1.4 + gauss() * 0.03));
      else {
        const u = rand() * 2 - 1;
        a = rand() * TAU;
        const rad = 2.2 + rand() * 0.7;
        const s = Math.sqrt(1 - u * u);
        set(0, i, Math.cos(a) * s * rad, u * rad, Math.sin(a) * s * rad);
      }
    }
    // 1 · Live lab: three embedding clusters, filaments from a bright query point.
    {
      const c = clusters[i % 3];
      if (r < 0.82) set(1, i, c[0] + gauss() * 0.5, c[1] + gauss() * 0.5, c[2] + gauss() * 0.5);
      else if (r < 0.95) {
        const t = rand();
        set(1, i, query[0] + (c[0] - query[0]) * t + gauss() * 0.03, query[1] + (c[1] - query[1]) * t + gauss() * 0.03, query[2] + (c[2] - query[2]) * t + gauss() * 0.03);
      } else set(1, i, query[0] + gauss() * 0.07, query[1] + gauss() * 0.07, query[2] + gauss() * 0.07);
    }
    // 2 · Career: a double helix running across the screen, with rungs.
    {
      let t = rand();
      let a = t * TAU * 4 + (i % 2) * Math.PI;
      let s = 1;
      if (r < 0.14) {
        t = Math.floor(rand() * 44) / 44;
        a = t * TAU * 4;
        s = rand() * 2 - 1;
      }
      set(2, i, (t - 0.5) * 11.5, Math.cos(a) * 0.85 * s + gauss() * 0.025, Math.sin(a) * 0.85 * s + gauss() * 0.025);
    }
    // 3 · Stack: a neural net, nodes and the weights between layers.
    {
      if (r < 0.34) {
        const layer = nodes[(rand() * nodes.length) | 0];
        const p = layer[(rand() * layer.length) | 0];
        set(3, i, p[0] + gauss() * 0.06, p[1] + gauss() * 0.06, p[2] + gauss() * 0.06);
      } else {
        const l = (rand() * 3) | 0;
        const a = nodes[l][(rand() * nodes[l].length) | 0];
        const b = nodes[l + 1][(rand() * nodes[l + 1].length) | 0];
        const t = rand();
        set(3, i, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + gauss() * 0.012, a[2] + (b[2] - a[2]) * t);
      }
    }
    // 4 · Work: a pipeline tunnel of rings you look straight down, with data flowing through.
    {
      const a = rand() * TAU;
      if (r < 0.16) {
        const rad = rand() * 0.3;
        set(4, i, Math.cos(a) * rad, Math.sin(a) * rad, 2 - rand() * 13);
      } else {
        const k = (rand() * 6) | 0;
        const rad = 1.9 + gauss() * 0.04;
        set(4, i, Math.cos(a) * rad, Math.sin(a) * rad, 1.5 - k * 2.2 + gauss() * 0.02);
      }
    }
    // 5 · Impact: columns of light at the real numbers (69, 98, 60, 80), glowing caps.
    {
      const k = i % 4;
      const h = metrics[k] * 3.2;
      const w = 0.62;
      const x0 = -2.1 + k * 1.4;
      r = rand();
      if (r < 0.2) set(5, i, x0 + (rand() - 0.5) * w, h - 1.6, (rand() - 0.5) * w);
      else if (r < 0.72) {
        const e = (rand() * 4) | 0;
        set(5, i, x0 + (e & 1 ? 0.5 : -0.5) * w, rand() * h - 1.6, (e & 2 ? 0.5 : -0.5) * w);
      } else set(5, i, x0 + (rand() - 0.5) * w, rand() * h - 1.6, (rand() < 0.5 ? -0.5 : 0.5) * w);
    }
    // 6 · Foundations: a machined gear (robotics first).
    {
      const a = rand() * TAU;
      const tooth = Math.cos(a * 14) > 0.15 ? 1 : 0;
      const outer = 1.4 + tooth * 0.3;
      r = rand();
      const rad = r < 0.55 ? outer : r < 0.8 ? 0.75 + rand() * (outer - 0.75) : r < 0.9 ? 0.38 + gauss() * 0.02 : 0.75 + gauss() * 0.015;
      set(6, i, Math.cos(a) * rad, Math.sin(a) * rad, (rand() - 0.5) * 0.32);
    }
    // 7 · Contact: a three-armed portal vortex, drawing everything in.
    {
      if (r < 0.08) {
        const a = rand() * TAU;
        set(7, i, Math.cos(a) * 0.28, Math.sin(a) * 0.28, gauss() * 0.03);
      } else {
        const rad = 0.25 + Math.sqrt(rand()) * 2.7;
        const a = ((i % 3) * TAU) / 3 + rad * 1.9 + gauss() * 0.16;
        set(7, i, Math.cos(a) * rad, Math.sin(a) * rad, -rad * 0.35 + gauss() * 0.05);
      }
    }
  }

  const seeds = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) seeds.set([rand(), rand(), rand() ** 3, rand()], i * 4);
  return { shapes, seeds };
}

// Placement per chapter: centre xyz + scale, then spin speeds (around x, y, z) and a fixed tilt.
const PLACE = [
  { c: [2.55, 0.35, -1.2], s: 1.0, spin: [0, 0.18, 0], tilt: 1.2 }, // halo around the twin
  { c: [0, 0.55, -3.5], s: 1.25, spin: [0, 0.06, 0], tilt: 0.15 }, // galaxy behind the title
  { c: [0, -2.45, -2.5], s: 0.9, spin: [0.35, 0, 0], tilt: 0.05 }, // helix along the timeline rail, turning
  { c: [0, 0.2, -4.5], s: 1.15, spin: [0, 0, 0], sway: 0.45, tilt: 0.1 }, // neural net, swaying (flat: a full spin would go edge-on)
  { c: [0, 0, -1.0], s: 1.0, spin: [0, 0, 0.08], tilt: 0 }, // tunnel straight ahead
  { c: [0, 1.5, -4.5], s: 1.0, spin: [0, 0, 0], sway: 0.35, tilt: 0.12 }, // columns rising behind the headline, swaying
  { c: [2.8, 0.2, -3], s: 1.1, spin: [0, 0, 0.18], tilt: 0.3 }, // gear, turning
  { c: [0, 0.3, -3.5], s: 1.25, spin: [0, 0, 0.25], tilt: 0.45 }, // vortex, swirling
];
const COLORS = ['#f4b678', '#a5b4fc', '#f8c690', '#7ee0c0', '#f5a3b7', '#fddbb4', '#cfe1ff', '#f7a072'].map((c) => new THREE.Color(c));

const SWARM_VERT = /* glsl */ `
  attribute vec3 aF1;
  attribute vec3 aF2;
  attribute vec3 aF3;
  attribute vec3 aF4;
  attribute vec3 aF5;
  attribute vec3 aF6;
  attribute vec3 aF7;
  attribute vec4 aSeed; // brightness, morph delay, size, phase
  uniform int uA;
  uniform int uB;
  uniform float uT;
  uniform float uTime;
  uniform float uVoice;
  uniform float uVel;
  uniform float uAlpha;
  uniform float uPx;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform vec4 uPlace[8];
  uniform vec4 uRot[8];
  uniform vec3 uColor[8];
  uniform mat4 uView;
  uniform mat4 uProj;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 shape(int i) {
    if (i == 0) return position;
    if (i == 1) return aF1;
    if (i == 2) return aF2;
    if (i == 3) return aF3;
    if (i == 4) return aF4;
    if (i == 5) return aF5;
    if (i == 6) return aF6;
    return aF7;
  }
  vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
  vec3 rotZ(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z); }
  vec3 place(int i) {
    vec4 r = uRot[i], pl = uPlace[i];
    vec3 p = rotX(rotY(rotZ(rotX(shape(i), r.x), r.z), r.y), r.w);
    return p * pl.w + pl.xyz;
  }

  void main() {
    float k = clamp((uT - aSeed.y * 0.4) / 0.6, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vec3 p = mix(place(uA), place(uB), k);
    float ph = aSeed.w * 6.2831;
    float flight = sin(k * 3.14159);
    // Between shapes, particles arc through space instead of sliding in straight lines.
    p += vec3(sin(p.y * 1.3 + uTime + ph), sin(p.z * 1.1 + uTime * 1.3 + ph), sin(p.x * 0.9 + uTime * 0.8 + ph)) * flight * 0.6;
    p += vec3(sin(uTime * 0.6 + ph), cos(uTime * 0.5 + ph * 1.3), sin(uTime * 0.4 + ph * 0.7)) * 0.035;
    p.y += uVel * (aSeed.x - 0.5) * 0.3; // scroll speed shears the swarm like wind

    vec4 mv = uView * vec4(p, 1.0);
    vec4 clip = uProj * mv;
    // The swarm parts around the cursor.
    vec2 ndc = clip.xy / clip.w;
    vec2 dm = (ndc - uMouse) * vec2(uAspect, 1.0);
    float push = (1.0 - smoothstep(0.0, 0.3, length(dm))) * 0.11;
    ndc += normalize(dm + 1e-5) / vec2(uAspect, 1.0) * push;
    gl_Position = vec4(ndc * clip.w, clip.zw);

    float voice = 1.0 + uVoice * 0.9;
    gl_PointSize = (1.0 + aSeed.z * 2.2) * voice * uPx / max(0.5, -mv.z);
    vColor = mix(mix(uColor[uA], uColor[uB], k), vec3(1.0), aSeed.x * 0.35);
    vAlpha = uAlpha * (0.4 + 0.6 * aSeed.x) * (0.8 + 0.5 * uVoice) * (1.0 - smoothstep(-2.5, -0.8, mv.z)) * smoothstep(-18.0, -6.0, mv.z);
  }
`;

const SWARM_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(vColor, vAlpha * (1.0 - smoothstep(0.05, 0.5, d)));
  }
`;

const Swarm: React.FC<{ count: number; chapter: { current: number } }> = ({ count, chapter }) => {
  const { size, gl } = useThree();
  const { geo, mat, cam, voice } = useMemo(() => {
    const { shapes, seeds } = buildShapes(count);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(shapes[0], 3));
    for (let k = 1; k < 8; k++) geo.setAttribute(`aF${k}`, new THREE.BufferAttribute(shapes[k], 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    const mat = new THREE.ShaderMaterial({
      vertexShader: SWARM_VERT,
      fragmentShader: SWARM_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uA: { value: 0 },
        uB: { value: 1 },
        uT: { value: 0 },
        uTime: { value: 0 },
        uVoice: { value: 0 },
        uVel: { value: 0 },
        uAlpha: { value: 0.7 },
        uPx: { value: 1 },
        uAspect: { value: 1 },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uPlace: { value: PLACE.map(() => new THREE.Vector4()) },
        uRot: { value: PLACE.map(() => new THREE.Vector4()) },
        uColor: { value: COLORS },
        uView: { value: new THREE.Matrix4() },
        uProj: { value: new THREE.Matrix4() },
      },
    });
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
    return { geo, mat, cam, voice: { level: 0 } };
  }, [count]);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat]
  );

  useFrame((state, delta) => {
    const u = mat.uniforms;
    const t = state.clock.elapsedTime;
    const phone = size.width < 768;
    const c = chapter.current;
    const a = Math.floor(c);
    u.uA.value = a;
    u.uB.value = Math.min(a + 1, 7);
    u.uT.value = c - a;
    u.uTime.value = t;
    voice.level += ((voiceLevel() ?? 0) - voice.level) * (1 - Math.exp(-delta * 12));
    u.uVoice.value = voice.level;
    u.uVel.value += (Math.max(-40, Math.min(40, scrollVelocity())) * 0.03 - u.uVel.value) * (1 - Math.exp(-delta * 4));
    u.uAlpha.value = phone ? 0.5 : 0.7;
    u.uAspect.value = size.width / size.height;
    PLACE.forEach((pl, i) => {
      // Phones: every shape centred and smaller, behind the content; the halo rises to ring the twin's portrait.
      u.uPlace.value[i].set(phone ? pl.c[0] * 0.2 : pl.c[0], phone && i === 0 ? 1.45 : pl.c[1], pl.c[2], pl.s * (phone ? 0.72 : 1));
      u.uRot.value[i].set(pl.spin[0] * t, pl.sway ? pl.sway * Math.sin(t * 0.3) : pl.spin[1] * t, pl.spin[2] * t, pl.tilt);
    });
    const mx = pointer.x > -1e3 ? pointer.nx * 2 - 1 : 9;
    const my = pointer.x > -1e3 ? pointer.ny * 2 - 1 : 9;
    u.uMouse.value.set(mx, my);

    // A gentle camera: drifts with the cursor, bobs between chapters.
    cam.aspect = size.width / size.height;
    cam.position.set((mx < 2 ? mx : 0) * 0.35, (my < 2 ? my : 0) * 0.22 + Math.sin((c % 1) * Math.PI) * 0.25, 8);
    cam.lookAt(0, 0, -2);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    u.uView.value.copy(cam.matrixWorldInverse);
    u.uProj.value.copy(cam.projectionMatrix);
    u.uPx.value = ((size.height * gl.getPixelRatio()) / (2 * Math.tan((cam.fov * Math.PI) / 360))) * 0.022;
  });

  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={-1} />;
};

// ─── Dust + neural web around the cursor (screen space) ───────────────────────────────────────
const MOTE_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec4 aColor;
  uniform float uDpr;
  varying vec4 vColor;
  void main() {
    vColor = aColor;
    gl_PointSize = aSize * uDpr;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const MOTE_FRAG = /* glsl */ `
  varying vec4 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = 1.0 - smoothstep(0.0, 0.5, d);
    gl_FragColor = vec4(vColor.rgb, vColor.a * a * a);
  }
`;

const LINK_RADIUS = 170; // px around the cursor where motes start to connect
const LINK_LENGTH = 115;
const MAX_LINKS = 160;

const Motes: React.FC<{ count: number; still: boolean }> = ({ count, still }) => {
  const { size, gl } = useThree();

  const m = useMemo(() => {
    const seeds = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.pow(Math.random(), 1.7), // most motes far away, a few close and soft
      speed: 0.004 + Math.random() * 0.01,
      phase: Math.random() * Math.PI * 2,
      warm: Math.random(),
    }));
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 4);
    const sz = new Float32Array(count);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 4).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.ShaderMaterial({
      vertexShader: MOTE_VERT,
      fragmentShader: MOTE_FRAG,
      uniforms: { uDpr: { value: 1 } },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const linkPos = new Float32Array(MAX_LINKS * 6);
    const linkCol = new Float32Array(MAX_LINKS * 6);
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3).setUsage(THREE.DynamicDrawUsage));
    linkGeo.setAttribute('color', new THREE.BufferAttribute(linkCol, 3).setUsage(THREE.DynamicDrawUsage));
    const linkMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const screen = new Float32Array(count * 2);
    return { seeds, pos, col, sz, geo, mat, linkPos, linkCol, linkGeo, linkMat, screen };
  }, [count]);

  useEffect(
    () => () => {
      m.geo.dispose();
      m.mat.dispose();
      m.linkGeo.dispose();
      m.linkMat.dispose();
    },
    [m]
  );

  useFrame((state) => {
    const t = still ? 0 : state.clock.elapsedTime;
    const W = size.width;
    const H = size.height;
    const s = scrollProgress();
    const sy = scrollY / H;
    m.mat.uniforms.uDpr.value = gl.getPixelRatio();

    for (let i = 0; i < count; i++) {
      const p = m.seeds[i];
      const fx = (((p.x + 0.015 * Math.sin(t * 0.2 + p.phase) * (0.5 + p.z)) % 1) + 1) % 1;
      const fy = (((p.y - t * p.speed - sy * (0.12 + 0.55 * p.z)) % 1) + 1) % 1;
      let x = fx * W;
      let y = fy * H;
      // Motes part gently around the cursor.
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < 130 && d > 0.01) {
        const push = (1 - d / 130) ** 2 * 26 * (0.4 + p.z);
        x += (dx / d) * push;
        y += (dy / d) * push;
      }
      m.screen[i * 2] = x;
      m.screen[i * 2 + 1] = y;
      m.pos[i * 3] = x - W / 2;
      m.pos[i * 3 + 1] = H / 2 - y;
      const z2 = p.z * p.z;
      m.sz[i] = 1.4 + z2 * 10;
      const twinkle = 0.65 + 0.35 * Math.sin(t * 1.3 + p.phase * 3);
      // Warm gold near the top of the page, cooler starlight toward blue hour.
      const warm = Math.max(0, Math.min(1, p.warm * 1.4 - s * 0.9));
      m.col[i * 4] = 0.86 + 0.14 * warm;
      m.col[i * 4 + 1] = 0.88 - 0.05 * warm;
      m.col[i * 4 + 2] = 1.0 - 0.3 * warm;
      m.col[i * 4 + 3] = (0.2 + 0.45 * p.z) * twinkle * (1 - z2 * 0.55);
    }
    m.geo.attributes.position.needsUpdate = true;
    m.geo.attributes.aColor.needsUpdate = true;
    m.geo.attributes.aSize.needsUpdate = true;

    // Neural web: link nearby motes, only inside the cursor's light.
    let links = 0;
    if (!still && pointer.x > -1e3) {
      const near: number[] = [];
      for (let i = 0; i < count; i++) {
        if (Math.hypot(m.screen[i * 2] - pointer.x, m.screen[i * 2 + 1] - pointer.y) < LINK_RADIUS) near.push(i);
      }
      for (let a = 0; a < near.length && links < MAX_LINKS; a++) {
        for (let b = a + 1; b < near.length && links < MAX_LINKS; b++) {
          const i = near[a];
          const j = near[b];
          const ax = m.screen[i * 2];
          const ay = m.screen[i * 2 + 1];
          const bx = m.screen[j * 2];
          const by = m.screen[j * 2 + 1];
          const len = Math.hypot(ax - bx, ay - by);
          if (len > LINK_LENGTH) continue;
          const fade = Math.hypot((ax + bx) / 2 - pointer.x, (ay + by) / 2 - pointer.y) / LINK_RADIUS;
          const a2 = 0.28 * (1 - len / LINK_LENGTH) * Math.max(0, 1 - fade);
          const o = links * 6;
          m.linkPos.set([ax - W / 2, H / 2 - ay, 0, bx - W / 2, H / 2 - by, 0], o);
          m.linkCol.set([a2, a2 * 0.82, a2 * 0.62, a2, a2 * 0.82, a2 * 0.62], o);
          links++;
        }
      }
    }
    m.linkGeo.setDrawRange(0, links * 2);
    m.linkGeo.attributes.position.needsUpdate = true;
    m.linkGeo.attributes.color.needsUpdate = true;
  });

  return (
    <>
      <lineSegments geometry={m.linkGeo} material={m.linkMat} frustumCulled={false} />
      <points geometry={m.geo} material={m.mat} frustumCulled={false} />
    </>
  );
};

/** Tracks the chapter coordinate once per frame for everything in the world (smoothed, never jumps). */
const Chapter: React.FC<{ chapter: { current: number }; still: boolean }> = ({ chapter, still }) => {
  useFrame((_, delta) => {
    const target = chapterCoordinate();
    chapter.current = still ? Math.round(target) : chapter.current + (target - chapter.current) * (1 - Math.exp(-delta * 5));
  });
  return null;
};

const DuskField: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const chapter = useMemo(() => ({ current: 0 }), []);
  useEffect(() => {
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => window.removeEventListener('pointermove', onPointer);
  }, []);
  const small = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        orthographic
        dpr={1}
        camera={{ position: [0, 0, 10], zoom: 1 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <Chapter chapter={chapter} still={reducedMotion} />
        <Sky still={reducedMotion} chapter={chapter} />
        {!reducedMotion && <Swarm count={small ? 2600 : 7000} chapter={chapter} />}
        <Motes count={small ? 110 : 240} still={reducedMotion} />
      </Canvas>
    </div>
  );
};

export default DuskField;
