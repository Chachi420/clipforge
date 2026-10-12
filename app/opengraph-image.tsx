import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ClipForge — Clip. Post. Get Paid.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          CLIPFORGE
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 42,
            fontWeight: 500,
            opacity: 0.85,
          }}
        >
          Clip. Post. Get Paid.
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 24,
            opacity: 0.5,
          }}
        >
          The pay-per-view clipping marketplace
        </div>
      </div>
    ),
    { ...size }
  );
}
