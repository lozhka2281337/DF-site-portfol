# DF-site-portfol

Small static portfolio website with three primary modes and four portfolio palettes:

- **Portfolio Mode** (default) — a clear portfolio page in Dwarf Fortress style, with Modern, Amber, Blood Moon, and Magma palettes.
- **Classic ASCII Mode** — the original interactive fortress map implementation.
- **Fortress Map Mode** — a living ASCII-style fortress that works as an interactive resume menu.

## Run

No build step is required. Open `index.html` directly in a browser, or run a simple local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Mode switch

Use the top switcher buttons to change modes. The choice is saved in `localStorage` and restored after page reload. Fortress Map Mode contains four clickable rooms, animated dwarves, a neon stone grid, and a chronicle panel for the portfolio sections.
