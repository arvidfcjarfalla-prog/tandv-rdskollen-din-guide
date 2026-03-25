/** Abstract smile arc — logo mark for Tandkollen.
 *  Two soft curves suggesting a smile, not a literal tooth. */
export function SmileMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Upper arc — gentle curve */}
      <path
        d="M5 11C7.5 7.5 16.5 7.5 19 11"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Lower arc — the smile */}
      <path
        d="M7 13C9 17 15 17 17 13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
