# Rendering modernization

## Scope

Replace custom rendering infrastructure with PixiJS, introduce typed contracts
and Vite, and use Anime.js for animation sequencing. Preserve the three paintings,
their typography, procedural assets, automatic journey, and water interactions.
Do not connect a weather service or redesign the artwork in this migration.

## Sequence

- [x] Record architecture, boundaries, and acceptance criteria before implementation.
- [x] Establish TypeScript and Vite; retain font and static-copy generation.
- [x] Adapt one scene to PixiJS and verify coordinates, alpha, and composition.
- [x] Migrate all scenes and remove the old GL device/resource/target implementation.
- [x] Integrate Anime.js with the existing single-clock lifecycle.
- [x] Update tests, deployment output validation, and dependency license notices.
- [x] Verify desktop/mobile visuals, motion, interactions, fallback, and recovery.
- [x] Sign commits, publish, and verify the deployed artifact.

## Acceptance

1. Strict TypeScript checking, focused module checks, unit tests, receiver tests,
   production build, and browser regressions succeed.
2. All three scenes render on desktop and portrait screens, with no missing fonts,
   overflowing content, uncaught errors, or invalid GPU operations.
3. Compare deterministic frames against the pre-migration artwork at the same
   resolution and simulation time. Investigate differences in texture orientation,
   alpha, lighting, ink edges, boat scale, and scene composition.
4. Fish, birds, foliage, water, and lights continue moving. Automatic and manual
   scene transitions work; the boat remains continuous across the journey.
5. Clicks outside water do not produce ripples; foreground geometry occludes them.
6. No extra animation loop survives hidden tabs, disposal, or GPU context loss.
   Resize releases textures and reuses programs; static fallback remains complete.
7. The build contains only allowed website files and required license notices.
   A deployment must not expose source, environment files, tests, or private tools.
8. Compare startup cost, frame submission cost, GPU resource counts, and output
   size against the baseline. Software-rendered CI is a regression signal, not
   evidence of actual phone GPU frame rates.

## Rollback

Keep the previous signed revision and deployed release available. Revert the
migration or switch the release through the existing deployment procedure if
acceptance fails. Do not remove the static fallback or ship two rendering engines
as a permanent workaround.

## Validation record

Local validation: strict type/module checks, nine unit behaviors, two receiver
tests, production output validation, and desktop/mobile browser regressions pass.
The browser suite also checks resource plateaus over 48 simulated hours and 24
resizes. A separate 120-second real-time rendering run passed. Neither test is a
claim of 48 hours of real rendering or indefinite leak freedom.

The six deterministic image comparisons use 960×640 and 390×844 at the same
simulation time. Ink and coast differ only by isolated one-level channel rounding.
City retains its composition, with small light-sampling differences: fewer than
0.15% of pixels differ by more than eight channel levels; mean channel difference
is below 0.06 on a 0–255 scale. Do not describe this as pixel-identical output.

Runtime source went from 70 JavaScript modules / 3,583 lines to 75 TypeScript
modules / 3,922 lines. The rendering adapter changed from 348 to 335 lines. Typed
contracts, library integration, and recovery handling offset the removed GL
implementation: this migration reduces custom infrastructure responsibilities,
not overall source line count. Documentation and tests are excluded from those
counts. No runtime module exceeds 180 lines.

All generated JavaScript assets together grow from about 113 KB to 468 KB;
the sum of individually gzipped files grows from about 48 KB to 142 KB. This
includes optional library chunks, not just initial transfer. Runtime packages are
bundled locally. The dependency bundle is a deliberate maintenance/size tradeoff.

An isolated 360×240 software-Chromium sample measured median warm CPU submission
around 0–0.1 ms before and 0.2–0.4 ms after migration. These short measurements and
shader compilation times are noisy and cache-dependent; they do not establish a
speedup or device FPS. GPU allocation counts are checked across repeated resize
and transition cycles; final teardown releases the context and owned resources.

Signed implementation `ac49973` was published after local acceptance. Live HTTPS
files matched the local artifact hashes. Desktop and mobile checks verified all
three scenes and fonts; source, test, documentation, and credential paths remained
unavailable from the published site.

The final accelerated run retained 21 textures, 3 shared geometry buffers,
2 framebuffers, 4 programs, and 1 vertex array after warmup and at 48 simulated
hours. Retained JS heap after forced GC was about 3.62 MB at the warm sample and
3.98 MB at the final sample; DOM nodes stayed at 27 and listeners at 3. This is
bounded growth within the regression threshold, not proof of zero allocations.
All tracked textures and buffers were released on renderer disposal.

## Library ownership follow-up

Pixi Ticker now owns frame scheduling and rate limiting. Anime timelines own
voyage interpolation, arrival callbacks, scene blending, and the rowing cycle.
The separate transition controller and manual RAF scheduling were removed.
Adaptive quality and randomized scene order remain application policy.

The shared boat uses Pixi Container, Graphics, and Sprite objects. The crew and
oar are animated through transforms instead of custom GLSL limb geometry. One
304×208 actor render texture is reused by all scenes, including crossfades, and
survives viewport resize. This replaces the viewport-sized boat texture; the
static fallback still paints its own complete boat when WebGL is unavailable.
Scene shaders retain artistic lighting, reflections, and foreground occlusion.
Fish and foliage remain procedural shaders; this phase does not migrate them.

The scheduling and journey modules shrink from 219 to 192 lines, including the
removed transition module. The boat shader shrinks from 36 to 11 lines. Overall
runtime source grows from 75 modules / 3,922 lines to 76 modules / 3,984 lines:
the explicit actor hierarchy and teardown offset these deletions. No runtime
module exceeds 180 lines. This is an ownership change, not a net code reduction.

All JavaScript assets total about 540 KB, or 166 KB when individually gzipped,
including optional chunks. Graphics support adds bundle weight and a small
offscreen pass; smaller boat textures do not establish a rendering speedup.

Strict checks, unit behaviors, production validation, and desktop/mobile browser
regressions pass. A dedicated actor test verifies orientation, rowing movement,
and a seamless cycle. Lifecycle coverage verifies one active frame loop,
back/forward cache resume, and explicit GPU teardown on ordinary departure.
Water-only input, perspective ripples, foreground occlusion, context recovery,
fonts, and the static fallback remain covered.

Across 48 simulated hours and 24 resizes, retained GPU allocations plateau at
23 textures, 5 buffers, 3 framebuffers, 5 programs, and 2 vertex arrays. Retained
heap rises from about 4.20 MB after warmup to 4.58 MB; DOM nodes remain at 27 and
listeners at 3. Disposal releases tracked textures and buffers and loses the
context. These accelerated checks are not proof of indefinite leak freedom.

A separate 120-second real-time run also passes, including automatic scene
changes. After the 60-second sample, retained heap grows from about 4.90 MB to
4.98 MB; DOM nodes remain at 108 and listeners at 39 in the full page. No browser
errors or invalid GPU operations occur. Longer target-device testing remains
necessary before claiming unattended-display reliability.
