import { describe, it, expect } from 'vitest';
import { animate } from 'animejs';

describe('Anime.js Engine Integration', () => {
  it('should initialize and animate properties on plain objects', () => {
    const target = { count: 0, opacity: 0 };
    const anim = animate(target, {
      count: 100,
      opacity: 1,
      duration: 100,
      ease: 'linear'
    });

    expect(anim).toBeDefined();
    expect(typeof anim.revert).toBe('function');
    anim.revert();
  });

  it('should support revert cleanup without throwing', () => {
    const target = { y: 20 };
    const anim = animate(target, {
      y: 0,
      duration: 50,
      ease: 'outQuad'
    });

    expect(() => anim.revert()).not.toThrow();
  });
});
