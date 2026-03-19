

## Problem

The project has **no `manifest.json`** (Web App Manifest). When a user creates a home screen shortcut ("Add to Home Screen"), the browser has no metadata for:
- App icon (logo)
- App name
- Theme color
- Standalone display mode (app-like experience without browser chrome)

The favicon is set to `/lovable-uploads/8b7d63b5-191f-4ad8-92fa-f9c31ab1f55b.png` which is the CarsLead logo — but without a manifest, the home screen icon may show a generic browser icon or a low-quality screenshot.

## Plan

### 1. Create `public/manifest.json`
Define a standard PWA manifest with:
- `name`: "CarsLead - מערכת ניהול לסוחרי רכב"
- `short_name`: "CarsLead"
- `start_url`: "/dashboard"
- `display`: "standalone" (removes browser chrome, feels like an app)
- `background_color`: "#ffffff"
- `theme_color`: "#2F3C7E" (matches existing brand color)
- `dir`: "rtl", `lang`: "he"
- `icons`: array pointing to the existing logo at `/lovable-uploads/8b7d63b5-191f-4ad8-92fa-f9c31ab1f55b.png` in multiple sizes (192x192, 512x512)

### 2. Update `index.html`
Add the manifest link and meta tags:
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#2F3C7E">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
- `<link rel="apple-touch-icon" href="/lovable-uploads/8b7d63b5-191f-4ad8-92fa-f9c31ab1f55b.png">`

This is a 2-file change (1 new, 1 edit) that will make the home screen shortcut show the CarsLead logo and open in standalone app mode.

