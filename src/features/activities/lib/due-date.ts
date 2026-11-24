import { TIME } from '@/shared/config/time.constants';

const DUE_SOON_DAYS = 7;
const DAY_MS = 24 * TIME.HOUR_MS;

export type DueStatus =
  | { status: 'open' }
  | { status: 'closed' }
  | { status: 'dueSoon'; days: number };

export function getDueStatus(dueAt: string | null, now: number): DueStatus {
  if (dueAt === null) return { status: 'open' };
  const remaining = new Date(dueAt).getTime() - now;
  if (remaining <= 0) return { status: 'closed' };
  const days = Math.ceil(remaining / DAY_MS);
  return days <= DUE_SOON_DAYS ? { status: 'dueSoon', days } : { status: 'open' };
}

export function toLocalInput(isoDate: string | null): string {
  if (isoDate === null) return '';
  const date = new Date(isoDate);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * TIME.MINUTE_MS);
  return local.toISOString().slice(0, 16);
}

export function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
