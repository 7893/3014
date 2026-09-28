# Development

Use Node.js 24 or newer. Install the locked dependencies with `npm ci`.
Run `npm run dev` for local development and `npm run build` for the deployable
static site. Vite serves source modules during development; it does not become
a server dependency for the published website.

## Editing

- Change interface text in `src/config/copy.ts`, then run `npm run sync`.
  The HTML template is `templates/index.html`; `index.html` is generated.
- Change geography and default conditions in `src/config/places.ts`.
- Edit composition and painting beside each scene in `src/scenes/`.
- Put shared brushwork in `src/drawing/`, motion in `src/motion/`, and layout
  in `src/styles/`. Do not embed interface strings in rendering modules.
- Font subsets regenerate during build from the configured text. Full font
  downloads stay in the ignored cache; keep the bundled font license notices.

## Verification

Run `npm run check`, `npm test`, and
`python3 -m unittest discover -s tests -p 'test_*.py'`.
Install Chromium with `npx playwright install chromium`, then run
`npm run build && npm run test:browser`.

`check` runs strict TypeScript checking, verifies generated text, and enforces
small source modules. Unit tests cover timing, wind, environment boundaries,
fish continuity, and font processing. Browser tests exercise the production
bundle, both viewport orientations, font rendering, transitions, context
recovery, static fallback, water masks, and resource lifetime.

Internal rendering tests use a separate Vite build under `.cache/browser/`.
The local test server exposes that fixture only to its own browser process;
`dist/` never contains the fixture, source files, or debug exports.

## Delivery

Builds include project, font, and bundled dependency notices. Runtime packages
are bundled locally; browsers do not fetch JavaScript from third-party CDNs.
Do not add private values to browser configuration or `VITE_*` variables.
See `../ops/README.md` for the restricted deployment procedure.

## Long-running displays

`npm run test:browser` includes 48 hours of accelerated journey progress,
interrupted transitions, 24 resizes, forced garbage collection, and checks for
bounded GPU objects, retained heap, DOM nodes, and listeners. This stresses
resource lifetime; it does not draw 48 hours of actual frames.

`npm run test:endurance` keeps the production page rendering for two real minutes.
Use `ENDURANCE_SECONDS=21600 npm run test:endurance` for a six-hour run, or
`ENDURANCE_SECONDS=86400 npm run test:endurance` for a day. Test on the actual
display/browser/GPU before unattended installation; software Chromium cannot
certify a particular graphics driver or indefinitely stable uptime.

Keep one Pixi Ticker frame loop. The render-rate and maintenance tickers advance
manually, and Anime timelines are paused and explicitly cancelled when replaced
or finished.
Scene caches are limited to three paintings; resizing destroys obsolete textures.
All passes share one fullscreen geometry. Internal resolution is capped at
1.8 million pixels to bound Canvas and GPU memory on high-density displays.
Renderer disposal releases owned textures/buffers and the WebGL context. Context
loss, page suspension, and static fallback are tested separately. Never hide a
leak with periodic page reloads or clear unrelated browser state.

Boat motion lives in `src/actors/boat.ts`; adjust the display hierarchy and Anime
keyframes there. Its local coordinate bounds live in `src/config/actors.ts`.
Do not recreate the previous GPU limb-distance functions or full-viewport boat
texture. Actor tests check texture orientation, movement, and a seamless cycle.
A real page departure disposes timelines, tickers, and renderer resources; a
back/forward-cache suspension only pauses them so restoration remains possible.
