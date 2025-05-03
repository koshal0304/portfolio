declare module 'react-tsparticles' {
  import { FC } from 'react';
  
  interface Props {
    id: string;
    className?: string;
    options?: any;
    init?: (engine: any) => Promise<void>;
  }
  
  const Particles: FC<Props>;
  export default Particles;
}

declare module 'tsparticles' {
  export function loadFull(engine: any): Promise<void>;
}

declare module 'tsparticles-engine' {
  export interface Engine {
    init(): Promise<void>;
    // Add other methods as needed
  }
} 