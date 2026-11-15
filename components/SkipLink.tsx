export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-accent-strong focus:text-on-accent focus:font-heading focus:px-4 focus:py-3 focus:rounded-full"
    >
      Lewati ke konten utama
    </a>
  );
}
