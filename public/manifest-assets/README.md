# PWA icons

Drop the following PNG files into this directory:

| File | Size | Purpose | Notes |
| --- | --- | --- | --- |
| `icon-192.png` | 192×192 | `any` | Home-screen icon (Android / iOS) |
| `icon-512.png` | 512×512 | `any` | High-res home-screen icon (Android / Chrome install prompt) |
| `icon-maskable-512.png` | 512×512 | `maskable` | Safe-zone icon for adaptive Android masks (keep content inside inner 80% circle) |

Recommended: use a single 1024×1024 source SVG, export each size via your tool of choice (Figma, `sharp-cli`, `favicon.io`, etc.).

These are referenced from `app/manifest.ts` and `app/layout.tsx`. Replace the placeholders — the manifest will continue to reference these exact paths.
