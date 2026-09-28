# Architecture

Follow the Boat is a static, procedural landscape artwork. Its three places are
the Li River near Xingping, Shimei Bay, and Beijing's Liangma River. Geometry,
palette, and composition express those places without claiming a surveyed view.

## Stack

- TypeScript defines scene, animation, environment, and rendering contracts.
- Vite provides development serving and produces the static deployment bundle.
- PixiJS owns WebGL programs, textures, render targets, and drawing submission.
- Anime.js provides authored timelines, driven by the artwork's single clock.
- Canvas 2D paints deterministic landscape textures and supplies a static fallback.
- GLSL retains the artwork's water, ink, lighting, wildlife, and transition effects.
- Playwright checks the shipped application, including mobile and GPU recovery.

There is no framework for DOM components, second rendering engine, 3D scene,
Spine runtime, or weather network dependency. Add dependencies only when they
replace an existing responsibility or implement an accepted requirement.

## Boundaries

`src/config` owns text and geographic references. `src/scenes` owns authored
composition, procedural painting, static fallback, and scene shaders. Shared
drawing primitives belong in `src/drawing`, not in a universal scene engine.

`src/rendering` adapts the scene contract to PixiJS. It owns texture lifetime,
render targets, uniform updates, and composition. Drawing modules neither fetch
data nor import the renderer. Cached Canvas paintings remain the source of
truth for appearance and water hit masks.

`src/motion` owns the journey and wildlife behavior. Anime.js replaces authored
timing/interpolation; analytic waves, wind springs, and animal deformation stay
in their appropriate CPU or GPU modules. A Pixi Ticker owns the application clock;
a manually advanced Ticker handles render-rate limits without scheduling another
frame loop. Anime owns voyage interpolation, completion, and actor timelines.
No library may start a competing
animation loop.

`src/environment` owns bounded render conditions and gradual changes. Geographic
coordinates in configuration are representative weather lookup points. A future
weather adapter must validate provider data, convert units, enforce freshness,
and return provider-independent conditions. Network requests never run per frame.
Rain and daylight rendering remain separate future work.

`src/actors` owns reusable Pixi display objects. The shared boat uses Containers,
Graphics, a procedural hull Sprite, and an Anime rowing timeline. Its small local
render texture supplies coverage and oar lighting masks to each scene's material;
shader code no longer constructs the animated person's limbs. Reflection and
foreground occlusion still use the scene's artistic material.

## Rendering contract

Each scene provides a deterministic Canvas painting, a GLSL fragment program,
and a complete static fallback. Shared actor geometry and water interactions
remain common. Scenes prepare lazily, reuse compiled programs across resize,
and release obsolete textures and targets.

City and coast render directly to the screen during normal playback. Ink keeps
its paper-compositing pass; transitions render both scenes and composite them.
Fullscreen targets acquire viewport storage only when used. Uniform vectors
are reused rather than allocated on each frame. City reflections reuse sampled
lighting, and shader work outside its visible region is skipped.

The renderer uses Pixi's WebGL backend. Custom GLSL does not become
WebGPU-compatible automatically. Texture orientation, straight/premultiplied
alpha, framebuffer orientation, and pixel coordinates must be verified during
migration. Preserve existing ink compositing rather than stacking generic filters.

An unavailable or unrecoverable GPU falls back to Canvas 2D. Context recovery,
hidden-tab suspension, resize, and back/forward restoration are explicit app
lifecycle responsibilities. Desktop and mobile retain the same scene controls.

## Build and delivery

The source tree, documentation, tests, font tooling, and deployment tooling are
not public website assets. Only `dist/` is shipped. Keep the short README as the
project introduction; engineering details live here and in `migration.md`.

Vite fills the single HTML template from configured text; font subsetting stays
a project-specific build step. Keep
font licenses, project LICENSE/NOTICE, and dependency notices in the distribution.
Do not publish source maps, credentials, private keys, or deployment destinations.
Browser environment variables are public: never put credentials in `VITE_*`.

Deployment remains a signed, clean checkout sent through the existing restricted
receiver. Preserve its archive allowlist and existing unrelated hosted files.
Do not change TLS, DNS, account privileges, or infrastructure during this migration.

## Maintenance rules

Use current stable major versions, pin resolutions in the lockfile, and review
major upgrades deliberately. Type checking is separate from Vite transpilation.
Keep modules focused and below the existing 180-line review threshold. Delete
superseded infrastructure instead of maintaining parallel old/new renderers.
Tests assert behavior and resource lifecycle rather than private GL call counts.

The migration is accepted only after the checks in `migration.md` pass; reduced
source size alone is not evidence of equivalent visuals or better performance.
