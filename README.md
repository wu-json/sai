# sai

A collection of vibe-coded HTML art.

## Layout

```
pieces/<YYYY-MM-DD>-<slug>/<slug>.html   # one self-contained piece per dir
.agents/skills/html-art/                  # skill: render-and-look loop for agents
```

Each piece is a single HTML file with inline CSS/JS. No external network assets.

## Working on a piece (with an agent)

The `html-art` skill drives an iterate → render → look loop using headless Chrome. Agents that support `.agents/skills/` (e.g. pi) load it automatically; otherwise point your agent at `.agents/skills/html-art/SKILL.md`.

## Working on a piece (manually)

```bash
./.agents/skills/html-art/scripts/render.sh pieces/<date>-<slug>/<slug>.html \
    [--frames "0,1000,3000"] [--width N] [--height N]
```

Outputs PNGs and a `console.log` to `pieces/<date>-<slug>/.renders/` (gitignored).
