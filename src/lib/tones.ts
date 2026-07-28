/**
 * The chapter tone scale.
 *
 * The page is meant to read as one continuous colour rather than a stack of
 * coloured boxes. Every chapter starts on the tone the chapter above it ended
 * on, so scrolling walks the whole scale without a single visible seam:
 *
 *   0  paper   hero opens on the same warm paper as the header
 *   1  clay    the day begins
 *   2  sand
 *   3  sage
 *   4  mint
 *   5  steel   the day ends and privacy begins
 *   6  haze    looking ahead
 *   7  quiet   questions
 *   8  shell   the closing invitation
 *   9  paper   back where it started, under the footer
 *
 * The stops were picked in OKLCH at a near constant lightness, so every one of
 * them holds at least 9.8:1 against the ink colour in light mode and 14.8:1
 * against the paper colour in dark mode. That is what lets the background move
 * this much without the text ever getting harder to read.
 *
 * These values are mirrored by the `--tone-*` custom properties in
 * `globals.css`, which is where the CSS side of the blend reads them from. A
 * test asserts the two stay in step: only the pinned day sequence needs them
 * here, because it interpolates the colour in JavaScript as you scroll.
 */
export const tones = {
  light: [
    "#f4f0e7",
    "#f6dacd",
    "#efe1ca",
    "#d5e8d5",
    "#caeae6",
    "#d1e9f4",
    "#dcebf4",
    "#eeede6",
    "#f5e1d4",
    "#f4f0e7",
  ],
  dark: [
    "#0a1919",
    "#2d1e19",
    "#2b2115",
    "#1a261c",
    "#102826",
    "#13272f",
    "#132129",
    "#161c17",
    "#2a1d16",
    "#0a1919",
  ],
} as const;

/** The slice of the scale the day sequence walks, first stop to last. */
export const DAY_TONES = { from: 1, to: 5 } as const;

export function dayTrack(dark: boolean): string[] {
  return tones[dark ? "dark" : "light"].slice(DAY_TONES.from, DAY_TONES.to + 1);
}
