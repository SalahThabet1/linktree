# Falafelinhotpot Linktree

Static link-in-bio site for Falafelinhotpot, deployed to Vercel at `https://links.falafelinhotpot.com`.

## Stack

Plain HTML/CSS/JS — no build step. Single page, four modules:

| File | Purpose |
|---|---|
| `index.html` | Page markup, links, SEO/social meta |
| `styles.css` | All styling (glassmorphism, tokens, responsive) |
| `js/main.js` | Entry point, wires modules together |
| `js/icons.js` | Inline SVG icons (social dock + link arrows) |
| `js/interactions.js` | Entrance animations, hover glow, click feedback |
| `js/ink-atmosphere.js` | WebGL ink background (`Balatro` class) |

## Edit links

All links live in `index.html`:

- **Featured/nav links** — `.link` anchors inside `nav.links`
- **Social dock** — `.dock__icon` anchors inside `section.social-dock`

New dock icons need an entry in `ICONS` in `js/icons.js` plus a `[data-platform]` color rule in `styles.css`. New nav icons use `[data-icon]` with an entry in `js/icons.js`.

## Local preview

```sh
npx serve -l 8099 .
```

No build step; just serves the directory.

## Deploy

Hosted on Vercel (project `linktree`). Deploy = push/merge to `main`:

```sh
git push origin main
```

Vercel auto-builds and deploys to `links.falafelinhotpot.com`.

Cache rules and SPA fallback are configured in `vercel.json`.

## Notes

- Logo assets live in `images/png/` and **must be committed** — the site references them and Vercel deploys from git.
- `prefers-reduced-motion` is handled in both CSS and JS; WebGL pauses on hidden tabs.
- Social image (og/twitter) resolves against `https://links.falafelinhotpot.com/`.
