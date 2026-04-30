# sai

Repo for vibe-coding SVGs for use in React projects.

A blank monochrome canvas framed in a Japanese hanging-scroll (kakemono) — Sai‑from‑Naruto style: ink, paper, and bone.

## Stack

- [Bun](https://bun.sh) (package manager + runtime)
- [Vite](https://vitejs.dev) (dev server / bundler)
- [React 18](https://react.dev) + TypeScript

## Develop

```sh
bun install
bun run dev       # start vite dev server
bun run build     # type-check + production build
bun run preview   # preview the production build
```

## Layout

- `src/App.tsx` — scroll layout + a `<canvas>` that auto-resizes (DPR-aware) and is ready to draw on via `canvasRef`.
- `src/styles.css` — pure-CSS scroll: wood/lacquer rollers with bone finials, washi-paper field, double sumi-ink border. Fully monochrome.
- `index.html` / `vite.config.ts` / `tsconfig*.json` — standard Vite + TS scaffolding.
