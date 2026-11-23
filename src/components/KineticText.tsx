import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { EASE, type TitlePreset } from '../lib/kineticPresets';

const GLYPHS = '01<>/#*+=_ABCDEFKLMNRSTXZλΔΩ';

/**
 * Magnetic3D — smooth spring-driven magnetic pull + optional subtle 3D perspective tilt
 * toward the cursor on pointer devices. Automatically stays static for touch & reduced motion.
 */
interface Magnetic3DProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  tilt?: number;
}

export const Magnetic3D: React.FC<Magnetic3DProps> = ({
  children,
  className = '',
  strength = 0.24,
  tilt = 0,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.45 });
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.45 });
  const rx = useSpring(0, { stiffness: 240, damping: 20, mass: 0.5 });
  const ry = useSpring(0, { stiffness: 240, damping: 20, mass: 0.5 });

  return (
    <motion.span
      ref={ref}
      style={
        reduce
          ? undefined
          : {
              x,
              y,
              rotateX: tilt ? rx : undefined,
              rotateY: tilt ? ry : undefined,
              transformPerspective: tilt ? 700 : undefined,
            }
      }
      className={`inline-flex ${className}`}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        x.set(nx * r.width * strength);
        y.set(ny * r.height * strength * 1.25);
        if (tilt) {
          ry.set(nx * tilt * 2);
          rx.set(-ny * tilt * 2);
        }
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.span>
  );
};

/**
 * ScrambleText — cyber-telemetry decoder with an illuminated phosphor lead glyph.
 * Can trigger on view and optionally re-decode on hover.
 */
