/** Props de {@link Avatar}. */
type AvatarProps = {
  /** Nome da pessoa. */
  name: string;
};

/** Iniciais da pessoa. */
export function Avatar({ name }: AvatarProps) {
  const parts = name.trim().split(/\s+/);
  const initials = [parts[0], parts.length > 1 ? parts.at(-1) : undefined]
    .map((part) => part?.charAt(0) ?? '')
    .join('')
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-bold text-primary-active"
    >
      {initials}
    </span>
  );
}
