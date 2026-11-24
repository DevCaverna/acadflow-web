import { describe, expect, it } from 'vitest';
import { parseGrade } from '@/features/grades/lib/parse-grade';

describe('parseGrade', () => {
  it.each([
    ['0', 0],
    ['7,5', 7.5],
    [' 7.5 ', 7.5],
    ['10,0', 10],
  ])('accepts %s', (text, value) => {
    expect(parseGrade(text)).toBe(value);
  });

  it.each(['', '-1', '10,1', '12', '7,55', 'abc', '1e1'])('rejects %s', (text) => {
    expect(parseGrade(text)).toBeUndefined();
  });
});
