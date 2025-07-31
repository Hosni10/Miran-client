import { describe, it, expect } from 'vitest';
import { useUnitMap } from '../src/hooks/useUnitMap';

describe('useUnitMap', () => {
  it('should be a function', () => {
    expect(typeof useUnitMap).toBe('function');
  });
}); 