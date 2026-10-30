# Literary Garden

Minimal Vite + React foundation for an interactive literary garden. Garden features and flower animations are not implemented yet.

## Requirements

Use Node.js 22.12 or newer (Node.js 24 LTS recommended) and npm.

## Development

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

Vite serves the app on port 5173 by default. No environment variables or external services are required.

## Production build

```sh
npm run build
npm run preview -- --host 0.0.0.0
```

The production output is generated in `dist/` (ignored by Git).

## Structure

- `index.html`: HTML entry point
- `src/main.jsx`: React bootstrap
- `src/App.jsx`: placeholder application
- `src/index.css`: base styles
- `vite.config.js`: Vite React integration

No automated test suite is configured yet.
