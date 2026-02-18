export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
        <p className="font-body text-sm text-foreground/50">Memuat...</p>
      </div>
    </div>
  );
}
