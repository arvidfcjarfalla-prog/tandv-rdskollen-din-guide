export function ScrollHint() {
  return (
    <div className="flex flex-col items-center gap-[6px] opacity-50 animate-hint-pulse mt-10 mb-4">
      <span className="text-[11px] font-medium text-text-tertiary tracking-[0.04em]">
        Se hur det fungerar
      </span>
      <span className="w-4 h-4 border-r-[1.5px] border-b-[1.5px] border-text-tertiary rotate-45" />
    </div>
  );
}
