import { describe, expect, it } from 'vitest';
import { fromLocalInput, getDueStatus, toLocalInput } from '@/features/activities/lib/due-date';

const NOW = Date.parse('2026-11-24T12:00:00Z');

describe('due date', () => {
  it.each([
    [null, { status: 'open' }],
    ['2026-11-24T12:00:00Z', { status: 'closed' }],
    ['2026-11-25T12:00:00Z', { status: 'dueSoon', days: 1 }],
    ['2026-12-01T12:00:00Z', { status: 'dueSoon', days: 7 }],
    ['2026-12-01T12:00:01Z', { status: 'open' }],
  ])('classifies %s', (dueAt, expected) => {
    expect(getDueStatus(dueAt, NOW)).toEqual(expected);
  });

  it('keeps the instant when converting to the local input and back', () => {
    const date = '2026-11-25T15:30:00.000Z';
    expect(fromLocalInput(toLocalInput(date))).toBe(date);
    expect(fromLocalInput('')).toBeNull();
    expect(toLocalInput(null)).toBe('');
  });
});
