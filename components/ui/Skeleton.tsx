// Loading skeletons shaped like the real screens, so a route change keeps the layout steady.
// Pulse is soft (opacity only) and stops in calm mode / reduced motion (see .skeleton in globals.css).

function Bone({ className = "" }: { className?: string }) {
  return <div className={`skeleton bg-line ${className}`} />;
}

function Frame({ children, label = "Memuat…" }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="min-h-screen bg-paper" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

/** Home / list pages: top bar, title, grid of cards. */
export function HomeSkeleton() {
  return (
    <Frame>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex justify-between mb-8">
          <Bone className="w-11 h-11 sm:w-36 rounded-full" />
          <div className="flex gap-1.5">
            <Bone className="w-11 h-11 rounded-full" />
            <Bone className="w-11 h-11 rounded-full" />
            <Bone className="w-16 h-11 rounded-full" />
          </div>
        </div>
        <Bone className="h-9 w-64 max-w-full rounded-xl mb-3" />
        <Bone className="h-5 w-20 rounded-lg mb-10" />
        <Bone className="h-6 w-40 rounded-lg mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="bg-surface rounded-3xl border border-line p-3">
              <Bone className="aspect-square w-full rounded-2xl" />
              <Bone className="h-5 w-3/4 rounded-lg mt-3" />
              <Bone className="h-4 w-1/2 rounded-lg mt-2" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/** Game pages: GameShell header, one big task card, action buttons. */
export function GameSkeleton() {
  return (
    <Frame>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-3 mb-5">
          <Bone className="w-14 h-14 rounded-full shrink-0" />
          <div className="flex-1 flex justify-center">
            <Bone className="h-8 w-40 rounded-xl" />
          </div>
          <Bone className="w-24 h-11 rounded-full shrink-0" />
        </div>
        <Bone className="h-2.5 w-full rounded-full mb-5" />
        <div className="bg-surface rounded-3xl border border-line p-6 flex flex-col items-center">
          <Bone className="w-40 h-40 rounded-3xl" />
          <Bone className="h-10 w-48 rounded-xl mt-6" />
          <Bone className="h-5 w-32 rounded-lg mt-3" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <Bone className="h-[72px] rounded-3xl" />
          <Bone className="h-[72px] rounded-3xl" />
        </div>
      </div>
    </Frame>
  );
}

/** Pendamping: header, report card, two side panels. */
export function ReportSkeleton() {
  return (
    <Frame>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Bone className="w-11 h-11 rounded-full" />
          <Bone className="h-8 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 bg-surface rounded-2xl border border-line p-5 sm:p-6">
            <div className="flex justify-between mb-4">
              <Bone className="h-6 w-24 rounded-lg" />
              <Bone className="h-10 w-32 rounded-full" />
            </div>
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <Bone className="h-10 w-48 max-w-full rounded-xl" />
                <Bone className="h-4 w-64 max-w-full rounded-lg mt-3" />
                <div className="flex gap-1.5 mt-4">
                  {Array.from({ length: 7 }, (_, i) => <Bone key={i} className="w-7 h-7 rounded-full" />)}
                </div>
              </div>
              <Bone className="w-24 h-24 rounded-full shrink-0" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
              {Array.from({ length: 4 }, (_, i) => <Bone key={i} className="h-16 rounded-xl" />)}
            </div>
            <Bone className="h-24 w-full rounded-xl mt-5" />
          </div>
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-line p-5 sm:p-6">
              <Bone className="h-6 w-36 rounded-lg mb-4" />
              <Bone className="h-4 w-full rounded-lg mb-3" />
              <Bone className="h-4 w-5/6 rounded-lg mb-3" />
              <Bone className="h-4 w-2/3 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}