interface ScrambleTextProps {
  text: string;
  trigger?: boolean;
  retriggerOnHover?: boolean;
  durationMs?: number;
  className?: string;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  trigger = true,
  retriggerOnHover = false,
  durationMs = 720,
  className = '',
}) => {
  const reduce = useReducedMotion();
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<{ text: string; head: number }>({ text, head: text.length });

  useEffect(() => {
    if (!trigger || reduce) {
      setState({ text, head: text.length });
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / durationMs);
      const solved = Math.floor(k * text.length);
      const rendered = text
        .split('')
        .map((ch, i) => (i < solved || ch === ' ' || ch === '·' || ch === '—' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join('');
      setState({ text: rendered, head: solved });
      if (k < 1) frame = requestAnimationFrame(tick);
      else setState({ text, head: text.length });
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, trigger, durationMs, reduce, nonce]);

  const decoding = state.head < text.length;

  return (
    <span
      className={className}
      onMouseEnter={retriggerOnHover && !reduce ? () => setNonce((n) => n + 1) : undefined}
    >
      <span aria-hidden="true">
        {decoding ? (
          <>
            <span>{state.text.slice(0, state.head)}</span>
            <span className="text-accent-300">{state.text.slice(state.head, state.head + 2)}</span>
            <span className="opacity-65">{state.text.slice(state.head + 2)}</span>
          </>
        ) : (
          state.text
        )}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
};

/**
 * SlotRollText — 3D kinetic character cube-roll on hover or active state.
 * Each letter rolls smoothly along the X-axis with micro-staggered precision.
 */
interface SlotRollTextProps {
  text: string;
  active?: boolean;
  className?: string;
  accentClassName?: string;
}

export const SlotRollText: React.FC<SlotRollTextProps> = ({
  text,
  active = false,
  className = '',
  accentClassName = 'text-accent-200',
}) => {
  const reduce = useReducedMotion();
  const chars = useMemo(() => Array.from(text), [text]);

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`slot-roll-root relative -my-[0.08em] inline-flex overflow-hidden leading-[1.36] ${className}`} data-active={active ? 'true' : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((ch, i) => (
          <span
            key={i}
            className="slot-roll-char relative inline-block h-[1.36em] [perspective:400px]"
            style={{ ['--char-i' as string]: i }}
          >
            <span className="slot-roll-track block h-[1.36em] [transform-style:preserve-3d]">
              <span className="slot-roll-face slot-roll-front block h-[1.36em]">
                {ch === ' ' ? '\u00A0' : ch}
              </span>
              <span className={`slot-roll-face slot-roll-bottom absolute inset-0 block h-[1.36em] ${accentClassName}`}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
};

/**
 * DimensionalTitle — 3D kinetic display headline engine with 8 distinct animation signatures
 * so every chapter across the portfolio owns a unique motion-design choreography.
 */
interface DimensionalTitleProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  preset?: TitlePreset;
  inView?: boolean;
  interactive?: boolean;
  accentWords?: number[];
  shader?: 'none' | 'gold' | 'prism' | 'holo';
  extrude?: boolean;
  className?: string;
  delay?: number;
}

function getCharInitial(preset: TitlePreset, charIdx: number, total: number, wordIdx: number) {
  const mid = (total - 1) / 2;
  const distFromCenter = charIdx - mid;
  switch (preset) {
    case 'prism':
      return {
        y: '115%',
        rotateX: -72,
        rotateY: distFromCenter * 1.4,
        z: -60,
        opacity: 0,
        filter: 'blur(8px)',
      };
    case 'hologram':
      return {
        y: charIdx % 2 === 0 ? -24 : 24,
        rotateX: charIdx % 2 === 0 ? 55 : -55,
        z: -90,
        scale: 0.84,
        opacity: 0,
        filter: 'blur(7px)',
      };
    case 'ribbon':
      return {
        y: '95%',
        rotateX: -88,
        skewY: 6,
        z: -45,
        opacity: 0,
      };
    case 'lattice':
      return {
        y: Math.sin(charIdx * 0.9) * 26,
        z: -110,
        scale: 0.55,
        rotateY: distFromCenter * 4,
        opacity: 0,
        filter: 'blur(6px)',
      };
    case 'architect':
      return {
        y: '112%',
        rotateX: -48,
        skewY: wordIdx % 2 === 0 ? 5 : -5,
        opacity: 0,
      };
    case 'odometer':
      return {
        y: '-105%',
        rotateX: 82,
        opacity: 0,
      };
    case 'blueprint':
      return {
        x: (charIdx % 2 === 0 ? -1 : 1) * 14,
        rotateY: 68,
        scale: 0.88,
        opacity: 0,
      };
    case 'vortex':
      return {
        x: distFromCenter * 9,
        y: 32,
        rotateZ: distFromCenter * 1.8,
        rotateX: -40,
        scale: 0.82,
        opacity: 0,
        filter: 'blur(5px)',
      };
  }
}

function getCharDelay(preset: TitlePreset, charIdx: number, total: number, wordIdx: number, baseDelay: number) {
  const mid = (total - 1) / 2;
  switch (preset) {
    case 'prism':
      return baseDelay + charIdx * 0.024;
    case 'hologram':
      return baseDelay + charIdx * 0.022 + (charIdx % 3) * 0.03;
    case 'ribbon':
      return baseDelay + wordIdx * 0.095;
    case 'lattice':
      return baseDelay + Math.abs(charIdx - mid) * 0.032;
    case 'architect':
      return baseDelay + wordIdx * 0.08 + (charIdx % 5) * 0.015;
    case 'odometer':
      return baseDelay + charIdx * 0.028;
    case 'blueprint':
      return baseDelay + charIdx * 0.026;
    case 'vortex':
      return baseDelay + (Math.abs(mid) - Math.abs(charIdx - mid)) * 0.024 + 0.04;
  }
}

export const DimensionalTitle: React.FC<DimensionalTitleProps> = ({
  text,
  as = 'h2',
  preset = 'prism',
  inView: externalInView,
  interactive = true,
  accentWords = [],
  shader = 'none',
  extrude = false,
  className = '',
  delay = 0.08,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const internalInView = useInView(hostRef, { once: true, margin: '-10% 0px' });
  const visible = externalInView ?? internalInView;
  const reduce = useReducedMotion();

  // Subtle pointer-reactive 3D plane tilt for interactive display titles
  const rawRx = useMotionValue(0);
  const rawRy = useMotionValue(0);
  const tiltX = useSpring(rawRx, { stiffness: 150, damping: 22 });
  const tiltY = useSpring(rawRy, { stiffness: 150, damping: 22 });

  const words = useMemo(() => text.split(' '), [text]);
  const totalChars = useMemo(() => text.replace(/\s/g, '').length, [text]);
  const accentSet = useMemo(() => new Set(accentWords), [accentWords]);

  const shaderClass =
    shader === 'gold'
      ? 'text-shader-gold'
      : shader === 'prism'
        ? 'text-shader-prism'
        : shader === 'holo'
          ? 'text-shader-holo'
          : '';

  const extrudeClass = extrude
    ? preset === 'hologram' || preset === 'blueprint'
      ? 'text-extrude-holo'
      : 'text-extrude-gold'
    : '';

  const Tag = as;
  const maskClip = preset === 'architect' || preset === 'ribbon' || preset === 'odometer';
  const wordBased = preset === 'ribbon';

  let runningIdx = 0;

  return (
    <div
      ref={hostRef}
      className="[perspective:1100px]"
      onPointerMove={
        interactive && !reduce
          ? (e) => {
              if (e.pointerType !== 'mouse' || !hostRef.current) return;
              const r = hostRef.current.getBoundingClientRect();
              const nx = (e.clientX - r.left) / r.width - 0.5;
              const ny = (e.clientY - r.top) / r.height - 0.5;
              rawRy.set(nx * 6);
              rawRx.set(-ny * 5);
              hostRef.current.style.setProperty('--tx-light', `${((nx + 0.5) * 100).toFixed(1)}%`);
            }
          : undefined
      }
      onPointerLeave={
        interactive && !reduce
          ? () => {
              rawRx.set(0);
              rawRy.set(0);
            }
          : undefined
      }
    >
      <motion.div
        style={interactive && !reduce ? { rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' } : undefined}
      >
        <Tag aria-label={text} className={`${className} ${extrudeClass}`}>
          {reduce ? (
            <span className={shaderClass}>{text}</span>
          ) : (
            words.map((word, wIdx) => {
              const isAccented = accentSet.has(wIdx);
              const wordClass = isAccented ? 'text-shader-gold' : shaderClass;

              if (wordBased) {
                const startIdx = runningIdx;
                runningIdx += word.length;
                return (
                  <React.Fragment key={`${word}-${wIdx}`}>
                    <span
                      aria-hidden="true"
                      className="inline-block overflow-hidden pb-[0.12em] align-bottom [perspective:800px]"
                    >
                      <motion.span
                        className={`inline-block origin-bottom [transform-style:preserve-3d] ${wordClass}`}
                        initial={getCharInitial(preset, startIdx, totalChars, wIdx)}
                        animate={
                          visible
                            ? { y: '0%', x: 0, rotateX: 0, rotateY: 0, rotateZ: 0, skewY: 0, z: 0, scale: 1, opacity: 1 }
                            : undefined
                        }
                        transition={{ duration: 0.9, delay: getCharDelay(preset, startIdx, totalChars, wIdx, delay), ease: EASE }}
                      >
                        {word}
                      </motion.span>
                    </span>
                    {wIdx < words.length - 1 ? ' ' : ''}
                  </React.Fragment>
                );
              }

              const chars = Array.from(word);
              return (
                <React.Fragment key={`${word}-${wIdx}`}>
                  <span
                    aria-hidden="true"
                    className={`inline-flex whitespace-nowrap align-bottom [transform-style:preserve-3d] ${
                      maskClip ? 'overflow-hidden pb-[0.12em] pt-[0.04em]' : 'pb-[0.08em]'
                    }`}
                  >
                    {chars.map((ch, cIdx) => {
                      const globalIdx = runningIdx++;
                      return (
                        <motion.span
                          key={cIdx}
                          className={`kinetic-glyph inline-block origin-bottom will-change-transform ${wordClass}`}
                          style={wordClass ? { animationDelay: `${-(globalIdx * 0.14)}s` } : undefined}
                          initial={getCharInitial(preset, globalIdx, totalChars, wIdx)}
                          animate={
                            visible
                              ? {
                                  y: '0%',
                                  x: 0,
                                  rotateX: 0,
                                  rotateY: 0,
                                  rotateZ: 0,
                                  skewY: 0,
                                  z: 0,
                                  scale: 1,
                                  opacity: 1,
                                  filter: 'blur(0px)',
                                }
                              : undefined
                          }
                          transition={{
                            duration: preset === 'lattice' || preset === 'vortex' ? 0.82 : 0.78,
                            delay: getCharDelay(preset, globalIdx, totalChars, wIdx, delay),
                            ease: EASE,
                          }}
                          whileHover={
                            interactive
                              ? {
                                  y: -4,
                                  scale: 1.07,
                                  transition: { type: 'spring', stiffness: 420, damping: 16 },
                                }
                              : undefined
                          }
                        >
                          {ch}
                        </motion.span>
                      );
                    })}
                  </span>
                  {wIdx < words.length - 1 ? ' ' : ''}
                </React.Fragment>
              );
            })
          )}
        </Tag>
      </motion.div>
    </div>
  );
};

/**
 * ScrollKineticLead — Word-by-word dimensional focus reveal for descriptions & leads.
 * Words emerge smoothly from recessed depth and soft blur into crisp high-contrast ink.
 */
interface ScrollKineticLeadProps {
  children: React.ReactNode;
  inView?: boolean;
  delay?: number;
  className?: string;
}

export const ScrollKineticLead: React.FC<ScrollKineticLeadProps> = ({
  children,
  inView: externalInView,
  delay = 0.25,
  className = '',
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const internalInView = useInView(ref, { once: true, margin: '-8% 0px' });
  const visible = externalInView ?? internalInView;
  const reduce = useReducedMotion();

  if (typeof children !== 'string' || reduce) {
    return (
      <motion.p
        ref={ref}
        initial={reduce ? undefined : { opacity: 0, y: 12 }}
        animate={reduce || visible ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.75, delay, ease: EASE }}
        className={className}
      >
        {children}
      </motion.p>
    );
  }

  const words = children.split(' ');
  return (
    <p ref={ref} aria-label={children} className={`${className} [perspective:700px]`}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <motion.span
            aria-hidden="true"
            className="inline-block origin-bottom"
            initial={{ opacity: 0, y: 12, rotateX: -28, filter: 'blur(4px)' }}
            animate={
              visible
                ? { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }
                : undefined
            }
            transition={{
              duration: 0.58,
              delay: delay + Math.min(i * 0.022, 0.52),
              ease: EASE,
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </p>
  );
};

/**
 * ExtrudedHeading — Card / project / role title with subtle 3D dimensional depth extrusion,
 * masked perspective entrance, and interactive cursor-swept golden-hour specular highlight.
 */
interface ExtrudedHeadingProps {
  text: string;
  as?: 'h3' | 'h4';
  className?: string;
  variant?: 'gold' | 'holo';
}

export const ExtrudedHeading: React.FC<ExtrudedHeadingProps> = ({
  text,
  as = 'h3',
  className = '',
  variant = 'gold',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });
  const reduce = useReducedMotion();
  const Tag = as;

  const words = useMemo(() => text.split(' '), [text]);

  return (
    <div
      ref={ref}
      className="group/heading inline-block max-w-full [perspective:800px]"
      onPointerMove={
        reduce
          ? undefined
          : (e) => {
              if (e.pointerType !== 'mouse' || !ref.current) return;
              const r = ref.current.getBoundingClientRect();
              const pct = ((e.clientX - r.left) / r.width) * 100;
              ref.current.style.setProperty('--sheen-x', `${pct.toFixed(1)}%`);
            }
      }
    >
      <Tag
        aria-label={text}
        className={`kinetic-extruded-heading ${variant === 'holo' ? 'kinetic-extruded-holo' : 'kinetic-extruded-gold'} ${className}`}
      >
        {reduce
          ? text
          : words.map((w, i) => (
              <React.Fragment key={`${w}-${i}`}>
                <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                  <motion.span
                    className="inline-block origin-bottom transition-transform duration-300 ease-soft group-hover/heading:-translate-y-[1px]"
                    initial={{ y: '100%', rotateX: -36, opacity: 0 }}
                    animate={inView ? { y: '0%', rotateX: 0, opacity: 1 } : undefined}
                    transition={{ duration: 0.72, delay: i * 0.045, ease: EASE }}
                  >
                    {w}
                  </motion.span>
                </span>
                {i < words.length - 1 ? ' ' : ''}
              </React.Fragment>
            ))}
      </Tag>
    </div>
  );
};
