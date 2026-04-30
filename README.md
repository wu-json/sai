# sai

A collection of vibe-coded HTML art.

## Layout

```
works/<YYYY-MM-DD>-<slug>/<slug>.html   # one self-contained work per dir
.agents/skills/html-art/                 # skill: render-and-look loop for agents
```

Each work is a single HTML file with inline CSS/JS. No external network assets.

## Working on a work (with an agent)

The `html-art` skill drives an iterate → render → look loop using headless Chrome. Agents that support `.agents/skills/` (e.g. pi) load it automatically; otherwise point your agent at `.agents/skills/html-art/SKILL.md`.

## Working on a work (manually)

```bash
./.agents/skills/html-art/scripts/render.sh works/<date>-<slug>/<slug>.html \
    [--frames "0,1000,3000"] [--width N] [--height N]
```

Outputs PNGs and a `console.log` to `works/<date>-<slug>/.renders/` (gitignored).
