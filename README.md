# PSB Auto Curing — 24/7 TV Performance Dashboard

A full-screen (1920×1080 / 3840×2160) performance dashboard built with **Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion**, styled after the dark **Finance Bento** visual system with self-hosted **Geist** & **Geist Mono** fonts.

---

## 1. Local Setup & Development

```bash
npm install
npm run dev
```

## 2. Production Static Build

```bash
npm run build
```

This outputs a static bundle to `/dist` with relative paths (`base: "./"`), so it can be served from any folder, Python static server, or static hosting provider.

## 3. Running with the Local Python Server & Admin Upload Page

```bash
python server.py
```
Or double-click **`START-DASHBOARD.bat`**.

- **TV Dashboard:** `http://localhost:8080/`
- **Admin Upload Panel:** `http://localhost:8080/#admin` (default password: `psb2026`, or pass `--password <your-password>`)

## 4. Deploying on Vercel

1. Push this project folder to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repository.
3. Configure build settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.

## 5. Agent Photos

> **Note:** Add agent photos to `/public/photos` named exactly like the agent in Excel, e.g. `public/photos/Chelsea Sayson.jpg` (square, 512×512, under 150 KB). The Python script copies them there automatically.
>
> - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`
> - If an agent has `photo: null` or the image file is missing, the dashboard automatically displays a clean circular avatar with the agent's initials and a consistent color hash.
