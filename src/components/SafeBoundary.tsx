import { Component, type ReactNode } from 'react';

/** Contains failures in decorative 3D (no WebGL, chunk load error) so the content always renders. */
export default class SafeBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
