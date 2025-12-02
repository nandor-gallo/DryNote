import Sidebar from "./components/Sidebar";

export default function Home() {
  // If you'd like to auto-load any images under `public/assets`, the page
  // will attempt to read the directory from the server during render.
  // Otherwise, it falls back to an example set of remote placeholders.
  let assets: string[] = [];
  // First image (hero): prefer a local `/assets/hero.*` if provided, otherwise a stable remote placeholder
  const heroLocal = "/assets/hero.jpg"; // change this to your local hero filename
  const heroRemote = "https://picsum.photos/seed/hero/1600/700";
  try {
    // Only available on the server (OK for Next.js Server Components)
    // and will not work in the client.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs");
    const path = require("path");
    const assetsDir = path.join(process.cwd(), "public", "assets");
    if (fs.existsSync(assetsDir)) {
      assets = fs
        .readdirSync(assetsDir)
        .filter((f: string) => /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(f))
        .map((f: string) => `/assets/${f}`);
    }
  } catch (err) {
    // If we cannot read the local directory (like if we render as a client),
    // ignore and fall back to sample remote assets below.
  }

  // Determine hero: prefer an explicit `heroLocal` if present, otherwise
  // choose the first local asset if available, otherwise use remote fallback
  let heroImage = heroRemote;
  if (assets.includes(heroLocal)) {
    heroImage = heroLocal;
  } else if (assets.length > 0) {
    // Use and remove the first local asset as the hero so it doesn't render twice
    heroImage = assets.shift() as string;
  }

  // If we still don't have any assets, ensure we provide a small selection of remote items
  if (assets.length === 0) {
    assets = [
      "https://picsum.photos/seed/1/1200/800",
      "https://picsum.photos/seed/2/1200/900",
      "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
      "https://media.giphy.com/media/l0HlQ7LRalQv5H5hC/giphy.gif",
    ];
  }

  // Put the hero image first so it becomes the large top/hero item.
  assets = [heroImage, ...assets];

  // Partition assets: hero, secondRow (two images), rest
  const hero = assets[0];
  const secondRow = assets.slice(1, 3);
  const rest = assets.slice(3);

  return (
    <div className="assets-root min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar hasSecondRow={secondRow.length > 0} hasAssetsContinued={rest.length > 0} />
      <main className="assets-container">
        <header className="mb-2 text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            DryNote
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            A basic, responsive single-column layout for images and GIFs. Use the
            provided `assets` array or add files to `public/assets`.
          </p>
          <nav className="mt-3 flex gap-2 justify-center sm:justify-start">
            <a className="text-sm text-zinc-700 hover:underline" href="#gallery">
              Gallery
            </a>
            {rest.length > 0 && (
              <a className="text-sm text-zinc-700 hover:underline" href="#assets-continued">
                Assets continued
              </a>
            )}
          </nav>
        </header>

        <h2 id="gallery" className="section-title">Gallery</h2>

        {/* Hero */}
        <figure id="hero" data-section="hero" className="asset-figure">
          <img src={hero} alt="hero" loading="eager" />
        </figure>

        {/* Second row: two columns on large screens */}
        {secondRow.map((asset, index) => (
          <figure id={`second-${index + 1}`} data-section="second-row" key={`second-${index}`} className="asset-figure">
            {/*
              Using a normal <img> ensures remote images don't need additional
              next.config changes for remote domains. If you'd prefer to use
              next/image, add remote domains to `next.config.ts` and swap this
              tag for Image with layout responsive.
            */}
            <img src={asset} alt={`asset-${index}`} loading="lazy" />
          </figure>
        ))}

        {rest.length > 0 && (
          <>
            <h2 id="assets-continued" className="section-title">Assets continued</h2>
            {/* Remaining assets (single column) */}
            {rest.map((asset, index) => (
              <figure id={`rest-${index}`} key={`rest-${index}`} data-section="assets-continued" className="asset-figure">
                <img src={asset} alt={`asset-rest-${index}`} loading="lazy" />
              </figure>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
