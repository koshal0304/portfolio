import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

type P = [number, number];

/** Outline of a rounded link between two joints (for stroke drawing). */
function capsule([x1, y1]: P, [x2, y2]: P, w: number) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = ((y1 - y2) / len) * w;
  const ny = ((x2 - x1) / len) * w;
  const f = (n: number) => n.toFixed(1);
  return `M${f(x1 + nx)} ${f(y1 + ny)} L${f(x2 + nx)} ${f(y2 + ny)} A${w} ${w} 0 0 0 ${f(x2 - nx)} ${f(y2 - ny)} L${f(x1 - nx)} ${f(y1 - ny)} A${w} ${w} 0 0 0 ${f(x1 + nx)} ${f(y1 + ny)} Z`;
}

/** Angle-dimension arc around `c` from a0 to a1 degrees (clockwise on screen). */
function arc([cx, cy]: P, r: number, a0: number, a1: number) {
  const pt = (a: number) => `${(cx + r * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(cy + r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`;
  return `M${pt(a0)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(a1)}`;
}

const deg = ([x1, y1]: P, [x2, y2]: P) => (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

/** 0→1 over one stretch of the scroll range: when a part draws. */
const useSeg = (s: MotionValue<number>, a: number, b: number) => useTransform(s, [a, b], [0, 1]);

const SHOULDER: P = [160, 348];
const ELBOW: P = [98, 214];
const WRIST: P = [218, 132];
const PALM: P = [244, 150];

const L1 = Math.round(Math.hypot(ELBOW[0] - SHOULDER[0], ELBOW[1] - SHOULDER[1]));
const THETA = Math.round(deg(ELBOW, SHOULDER) - deg(ELBOW, WRIST));

const STRUCT = 'rgba(222,225,232,0.88)';
const DIM = 'rgba(165,180,252,0.75)';
const JOINT = '#f4b678';

const Draw: React.FC<{ d: string; p: MotionValue<number> | number; stroke?: string; width?: number }> = ({ d, p, stroke = STRUCT, width = 1.6 }) => (
  <motion.path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: p }} />
);

const Label: React.FC<{ x: number; y: number; o: MotionValue<number> | number; anchor?: 'start' | 'end'; children: string }> = ({ x, y, o, anchor = 'start', children }) => (
  <motion.text x={x} y={y} textAnchor={anchor} style={{ opacity: o }} className="fill-slate-400 font-mono text-[10px] uppercase tracking-[0.12em]">
    {children}
  </motion.text>
);

