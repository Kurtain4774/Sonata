export default function LoadingSpinner({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 py-6 ${className}`}>
      <div className="h-7 w-7 rounded-full border-2 border-neutral-700 border-t-spotify animate-spin" />
      {label && <div className="text-[10px] text-neutral-500">{label}</div>}
    </div>
  );
}
