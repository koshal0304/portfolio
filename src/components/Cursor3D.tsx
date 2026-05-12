import React, { useEffect, useRef, useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════
// PREMIUM CURSOR — GPU-accelerated 2D Canvas cursor
// Features:
//   • Morphing wireframe icosahedron drawn on 2D canvas
//   • Neon glow particle trail on fast movement
//   • Smooth magnetic expansion on hover
//   • Click squeeze animation
//   • All pointer-events: none — never blocks clicks
// ═══════════════════════════════════════════════════════════════════

// ─── Icosahedron wireframe math ──────────────────────────────────
// 12 vertices of a unit icosahedron
const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_VERTS: [number, number, number][] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];
// Normalize to unit sphere
const ICO_NORM = ICO_VERTS.map(([x, y, z]) => {
  const len = Math.sqrt(x * x + y * y + z * z);
  return [x / len, y / len, z / len] as [number, number, number];
});
// 30 edges of an icosahedron
const ICO_EDGES: [number, number][] = [
  [0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],
  [2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],
  [4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],
  [7,8],[7,10],[8,9],[10,11],
];

function rotateY(v: [number, number, number], a: number): [number, number, number] {
  const cos = Math.cos(a), sin = Math.sin(a);
  return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos];
}
function rotateX(v: [number, number, number], a: number): [number, number, number] {
  const cos = Math.cos(a), sin = Math.sin(a);
  return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos];
}
function rotateZ(v: [number, number, number], a: number): [number, number, number] {
  const cos = Math.cos(a), sin = Math.sin(a);
  return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos, v[2]];
}
// Project 3D → 2D with perspective
function project(v: [number, number, number], size: number, fov: number): [number, number, number] {
  const z = v[2] + fov;
  const scale = fov / z;
  return [v[0] * scale * size + size, v[1] * scale * size + size, z];
}

// ─── Trail particle type ─────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  vx: number;
  vy: number;
}

export interface Cursor3DProps {
  reducedMotion: boolean;
}

