export function parseGrade(text: string): number | undefined {
  const value = text.trim();
  if (!/^\d{1,2}([.,]\d)?$/.test(value)) return undefined;
  const grade = Number(value.replace(',', '.'));
  return grade <= 10 ? grade : undefined;
}
