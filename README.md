# Literary Garden

A Vite + React literary garden using the supplied watercolor artwork and locally bundled Crimson Pro.

## Current interaction

Enter the garden, then choose Lilac, Carnations, or Roses. Each plant grows independently through the five supplied illustrations over about 12 seconds. Bloomed flowers remain in place and sway gently. Select a bloom to read its illustrated name, quotation, and context, revealed in sequence. Carnations and Roses each have two selectable passages.

Reduced-motion preferences disable fades and swaying and shorten the growth sequence. Planting and passage controls support keyboard use.

The five literary moments come from the user-supplied `Mrs_Dalloway_5_Moments_Quotation_Context_Question.txt`. Context and questions are editorial text, distinct from Woolf's quotations. The two rose sentences can be expanded. Full sentences for Lilac and both Carnations passages await the referenced University of Virginia PDF; excerpts are displayed without inventing missing text. Content is maintained in `src/data/flowers.js`.

Questions are retained as content for Phase 3. Reflection inputs, response storage, the queue, and falling petals are not implemented yet.

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
- `src/App.jsx`: title transition and garden selection
- `src/components/PlantingArea.jsx`: independent growth, asset loading, and motion preferences
- `src/components/FlowerFrame.jsx`: non-destructive sheet viewports and clipping
- `src/components/FlowerReading.jsx`: sequential reading and sentence expansion
- `src/data/flowers.js`: artwork coordinates and five literary moments
- `src/index.css`: layout, typography, growth fades, and sway
- `vite.config.js`: Vite React integration

No automated test suite is configured yet.
