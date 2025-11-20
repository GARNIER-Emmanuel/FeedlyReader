Planetary Design Language

Goal
----
A refined, minimal 'planetary' aesthetic inspired by the "Solar System" concept: deep, elegant, desaturated blues and grays, generous spacing, subtle layered depth and slow motion (orbital drift). No neon, no flashy glows. Use warmth sparingly for accents.

Core rules
----------
- Palette: deep navy backgrounds, desaturated cerulean accents, soft off-whites for text, cool gray-blues for muted text. Warm beige/ochre only for small highlights.
- No neon or saturated glows. No heavy glows, no harsh contrasts that feel 'digital-vapor'.
- Typography: single refined sans-serif (Inter). Use the same family for headings to preserve calm minimalism.
- Motion: slow, natural, minimal. Orbital rotations, subtle parallax on starfield, gentle hover lifts.
- Shapes: circles and overlapping radial gradients to evoke orbits and planets; avoid cartoon motifs.
- Accessibility: maintain minimum contrast ratios, clear focus states and sufficiently large hit areas.

Design tokens (CSS variables)
----------------------------
- --c-bg: deep background
- --c-surface: elevated surface
- --c-surface-strong: stronger surface for hover
- --c-text: main text color
- --c-muted: secondary text
- --c-blue / --c-slate: primary accents
- --c-warm: sparing warm highlight
- --accent-a / --accent-b: gradient endpoints
- --glass-bg, --glass-border, --ring

Usage examples
--------------
- Use `--c-surface` for cards and panels, `--c-surface-strong` on hover.
- Use `--accent-a`/`--accent-b` as background gradients for primary buttons.
- Use orbital overlays via `.orbit-overlay .orbit-circle` for decorative background only (pointer-events: none).

Assets & icons
--------------
- Iconography should be line-based, minimal strokes, monochrome (use `currentColor`).
- Avoid cartoonish illustration styles; prefer abstract circular compositions or simple glyphs.

Implementation notes
--------------------
- The global CSS variables live in `src/components/Style/index.css`.
- Starfield is implemented in `src/components/visual/StarfieldBackground.jsx` and is intentionally subtle.
- Use `DESIGN.md` as a living reference when adding components or changing colors.

Next steps
----------
- Audit remaining component CSS for hard-coded colors; convert to tokens.
- Run visual checks (light/dark) and adjust contrast where necessary.
- Create a small icon set matching this aesthetic (SVG line icons).
