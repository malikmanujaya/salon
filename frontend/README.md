# Lumora — Frontend

Salon management web app for Sri Lankan salons. Built with **Vite + React +
TypeScript**, **Material UI**, and **Framer Motion**.

## Stack

- React 18 · TypeScript · Vite 5
- MUI 6 (Material You + Grid v2)
- Framer Motion for animations
- React Router 6
- TanStack Query + Axios (wired up; ready for API calls)

## Getting started

```bash
cd frontend
npm install
cp .env.example .env   # adjust VITE_API_URL if needed
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Scripts

| Script           | Purpose                            |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start the Vite dev server          |
| `npm run build`  | Type-check (`tsc -b`) + production build |
| `npm run preview`| Serve the production build locally |
| `npm run lint`   | Run ESLint                         |

## Project layout

```
frontend/
├── public/                 # Static assets (favicon, etc.)
├── src/
│   ├── components/
│   │   ├── brand/          # Logo
│   │   ├── layout/         # Navbar, Footer
│   │   └── sections/       # Homepage sections (Hero, Features, ...)
│   ├── pages/              # Route components
│   ├── styles/             # Global CSS
│   ├── theme.ts            # MUI theme (Lumora brand)
│   ├── App.tsx             # Routes + layout shell
│   └── main.tsx            # React entry
└── vite.config.ts
```

## Branding

- **Name** Lumora ("a place that glows")
- **Palette** Deep purple `#1A0F1F`, orchid `#C77DFF`, rose `#E8B4B8`, gold `#D4A574`, ivory `#FAF6F2`
- **Display font** Playfair Display
- **UI font** Inter
