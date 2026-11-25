import { describe, expect, it } from 'vitest';
import { getClassAverage } from '@/features/grades/lib/class-average';

describe('getClassAverage', () => {
  it('ignores students without grades', () => {
    expect(getClassAverage([{ average: 6 }, { average: null }, { average: 8 }])).toBe(7);
  });

  it('returns null when nobody has grades', () => {
    expect(getClassAverage([])).toBeNull();
    expect(getClassAverage([{ average: null }])).toBeNull();
  });
});
