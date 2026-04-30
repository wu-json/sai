---
name: html-art
description: Iterate visually on a single-file HTML art work in this repo (under `works/`) with a render-and-look loop. Use when building, refining, or vibe-coding an HTML work, or whenever you need to verify how an HTML file actually looks. Renders the HTML to PNG via headless Chrome so you can `read` the screenshot and inspect the result.
---

# html-art

Works live at `works/<YYYY-MM-DD>-<slug>/<slug>.html`, one self-contained file each (inline CSS/JS, no network assets — they won't load under `file://`).

Editing HTML blind is unreliable. **Always render and look before claiming done.**

> **Vision required.** This skill's verification step relies on actually seeing PNGs. If you cannot read images, **do not use this skill** — skip the renderer entirely and tell the user you can't visually verify the result rather than rendering screenshots you can't inspect.

## Loop

1. Edit the HTML.
2. Render: `./.agents/skills/html-art/scripts/render.sh <html-path> [--frames "0,1000,3000"]`
3. `read` each produced PNG (the `read` tool shows images). If you skipped this, you have not verified.
4. If wrong, name the specific visual problem and go to 1.

## Renderer

```
render.sh <html> [--out <dir>] [--width N] [--height N] [--frames "0,1000,3000"]
```

Defaults: `out=<html-dir>/.renders`, `width=1280`, `height=800`, `frames="0"`.

Outputs `<out>/frame-<ms>.png` per frame, plus `<out>/console.log` (JS errors are grepped and printed).

`--frames` are virtual-time offsets in ms — Chrome advances the page clock so animations and timeouts fire deterministically.

| Work type                          | Frames                       |
|------------------------------------|------------------------------|
| Static / CSS-only                  | `"0"`                        |
| CSS animation                      | `"0,500,2000"`               |
| JS / canvas / RAF                  | `"0,1000,3000,8000"`         |
| Known cycle of T ms                | `"0,T/4,T/2,T"`              |

## Troubleshooting

- **Missing PNG / FAILED**: read `console.log`. Usually a JS error, an external resource, or `--frames` larger than the 20s wall-clock timeout.
- **Blank/white**: page threw before paint, or no explicit background.
- **Animated frames look identical**: animation never started — check `console.log`.
- Don't switch to `--headless=new` and don't share user-data-dirs across frames; both hang on macOS Chrome 147.

`.renders/` is build output (already gitignored).
