export function formatGrade(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateTime(isoDate: string, language: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(language, {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(isoDate));
}

export function formatDate(
  time: number,
  language: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(language, options).format(time);
}
