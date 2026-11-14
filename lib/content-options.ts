/** Shared content-requirement option lists.
 *  Lives in lib/ (no "use client") so server components can import these
 *  constants: importing a value out of a client module and calling .map()
 *  on it at module scope breaks the production build (RSC boundary).
 */
export const PROMO_FORMATS = [
  { value: "video", label: "Video clip", hint: "Clipper cuts/edits video featuring your brand" },
  { value: "logo_overlay", label: "Logo overlay", hint: "Your logo appears as watermark/overlay" },
  { value: "banner", label: "Banner / cover", hint: "Branded banner or cover frame on the clip" },
  { value: "voiceover", label: "Voiceover mention", hint: "Clipper mentions your brand in audio" },
  { value: "caption", label: "Caption + hashtags", hint: "Brand mention in caption/text only" },
] as const;
