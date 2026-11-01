# DF-site-portfol

Small static portfolio website with three primary modes and four portfolio palettes:

- **Portfolio Mode** (default) — a clear portfolio page in Dwarf Fortress style, with Modern, Amber, Blood Moon, and Magma palettes.
- **Classic ASCII Mode** — the original interactive fortress map implementation.
- **Fortress Map Mode** — a living ASCII-style fortress with procedural dungeon generation.

## Run

No build step is required. Open `index.html` directly in a browser, or run a simple local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Mode switch

Use the top switcher buttons to change modes. The choice is saved in `localStorage` and restored after page reload. Fortress Map Mode is a full-screen 80 × 80 procedural dungeon generated with BSP space partitioning, cellular automata, a central stairwell, a main hall, rooms, connected corridors, and fan-shaped mining shafts. The map fills the available left panel, with rooms and corridors sharing one neon stone style. It also includes animated dwarves, a survey/inspect mode, zoom controls, a live event log, and a Regenerate control. The right-hand field notes contain two scrollable articles: how a dwarf fortress is structured and how the map-generation algorithm works.
