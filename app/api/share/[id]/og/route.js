import { ImageResponse } from "next/og";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Prompt from "@/models/Prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function fetchAsDataUrl(url) {
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    const ct = res.headers.get("content-type") || "image/jpeg";
    return `data:${ct};base64,${b64}`;
  } catch {
    return null;
  }
}

export async function GET(_req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) {
    return new Response("Not found", { status: 404 });
  }

  await connectDB();
  const p = await Prompt.findOne({ _id: params.id, isPublic: true }).lean();
  if (!p) return new Response("Not found", { status: 404 });

  const artUrls = (p.recommendations || [])
    .map((t) => t.albumArt)
    .filter(Boolean)
    .slice(0, 8);

  const arts = await Promise.all(artUrls.map(fetchAsDataUrl));
  const validArts = arts.filter(Boolean);

  const promptText =
    p.promptText.length > 90 ? p.promptText.slice(0, 90) + "…" : p.promptText;
  const trackCount = (p.recommendations || []).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", marginBottom: "44px" }}>
          <span style={{ color: "#ffffff", fontSize: "32px", fontWeight: 800 }}>
            Sound
          </span>
          <span style={{ color: "#1DB954", fontSize: "32px", fontWeight: 800 }}>
            Sage
          </span>
        </div>

        {/* Body */}
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: "72px",
            alignItems: "center",
          }}
        >
          {/* Left: prompt + meta */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                color: "#6b7280",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              PLAYLIST VIBE
            </div>
            <div
              style={{
                color: "#ffffff",
                fontSize: validArts.length > 0 ? "40px" : "52px",
                fontWeight: 700,
                lineHeight: 1.25,
              }}
            >
              &ldquo;{promptText}&rdquo;
            </div>
            <div
              style={{
                color: "#9ca3af",
                fontSize: "20px",
                marginTop: "4px",
              }}
            >
              {trackCount} tracks · soundsage.vercel.app
            </div>
          </div>

          {/* Right: 4×2 mosaic */}
          {validArts.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                width: "440px",
                height: "220px",
                overflow: "hidden",
                borderRadius: "12px",
              }}
            >
              {Array.from({ length: 8 }).map((_, i) =>
                validArts[i] ? (
                  <img
                    key={i}
                    src={validArts[i]}
                    width={110}
                    height={110}
                    style={{ objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div
                    key={i}
                    style={{
                      width: "110px",
                      height: "110px",
                      background: "#1a1a1a",
                      display: "flex",
                    }}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
