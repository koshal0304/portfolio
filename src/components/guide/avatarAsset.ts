import { useGLTF } from '@react-three/drei';

// The twin is src/assets/avatar/*.glb (slimmed with scripts/slim-avatar.py); without one, the hologram stands in.
const found = import.meta.glob('../../assets/avatar/*.glb', { query: '?url', import: 'default', eager: true });
export const AVATAR_URL = (Object.values(found)[0] as string | undefined) ?? null;

/** Start downloading and parsing the twin while the intro is still on screen. */
export const preloadAvatar = () => {
  if (AVATAR_URL) useGLTF.preload(AVATAR_URL);
};
