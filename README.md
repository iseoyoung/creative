# Literary Garden

A Vite + React literary garden using the supplied watercolor artwork and locally bundled Crimson Pro.

## Interaction

Enter the garden and choose Lilac, Carnations, or Roses. Branches extend, leaves unfold, buds appear, and flower clusters open over about 6.7 seconds (twice the previous growth speed). Flower artwork is 1.5× its previous size, anchored at the same root. Bloomed flowers remain visible and gently sway at the original speed. Each plant grows independently.

The illustrated name, complete quotation, editorial context, and reflection question appear in sequence. Carnations and Roses each have two passages. The full quotation is shown immediately, with no expand button. Long quotations and contexts scroll independently inside their own panels. Only the selected flower’s name is highlighted, using a pale flower-colored background (lilac lavender, carnation coral, rose pink). Other flower names in the same sentence remain plain; verified edition details are in [quotation sources](docs/quotation-sources.md).

Write a thought in the transparent input and use Send. Queue shows saved responses for that passage, one at a time. Every saved answer corresponds to one persistent petal, confined to its own flower’s planting column. Both passages are included for Carnations and Roses, and all response pages are loaded. New submissions appear immediately without duplicating a currently falling answer. Submitted thoughts become slow falling petals; select one to read its answer. Petals settle into small overlapping piles on the ground of their own flower area and remain clickable for the current visit. Refreshes add new saved answers without duplicating petals already falling or on the ground. On a new visit, saved answers fall again. Reduced-motion preferences disable swaying and automatic petal rain; a submitted answer appears as a stationary petal and then settles into the persistent ground pile.

The reading, reflection controls, and three planting areas share one viewport without vertical page scrolling. Text keeps its normal font size; long quotations, contexts, Queue answers, and petal answers scroll inside their own bounded areas. The page itself does not scroll. Long drafts can scroll inside the input. Drafts are retained separately for each question on the current device.

## Development and validation

Use Node.js 24 LTS (minimum 22.12) and npm.

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm test
npm run build
```

Vite defaults to port 5173 and includes the same `/api/responses` handler used by Vercel. The build is generated in ignored `dist/`. `npm run preview` serves the static build; it does not run the serverless API.

`npm test` exercises response validation, storage separation, pagination, rate limiting, the Redis adapter, and server error handling using isolated test data. It requires no remote credentials. These tests do not establish a live Upstash connection.

## Shared responses on Vercel

1. In Vercel, open this project's Storage/Marketplace integration and connect an Upstash Redis database to the project.
2. Ensure the production environment has **both** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. The equivalent integration names `KV_REST_API_URL` and `KV_REST_API_TOKEN` are also supported.
3. Redeploy the latest commit so the serverless API receives the variables.
4. Send an answer. The UI should say it joined the garden, and Queue should show “Other readers’ thoughts”. Confirm the answer appears from another browser/device.

Enter credentials securely in Vercel, never in chat or source files. They are server-only; do not prefix them with `VITE_`. For local shared-response development, copy `.env.example` to ignored `.env.local`, fill values securely, and restart Vite.

Without a configured database, the site explicitly saves only on the current device. It does not present those answers as other readers' responses. There are no fabricated sample answers. A failed configured database returns an error and preserves the user's draft; it does not silently switch to device storage.

Shared answers are anonymous and visible to readers. Each passage retains its latest 200 answers. The API validates passage identifiers, permits up to 500 Unicode characters per answer, and applies a five-per-minute submission limit per hashed client address. Raw client IP addresses are not stored in answers. A real deployment still requires a connected database and live cross-device verification.

## Structure

- `src/App.jsx`: title transition and garden selection
- `src/components/PlantingArea.jsx`, `FlowerGrowth.jsx`: growth and motion preferences
- `src/components/FlowerReading.jsx`, `FlowerQuote.jsx`: full quotations and flower-name colors
- `src/components/Reflection.jsx`, `ResponseQueue.jsx`: writing and reading answers
- `src/components/PetalRain.jsx`: submitted and replayed answer petals
- `src/data/flowers.js`: five scenes, questions, and original artwork coordinates
- `src/data/growth.js`, `organPaths.js`: growth timing and vector clipping metadata
- `src/data/responses.js`: browser storage and API client
- `api/responses.js`, `server/redis.js`: serverless response API and Upstash adapter
- `shared/responses.js`: shared input rules
- `tests/`: server and adapter tests
