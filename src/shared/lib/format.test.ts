import { describe, expect, it } from 'vitest';
import { formatDateTime, formatGrade } from '@/shared/lib/format';

describe('format', () => {
  it('formats grades by language', () => {
    expect(formatGrade(7, 'pt-BR')).toBe('7,0');
    expect(formatGrade(7.5, 'en')).toBe('7.5');
  });

  it('formats dates by language', () => {
    const date = '2026-11-25T15:30:00.000Z';
    expect(formatDateTime(date, 'pt-BR', 'UTC')).toContain('25/11/2026');
    expect(formatDateTime(date, 'en', 'UTC')).toContain('11/25/26');
  });
});
