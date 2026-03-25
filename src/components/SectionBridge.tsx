interface SectionBridgeProps {
  text: string;
  targetId?: string;
}

export function SectionBridge({ text, targetId }: SectionBridgeProps) {
  const handleClick = () => {
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="text-center py-10">
      <div className="w-px h-8 bg-border mx-auto mb-4" />
      <p className="text-sm text-text-tertiary max-w-md mx-auto px-6 mb-4">{text}</p>
      {targetId && (
        <button
          onClick={handleClick}
          className="w-8 h-8 mx-auto rounded-full border border-border bg-bg-elevated flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-border-strong transition-all cursor-pointer"
        >
          <span className="w-3 h-3 border-r-[1.5px] border-b-[1.5px] border-current rotate-45 -translate-y-[2px]" />
        </button>
      )}
    </div>
  );
}
