import React, { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, [role="button"], label, select, summary, [data-cursor]';

/**
 * A precise dot and a ring that trails it: the ring grows over anything clickable and shows a word for
 * elements with data-cursor="View". Mouse only; touch, pens and reduced-motion keep the system cursor.
 */
const Cursor: React.FC = () => {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;
    let shown = false;

    const show = (on: boolean) => {
      if (on === shown) return;
      shown = on;
      root.classList.toggle('has-cursor', on);
      dot.current?.classList.toggle('on', on);
      ring.current?.classList.toggle('on', on);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return show(false);
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        rx = x;
        ry = y;
      }
      show(true);
      const target = e.target as Element | null;
      const field = target?.closest?.('input, textarea, [contenteditable="true"]');
      const hit = target?.closest?.(INTERACTIVE);
      const word = hit?.getAttribute('data-cursor') ?? '';
      const mode = field ? 'field' : word ? 'label' : hit ? 'hover' : '';
      if (ring.current && ring.current.dataset.mode !== mode) ring.current.dataset.mode = mode;
      if (dot.current && dot.current.dataset.mode !== mode) dot.current.dataset.mode = mode;
      if (label.current && label.current.textContent !== word) label.current.textContent = word;
    };
    const hide = () => show(false);
    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      root.removeEventListener('mouseleave', hide);
      window.removeEventListener('blur', hide);
      root.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span ref={label} />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
};

export default Cursor;
