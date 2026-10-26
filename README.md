# DF-site-portfol

Small static portfolio website with two modes:

- **Portfolio Mode** (default) — a clear portfolio page in Dwarf Fortress style.
- **DF Mode** — the original interactive fortress map implementation.

## Run

No build step is required. Open `index.html` directly in a browser, or run a simple local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Mode switch

Use the top switcher buttons **Portfolio Mode** and **DF Mode**. The choice is saved in `localStorage` and restored after page reload.