/** A robotic-arm schematic that draws itself as it scrolls into view, part by part, then annotates. */
const BlueprintArm: React.FC<{ tiltX: MotionValue<number>; tiltY: MotionValue<number> }> = ({ tiltX, tiltY }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: s } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.6'] });
  const base = useSeg(s, 0, 0.22);
  const upper = useSeg(s, 0.15, 0.42);
  const fore = useSeg(s, 0.35, 0.62);
  const hand = useSeg(s, 0.55, 0.78);
  const dims = useSeg(s, 0.7, 0.95);
  const tBase = useSeg(s, 0.2, 0.28);
  const tUpper = useSeg(s, 0.4, 0.48);
  const tFore = useSeg(s, 0.6, 0.68);
  const tHand = useSeg(s, 0.76, 0.84);
  const tDims = useSeg(s, 0.93, 1);
  const v = (m: MotionValue<number>) => (reduce ? 1 : m);

  const d1a: P = [SHOULDER[0] - 31, SHOULDER[1] + 14];
  const d1b: P = [ELBOW[0] - 31, ELBOW[1] + 14];
  const mid: P = [(d1a[0] + d1b[0]) / 2 - 6, (d1a[1] + d1b[1]) / 2];

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY }}
      className="mx-auto w-full max-w-[300px]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 440" className="h-auto w-full overflow-visible">
        {/* ground, base plate, turret */}
        <Draw d="M84 410 H236" p={v(base)} />
        <Draw d="M100 410 l-9 11 M120 410 l-9 11 M140 410 l-9 11 M160 410 l-9 11 M180 410 l-9 11 M200 410 l-9 11 M220 410 l-9 11" p={v(base)} width={1} />
        <Draw d="M96 410 V397 Q96 392 101 392 H219 Q224 392 224 397 V410" p={v(base)} />
        <Draw d="M120 392 L132 362 H188 L200 392" p={v(base)} />

        {/* shoulder joint + upper arm */}
        <motion.circle cx={SHOULDER[0]} cy={SHOULDER[1]} r={15} fill="none" stroke={JOINT} strokeWidth={1.6} style={{ pathLength: v(upper) }} />
        <motion.circle cx={SHOULDER[0]} cy={SHOULDER[1]} r={4} fill={JOINT} style={{ opacity: v(upper) }} />
        <Draw d={capsule(SHOULDER, ELBOW, 11)} p={v(upper)} />

        {/* elbow + forearm */}
        <motion.circle cx={ELBOW[0]} cy={ELBOW[1]} r={13} fill="none" stroke={JOINT} strokeWidth={1.6} style={{ pathLength: v(fore) }} />
        <motion.circle cx={ELBOW[0]} cy={ELBOW[1]} r={3.5} fill={JOINT} style={{ opacity: v(fore) }} />
        <Draw d={capsule(ELBOW, WRIST, 9)} p={v(fore)} />

        {/* wrist + gripper */}
        <motion.circle cx={WRIST[0]} cy={WRIST[1]} r={10} fill="none" stroke={JOINT} strokeWidth={1.6} style={{ pathLength: v(hand) }} />
        <Draw d={capsule(WRIST, PALM, 7)} p={v(hand)} />
        <Draw d={`M${PALM[0] + 4} ${PALM[1] - 4} l16 -10 l9 6 M${PALM[0] + 5} ${PALM[1] + 4} l13 13 l10 -3`} p={v(hand)} />

        {/* dimension lines */}
        <Draw d={`M${d1a[0]} ${d1a[1]} L${d1b[0]} ${d1b[1]}`} p={v(dims)} stroke={DIM} width={1} />
        <Draw d={`M${d1a[0] - 5} ${d1a[1] + 2} l10 -4 M${d1b[0] - 5} ${d1b[1] + 2} l10 -4`} p={v(dims)} stroke={DIM} width={1} />
        <Draw d={arc(ELBOW, 32, deg(ELBOW, WRIST), deg(ELBOW, SHOULDER))} p={v(dims)} stroke={DIM} width={1} />
        <motion.text
          x={mid[0]}
          y={mid[1]}
          textAnchor="middle"
          transform={`rotate(${(deg(SHOULDER, ELBOW) + 180).toFixed(1)} ${mid[0]} ${mid[1]})`}
          style={{ opacity: v(tDims) }}
          className="fill-indigo-200 font-mono text-[10px] tracking-[0.1em]"
        >
          {`L1 · ${L1} MM`}
        </motion.text>
        <motion.text x={ELBOW[0] + 40} y={ELBOW[1] + 12} style={{ opacity: v(tDims) }} className="fill-indigo-200 font-mono text-[10px] tracking-[0.1em]">
          {`θ · ${THETA}°`}
        </motion.text>

        <Label x={210} y={384} o={v(tBase)}>J1 · base yaw</Label>
        <Label x={182} y={352} o={v(tUpper)}>J2 · shoulder</Label>
        <Label x={80} y={198} o={v(tFore)} anchor="end">J3 · elbow</Label>
        <Label x={226} y={116} o={v(tHand)}>J4 · wrist</Label>
        <Label x={262} y={182} o={v(tHand)}>EE · gripper</Label>
      </svg>
    </motion.div>
  );
};

export default BlueprintArm;
