export default function Loading() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="bg-surface rounded-3xl border border-line p-8 flex flex-col items-center gap-3" role="status">
        <div className="w-12 h-12 border-4 border-line border-t-accent-strong rounded-full motion-safe:animate-spin" aria-hidden="true" />
        <p className="font-body text-base text-ink-muted">Memuat…</p>
      </div>
    </div>
  );
}