const Cursor3D: React.FC<Cursor3DProps> = ({ reducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // All mutable state in refs for RAF performance
  const mouse = useRef({ x: -200, y: -200 });
  const lerped = useRef({ x: -200, y: -200 });
  const prevMouse = useRef({ x: -200, y: -200 });
  const velocity = useRef(0);
  const isHovered = useRef(false);
  const isClicked = useRef(false);
  const cursorText = useRef('');
  const particles = useRef<Particle[]>([]);
  const rotation = useRef({ x: 0, y: 0, z: 0 });
  const scale = useRef(1);
  const hue = useRef(185); // cyan
  const lastSpawn = useRef(0);
  const frameId = useRef(0);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
  }, []);

  // ─── Event binding ─────────────────────────────────────────────
  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onDown = () => { isClicked.current = true; };
    const onUp = () => { isClicked.current = false; };

    const bindHovers = () => {
      document.querySelectorAll('a, button, input, textarea, [role="button"], .cursor-hover').forEach((el) => {
        (el as HTMLElement).addEventListener('mouseenter', () => {
          isHovered.current = true;
          cursorText.current = el.getAttribute('data-cursor-text') || '';
        });
        (el as HTMLElement).addEventListener('mouseleave', () => {
          isHovered.current = false;
          cursorText.current = '';
        });
      });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    const observer = new MutationObserver(bindHovers);
    observer.observe(document.body, { childList: true, subtree: true });
    bindHovers();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      observer.disconnect();
    };
  }, [isMobile, reducedMotion]);

  // ─── Main animation loop ───────────────────────────────────────
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { frameId.current = requestAnimationFrame(animate); return; }

    const ctx = canvas.getContext('2d');
    if (!ctx) { frameId.current = requestAnimationFrame(animate); return; }

    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Resize canvas to full viewport (only when needed)
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, W * dpr, H * dpr);

    const mx = mouse.current.x;
    const my = mouse.current.y;

    // ── Lerp cursor position ──
    lerped.current.x += (mx - lerped.current.x) * 0.12;
    lerped.current.y += (my - lerped.current.y) * 0.12;

    // ── Velocity ──
    const dx = mx - prevMouse.current.x;
    const dy = my - prevMouse.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    velocity.current += (speed - velocity.current) * 0.15;
    prevMouse.current = { x: mx, y: my };

    const lx = lerped.current.x;
    const ly = lerped.current.y;
    const hovered = isHovered.current;
    const clicked = isClicked.current;
    const vel = velocity.current;

    // ══════════════════════════════════════════════════════════════
    // 1. PARTICLE TRAIL
    // ══════════════════════════════════════════════════════════════
    const now = performance.now();
    if (vel > 2 && now - lastSpawn.current > 20) {
      lastSpawn.current = now;
      const count = Math.min(3, Math.floor(vel / 8));
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: mx + (Math.random() - 0.5) * 8,
          y: my + (Math.random() - 0.5) * 8,
          life: 1,
          maxLife: 0.6 + Math.random() * 0.4,
          size: 1.5 + Math.random() * 3,
          hue: 185 + Math.random() * 50, // cyan → blue
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1 - 0.5,
        });
      }
    }
    // Keep pool limited
    if (particles.current.length > 60) {
      particles.current = particles.current.slice(-60);
    }

    // Update & draw particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.life -= 0.02;
      if (p.life <= 0) { particles.current.splice(i, 1); continue; }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // micro gravity

      const alpha = p.life / p.maxLife;
      const r = p.size * alpha;

      // Glow
      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      grad.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${alpha * 0.4})`);
      grad.addColorStop(1, `hsla(${p.hue}, 100%, 65%, 0)`);
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${alpha * 0.8})`;
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ══════════════════════════════════════════════════════════════
    // 2. MORPHING WIREFRAME ICOSAHEDRON
    // ══════════════════════════════════════════════════════════════
    // Rotation speed scales with velocity
    const rotSpeed = 0.008 + vel * 0.001;
    rotation.current.y += rotSpeed;
    rotation.current.x += rotSpeed * 0.6;
    rotation.current.z += rotSpeed * 0.3;

    // Scale: idle pulse, expand on hover, squeeze on click
    let targetScale = 1 + Math.sin(now * 0.003) * 0.06;
    if (hovered) targetScale = 1.8;
    if (clicked) targetScale = 0.6;
    scale.current += (targetScale - scale.current) * 0.08;

    // Hue shift: cyan idle, purple hover, pink click
    let targetHue = 185 + Math.sin(now * 0.001) * 10;
    if (hovered) targetHue = 270;
    if (clicked) targetHue = 320;
    hue.current += (targetHue - hue.current) * 0.06;

    const icoSize = 14 * scale.current; // px radius
    const fov = 3;
    const time = now * 0.001;

    // Transform vertices
    const projected = ICO_NORM.map((v) => {
      // Distort vertices slightly for organic feel
      let [vx, vy, vz] = v;
      const distort = hovered ? 0.12 : 0.04 + vel * 0.002;
      vx += Math.sin(time * 3 + vx * 5) * distort;
      vy += Math.cos(time * 2.5 + vy * 5) * distort;
      vz += Math.sin(time * 2 + vz * 5) * distort;

      let r: [number, number, number] = [vx, vy, vz];
      r = rotateY(r, rotation.current.y);
      r = rotateX(r, rotation.current.x);
      r = rotateZ(r, rotation.current.z);
      return project(r, icoSize, fov);
    });

    // Draw edges
    const baseAlpha = hovered ? 0.9 : 0.5 + Math.sin(time * 2) * 0.1;
    for (const [a, b] of ICO_EDGES) {
      const [ax, ay, az] = projected[a];
      const [bx, by, bz] = projected[b];
      // Depth-based opacity for 3D feel
      const depthAlpha = Math.min(1, Math.max(0.15, (az + bz) / (fov * 2) + 0.5));
      const alpha = baseAlpha * depthAlpha;

      ctx.beginPath();
      ctx.moveTo(lx + ax - icoSize, ly + ay - icoSize);
      ctx.lineTo(lx + bx - icoSize, ly + by - icoSize);
      ctx.strokeStyle = `hsla(${hue.current}, 100%, 65%, ${alpha})`;
      ctx.lineWidth = hovered ? 1.5 : 0.8;
      ctx.stroke();
    }

    // Draw vertices as glowing dots
    for (const [px, py, pz] of projected) {
      const depthAlpha = Math.min(1, Math.max(0.2, pz / (fov * 2) + 0.5));
      const dotSize = (hovered ? 2.5 : 1.5) * depthAlpha;

      // Glow
      ctx.beginPath();
      const glow = ctx.createRadialGradient(
        lx + px - icoSize, ly + py - icoSize, 0,
        lx + px - icoSize, ly + py - icoSize, dotSize * 4
      );
      glow.addColorStop(0, `hsla(${hue.current}, 100%, 70%, ${0.3 * depthAlpha})`);
      glow.addColorStop(1, `hsla(${hue.current}, 100%, 70%, 0)`);
      ctx.fillStyle = glow;
      ctx.arc(lx + px - icoSize, ly + py - icoSize, dotSize * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue.current}, 100%, 80%, ${0.8 * depthAlpha})`;
      ctx.arc(lx + px - icoSize, ly + py - icoSize, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // ══════════════════════════════════════════════════════════════
    // 3. CENTER DOT (sharp, always at actual mouse pos)
    // ══════════════════════════════════════════════════════════════
    if (!hovered) {
      const dotR = clicked ? 2 : 3;
      // Outer glow
      ctx.beginPath();
      const dotGlow = ctx.createRadialGradient(mx, my, 0, mx, my, dotR * 5);
      dotGlow.addColorStop(0, `hsla(${hue.current}, 100%, 70%, 0.3)`);
      dotGlow.addColorStop(1, `hsla(${hue.current}, 100%, 70%, 0)`);
      ctx.fillStyle = dotGlow;
      ctx.arc(mx, my, dotR * 5, 0, Math.PI * 2);
      ctx.fill();
      // Core white dot
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.arc(mx, my, dotR, 0, Math.PI * 2);
      ctx.fill();
    }

    // ══════════════════════════════════════════════════════════════
    // 4. OUTER RING (gentle orbit ring around cursor)
    // ══════════════════════════════════════════════════════════════
    const ringRadius = hovered ? 35 : 18;
    const ringAlpha = hovered ? 0.25 : 0.08 + Math.sin(time * 2) * 0.03;
    ctx.beginPath();
    ctx.arc(lx, ly, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${hue.current}, 80%, 60%, ${ringAlpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Orbiting dot on the ring
    const orbitAngle = time * 1.5;
    const orbX = lx + Math.cos(orbitAngle) * ringRadius;
    const orbY = ly + Math.sin(orbitAngle) * ringRadius;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${hue.current}, 100%, 70%, ${ringAlpha * 2})`;
    ctx.arc(orbX, orbY, 2, 0, Math.PI * 2);
    ctx.fill();

    // ══════════════════════════════════════════════════════════════
    // 5. CURSOR TEXT (on hover)
    // ══════════════════════════════════════════════════════════════
    if (cursorText.current && hovered) {
      ctx.font = '600 9px "Space Grotesk", sans-serif';
      const text = cursorText.current.toUpperCase();
      const tw = ctx.measureText(text).width;
      const tx = lx - tw / 2;
      const ty = ly + ringRadius + 16;

      // Background pill (manual rounded rect for browser compat)
      const pillW = tw + 14;
      const pillH = 18;
      const pillX = tx - 7;
      const pillY = ty - 12;
      const pillR = 9;
      ctx.beginPath();
      ctx.moveTo(pillX + pillR, pillY);
      ctx.lineTo(pillX + pillW - pillR, pillY);
      ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillR, pillR);
      ctx.lineTo(pillX + pillW, pillY + pillH - pillR);
      ctx.arcTo(pillX + pillW, pillY + pillH, pillX + pillW - pillR, pillY + pillH, pillR);
      ctx.lineTo(pillX + pillR, pillY + pillH);
      ctx.arcTo(pillX, pillY + pillH, pillX, pillY + pillH - pillR, pillR);
      ctx.lineTo(pillX, pillY + pillR);
      ctx.arcTo(pillX, pillY, pillX + pillR, pillY, pillR);
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue.current}, 60%, 15%, 0.7)`;
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue.current}, 100%, 60%, 0.3)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Text
      ctx.fillStyle = `hsla(${hue.current}, 100%, 75%, 0.9)`;
      ctx.fillText(text, tx, ty);
    }

    frameId.current = requestAnimationFrame(animate);
  }, []);

  // Start/stop animation
  useEffect(() => {
    if (isMobile || reducedMotion) return;
    frameId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId.current);
  }, [animate, isMobile, reducedMotion]);

  if (isMobile || reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 hidden md:block"
      style={{
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default Cursor3D;
