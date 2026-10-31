# DF-site-portfol

Small static portfolio website with five visual modes:

- **Modern Portfolio Mode** (default) — a clear portfolio page in Dwarf Fortress style.
- **Classic ASCII Mode** — the original interactive fortress map implementation.
- **Amber Terminal Mode**, **Blood Moon Mode**, and **Magma Mode** — alternate portfolio palettes.

## Run

No build step is required. Open `index.html` directly in a browser, or run a simple local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Mode switch

Use the top switcher buttons to change modes. The choice is saved in `localStorage` and restored after page reload. Portfolio modes include CRT scanlines, character-by-character text reveal, a blinking cursor, pixel-style typography, and event shake feedback in the classic map.
