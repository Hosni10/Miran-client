import { describe, it, expect } from 'vitest';
import { useSecondaryFoodMap } from '../src/hooks/useSecondaryFoodMap';

describe('useSecondaryFoodMap', () => {
  it('should be a function', () => {
    expect(typeof useSecondaryFoodMap).toBe('function');
  });
}); 