# Performance

## Rendering work

The baseline is signed revision `423c365`. At 640×400, the browser profiler
observed these steady-state counts, including the small shared boat pass:

| Scene | Total draws, before → after | Fullscreen draws, before → after |
| --- | --- | --- |
| Ink | 3 → 3 | 2 → 2 |
| City | 3 → 2 | 2 → 1 |
| Coast | 3 → 2 | 2 → 1 |

City and coast now render directly to the screen outside transitions. Ink keeps
its paper treatment, and transitions keep both source scenes and compositing.
The two fullscreen targets start at one pixel and resize to viewport storage
only when requested. This delays allocation; it does not reduce peak transition
memory after both targets have been used.

City water no longer evaluates a sky result that is immediately overwritten.
Reflected lamps and their glow are sampled once and reused. Coast sky calculations
stop below the horizon blend. Expired pointer ripples skip source-mask sampling
in all scenes. Uniform vectors and the inscription DOM reference are reused.
No scene effect, animation rate, resolution cap, or mobile capability was reduced.

These changes remove work; they do not prove a particular FPS improvement.
Shader compilers can already eliminate some redundant expressions, and actual
gains depend on the GPU. The local browser uses software rendering, so startup
timings and CPU submission times are observations, not hardware benchmarks.
See the [Pixi performance guidance](https://pixijs.com/8.x/guides/concepts/performance-tips)
for the distinction between CPU and GPU costs.

## Repeatable checks

Run `npm run build`, then `npm run test:performance -- current`. Reports stay
under the ignored `.cache/performance/` directory. The report includes draw
counts for each scene, a fixed initial scene, long-task observations, loaded
scripts, and all generated JavaScript sizes, including optional chunks.
Compare on the same machine without concurrent browser jobs. Use a real target
device to assess frame time, thermals, battery use, and prolonged rendering.

The browser regression suite compares direct output with the composited route,
checks desktop/mobile transitions and water interaction, and stresses resource
lifetime through 48 simulated hours and 24 resizes. It also checks disposal,
context recovery, page suspension, and the static fallback. Accelerated time is
not a substitute for sustained rendering; see `development.md` for endurance runs.

Local acceptance passed strict checks, five unit-test files, two receiver tests,
the production build, development-template rendering, and the complete browser
suite. Six fixed frames (three scenes at 960×640 and 390×844) matched the baseline
pixel for pixel. The direct/composited route comparison also matched exactly.
The accelerated resource run retained 23 textures, 5 buffers, 3 framebuffers,
5 programs and 2 vertex arrays at both warm and final samples. Retained heap was
about 4.23 MB and 4.58 MB, respectively; disposal released tracked textures and
buffers. These samples are bounded regression evidence, not a no-leak guarantee.

## Repository maintenance

`index.html` is the only HTML template. Vite inserts escaped configured copy in
development and production; there is no committed generated HTML duplicate or
manual synchronization command. Static title/navigation initialization is no
longer duplicated in runtime code. Fonts and their notices live under
`src/assets/fonts/`. The obsolete Pages marker and sync script were removed.

Unused local variables and parameters fail TypeScript checks. Generated output,
dependency directories, local configuration, cache files, coverage, browser
reports, and Python bytecode stay ignored. Tests, lockfiles, required licenses,
deployment code, and historical engineering records remain maintained content.
