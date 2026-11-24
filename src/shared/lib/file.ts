export type FileRules = { types: readonly string[]; maxBytes: number };

export const AVATAR_RULES: FileRules = {
  types: ['image/png', 'image/jpeg', 'image/webp'],
  maxBytes: 2 * 1024 * 1024,
};

export const ATTACHMENT_RULES: FileRules = {
  types: ['application/pdf', 'image/png', 'image/jpeg'],
  maxBytes: 10 * 1024 * 1024,
};

export function isValidFile(file: File, { types, maxBytes }: FileRules): boolean {
  return types.includes(file.type) && file.size > 0 && file.size <= maxBytes;
}

export function formatFileSize(bytes: number, language: string): string {
  const isLarge = bytes >= 1024 * 1024;
  const value = bytes / (isLarge ? 1024 * 1024 : 1024);
  return new Intl.NumberFormat(language, {
    style: 'unit',
    unit: isLarge ? 'megabyte' : 'kilobyte',
    maximumFractionDigits: 1,
  }).format(value);
}
