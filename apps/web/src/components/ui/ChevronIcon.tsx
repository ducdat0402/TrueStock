interface ChevronIconProps {
  open?: boolean;
  className?: string;
}

export function ChevronIcon({ open, className = "" }: ChevronIconProps) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-teal transition-transform duration-200 ${
        open ? "rotate-180" : ""
      } ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
