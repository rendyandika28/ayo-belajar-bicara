export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-purple-600 focus:text-white focus:font-heading focus:px-4 focus:py-2 focus:rounded-full focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
    >
      Lewati ke konten utama
    </a>
  );
}
