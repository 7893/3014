# Rendering modernization

## Scope

Replace custom rendering infrastructure with PixiJS, introduce typed contracts
and Vite, and use Anime.js for animation sequencing. Preserve the three paintings,
their typography, procedural assets, automatic journey, and water interactions.
Do not connect a weather service or redesign the artwork in this migration.

## Sequence

- [x] Record architecture, boundaries, and acceptance criteria before implementation.
- [ ] Establish TypeScript and Vite; retain font and static-copy generation.
- [ ] Adapt one scene to PixiJS and verify coordinates, alpha, and composition.
- [ ] Migrate all scenes and remove the old GL device/resource/target implementation.
- [ ] Integrate Anime.js with the existing single-clock lifecycle.
- [ ] Update tests, deployment output validation, and dependency license notices.
- [ ] Verify desktop/mobile visuals, motion, interactions, fallback, and recovery.
- [ ] Sign commits, publish, and verify the deployed artifact.

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

Implementation and measured results are recorded here as each phase completes.
