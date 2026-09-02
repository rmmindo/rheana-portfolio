import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom implements neither of these, and both are load-bearing for the motion
// system. Defaulting matchMedia to "no match" means tests run as a user who has
// NOT requested reduced motion, which is the path that actually animates.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

if (!global.IntersectionObserver) {
  global.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Lets a test simulate a user who asked for reduced motion.
export function setReducedMotion(reduced) {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}
