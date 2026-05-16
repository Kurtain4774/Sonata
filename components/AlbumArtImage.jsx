// Album artwork with a neutral placeholder fallback when no image is available.
// Layout (size, rounding, flex-shrink) is controlled entirely by `className`.
export default function AlbumArtImage({ src, alt = "", className = "" }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }
  return <div className={`${className} bg-neutral-800`} />;
}
