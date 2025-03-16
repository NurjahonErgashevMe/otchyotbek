export function ThinkLoading() {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"></div>
    </div>
  );
}
