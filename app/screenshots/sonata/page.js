import SonataFrames from "@/components/screenshots/SonataFrames";

// Screenshot-only fixture route for deterministic promo captures.
export const metadata = {
  title: "Sonata Screenshot Frames",
};

export default function SonataScreenshotPage({ searchParams }) {
  return <SonataFrames frame={searchParams?.frame} />;
}
