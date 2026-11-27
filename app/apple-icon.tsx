import { ImageResponse } from "next/og";

/** iPhone / iPad home-screen icon (Safari ignores SVG favicons). Same mark
 *  as app/icon.svg; iOS applies its own rounded mask, so the square is full-bleed. */
export const runtime = "edge"; // same as opengraph-image.tsx
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #2a2d33 0%, #0B0E13 55%)",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path
            d="M13 21 L22.5 46 L32 28 L41.5 46 L52 13"
            fill="none"
            stroke="#ffffff"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size
  );
}
