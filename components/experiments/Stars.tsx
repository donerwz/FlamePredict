interface StarsProps {
  value: number;
  max?: number;
}

/**
 * Star rating as five LED-style dots (filled = earned), font-independent so
 * it never falls back to a mismatched glyph. Screen readers get the number.
 */
export default function Stars({ value, max = 5 }: StarsProps) {
  return (
    <span
      role="img"
      aria-label={`${value} of ${max} stars`}
      className="flex items-center gap-1"
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < value ? "bg-ember" : "bg-ember/20"
          }`}
        />
      ))}
    </span>
  );
}
