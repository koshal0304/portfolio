import * as THREE from 'three';
import { COLORS } from './constants';

// ─── KK Monogram Texture (for hoodie chest) ───────────────────────
export function createKKTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KK', 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── Keyboard Texture ──────────────────────────────────────────────
export function createKeyboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = COLORS.laptopDark;
  ctx.fillRect(0, 0, 128, 96);
  ctx.fillStyle = '#2a3a4a';
  const rows = [12, 12, 11, 9];
  const yPositions = [10, 30, 50, 70];
  rows.forEach((keys, row) => {
    const offset = row * 3;
    for (let i = 0; i < keys; i++) {
      ctx.fillRect(offset + i * 10 + 4, yPositions[row], 7, 14);
    }
  });
  // Spacebar
  ctx.fillRect(30, 85, 60, 8);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── Speech Bubble Texture ─────────────────────────────────────────
export function createSpeechBubbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 192);

  // Rounded rectangle
  const r = 20, x = 10, y = 10, w = 492, h = 140;
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();

  // Triangle pointer
  ctx.beginPath();
  ctx.moveTo(230, 150);
  ctx.lineTo(256, 185);
  ctx.lineTo(282, 150);
  ctx.closePath();
  ctx.fill();

  // Text
  ctx.fillStyle = COLORS.hoodie;
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("Let's build something together.", 256, 80);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── Screen Code Canvas (mutable, updated in useFrame) ─────────────
export function createScreenCanvas(): { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = COLORS.screenBg;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  return { canvas, texture };
}

// ─── Achievement Number Textures ───────────────────────────────────
export function createAchievementTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 256, 128);
  ctx.fillStyle = COLORS.cyan;
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── Icon Label Textures ───────────────────────────────────────────
export function createLabelTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 48);
  ctx.fillStyle = COLORS.white;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 24);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
