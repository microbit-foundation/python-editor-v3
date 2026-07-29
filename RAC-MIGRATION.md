# Chakra → react-aria-components + Panda CSS migration

Status: **Step 3 (coexistence porting) in progress (2026-07-29) — dialogs,
toast infrastructure, `common/`, `src/project/`, `src/settings/`,
`src/serial/`, `common/SplitView/`, `src/editor/`, and `src/workbench/`
all ported (incl. the RAC sidebar Tabs), plus `src/documentation/` and
`src/simulator/` — **every app component is off Chakra**; only App.tsx's
ChakraProvider and the deployment theme files remain (the kill-switch);
z-index token scale landed; the late-v3 density shrink is replicated in
the presets;
library gained Collapse, Fade, NumberField, Kbd, Code, Menu option
groups, `useMediaQuery`, `usePrevious`, TextField `autoCapitalize`,
Toast `closeAll`, Modal `contentStyle`. Decision: Tabs + SplitView stay
app-side (see App-specific items). Steps 1–2 complete. Remaining:
`src/simulator/`, `src/documentation/` (now unblocked by Collapse/Fade),
and the Chakra theme files themselves (kill-switch). Verification bar:
typecheck/build/lint + a runtime smoke check; full visual pass deferred
(per owner). Porting continues area-by-area.**

Method: follow the **migration playbook** in the `@microbit/ui` monorepo
(`../ui/docs/migration-playbook.md`) — the sequence, the gotcha catalog
(read it before porting anything), the kit scripts in `../ui/bin/`, and the
consumption setup in `../ui/packages/ui/README.md`. ml-trainer is the
completed reference migration (its frozen `RAC-MIGRATION.md` is the
archive). This doc is this app's status log and app-specific plan; keep it
current as the per-session handover.

## Goal

Replace Chakra UI with react-aria-components (behaviour/accessibility) and
Panda CSS (styling) by consuming `@microbit/ui`. The visual result must
closely match the current Chakra UI. Compare against the live branded
deployment (https://python.microbit.org/) — the OSS default theme is a
washed-out grey and hides real issues. The OSS-vs-private brand split
(`../python-editor-v3-microbit`) must be preserved, with the private
package changing in lockstep.

## Pre-work (shippable independently, before any Panda)

The census found the OSS/private split is **not token-clean** (unlike
ml-trainer's): the private theme structurally extends component configs.
Converge these onto shared structure driven by semantic tokens while still
on Chakra, so brand divergence becomes token values before the migration
proper. **Decision (2026-07-27): the OSS theme must not be structurally
different from private — the structural gaps are historical laziness (only
the private theme got updated), not brand intent.** So every step mirrors
the structure into OSS; divergence lives only in token values, and where a
value diff isn't brand-meaningful (an OSS oversight) the value is unified
outright rather than tokenised. This is the rule, not a per-component
judgement call — the only per-component question is "token or unify?", never
"converge or not?". Changing the OSS theme is expected, not just acceptable.
Run the resolved-theme differ
(`node ../ui/bin/diff-chakra-themes.mjs`, from this repo) first and rerun
it after every theme change while Chakra remains.

Known structural extensions to converge:

- Button: private adds `outline` (colorScheme-conditional colours),
  `unstyled`, `language` variants and a `baseStyle` radius. Define the
  variants once OSS-side with `languageText*`-style semantic tokens (the
  base preset already has `languageText`/`languageTextHover`).
- Alert `toast` variant recoloured per status privately (`blimpTeal.700`
  success/info, `code.error` otherwise) — fold into the library's
  `toast*Bg` status tokens.
- Container `sidebar-header` bg (OSS black → private `brand.500`) and the
  sidebar Tabs variant: `sidebarHeaderBg`-type semantic tokens — a semantic
  token can hold the gradient privately, flat black OSS. **Correction
  (2026-07-27 differ run):** the sidebar Tabs variant diverges on _three_
  properties, not just the tablist background the census named — `tablist. background` (black → brand→blimpTeal linear-gradient), `tab._selected. color` (black → `brand.300`) and `tab._selected.bg` (`gray.50` →
  `gray.25`). Convergence needs three tokens, not one.
- Private-only Tooltip config.
- Private theme also carries a full custom `gray` ramp (not just the
  family 10/25 additions) and extra ramps (`purple`, `teal`, `blimpTeal`).
- Private adds `withDefaultColorScheme("brand")`, and the OSS default
  button variant is `withDefaultVariant(outline)` (ml-trainer: secondary) —
  the library recipe's `defaultVariants` must be overridden in this app's
  preset at migration time.

## Census (July 2026)

Taken while planning the family migration; original context in
ml-trainer's archived doc. Same bones as ml-trainer: Chakra v2.10,
react-intl, react-icons, Playwright, and the identical
`deployment/default` + `theme-package` vite-alias split with a
`DeploymentConfig.chakraTheme` field — so the kill-switch shape (theme
moves build-time, `chakraTheme` dropped from the config) transfers
directly. ~157 tsx files, 127 Chakra import statements.

**Brand contract validated, with striking convergences**: OSS default is
`brand = gray` plus the same `gray.10`/`gray.25` additions (`#fcfcfc`/
`#f5f6f8`), `radii.button: 2rem`, Helvetica heading/body fonts, and a
`language` button variant that exists _only_ in the private theme — the
`languageText` semantic-token precedent applies verbatim.

**Generalisation categories ml-trainer didn't surface**:

- **Tokens consumed outside React as raw CSS vars**: CodeMirror's
  highlightStyle/themeExtensions hardcode `var(--chakra-colors-code-*)`,
  `var(--chakra-fonts-code)`; XTerm/Simulator/CodeMirrorView use
  `useToken` at runtime. Migrate onto the library's documented
  CSS-variable contract + runtime `token()` (see the package README).
- **App token namespaces**: `code.*` (syntax colours + `code.error`)
  lives in both OSS and private themes — a legitimate app-preset token
  category, part of this app's preset contract.
- **Toast**: uses per-call `position`; every call site is "top" except
  XTerm's multi-line-paste info toast at "bottom-right"
  (`src/serial/XTerm.tsx` — also untranslated), plausibly deliberate
  (near the terminal, where attention is). Decide during migration:
  shared Toast grows region placement, or the call site changes. The
  custom Alert `variant: "toast"` is covered by the library's Toast slot
  recipe + status tokens.
- Imperative promise-based dialog layer (`use-dialogs`' `Dialogs` class +
  ProgressDialog) renders controlled Modals with no trigger — fine on the
  library Modal (controlled `isOpen` is first-class).
- `zIndex.ts` numeric constants calibrated against third-party stacking
  (xterm layers, Chakra's 1500 overlay scale) — move to a z-index token
  scale.
- **29 files import `BoxProps`** and forward style props through plain
  wrappers — gotcha #9's biggest hazard class in the family; budget an
  explicit `css`-prop conversion sweep.

**Surface demand (census counts)**: overwhelmingly within the library's
existing surface (Text/Box/stacks/Button/IconButton/Modal family/Menu/
Tooltip/Link/Icon/Image/Input/Divider/List/Spinner/Progress/
VisuallyHidden). Real gaps this app needs, by usage: **Collapse + Fade**
(~14 files, docs sidebar; their Slide is the same framer-motion component
already ported); **Tabs** (one site but it's the app chrome, heavily
brand-divergent); Menu checkable items + divider (`MenuOptionGroup`/
`MenuItemOption`, `MenuDivider`); AlertDialog semantics for ConfirmDialog;
Table family (×3), NumberInput, Kbd, Code, Tag, Portal-as-primitive (×7),
FormControl+FormErrorMessage error slot, InputLeft/RightElement; hooks
`useMediaQuery` (raw queries incl. height-based), `usePrevious`,
`useClipboard`, `useToken`, `usePrefersReducedMotion`. These are library
work (playbook roadmap: core components go in the library, not app-side).
**Not needed**: Drawer, Card, Accordion, Popover-as-API, colour mode,
Chakra Heading (they compose Text).

## App-specific migration items (beyond the playbook sequence)

- Tabs adoption. **Decision (2026-07-29, owner): app-side, not a library
  component** — react-aria-components' Tabs/TabList/Tab/TabPanel provide
  the behaviour (incl. vertical orientation), styled by app-local Panda
  css driven by the converged sidebar semantic tokens. The census's
  "library work" call is superseded: the sidebar tabs are special-purpose
  chrome and no other family app needs tabs today; a generic library Tabs
  (horizontal/vertical) is parked until a second consumer exists — the
  RAC markup + a generalised recipe extract cleanly if that happens.
  SplitView likewise stays app-side (its Chakra use is incidental
  Box/Flex; the value is app layout machinery).
- CodeMirror + xterm + simulator styling onto the CSS-var contract;
  xterm's stylesheet into the `vendor` cascade layer.
- The 29-file BoxProps/style-prop-forwarding sweep (gotcha #9).
- z-index token scale replacing `zIndex.ts` constants.
- The paste-toast placement decision (above).
- Fidelity harness: Playwright is already in place; mask CodeMirror,
  xterm, and the simulator iframe. Run both sides (branded + OSS) at the
  kill-switch — the split here makes the dual run more important than it
  was for ml-trainer.

## Status log

- July 2026: census taken; playbook + kit extracted to `../ui`; this doc
  seeded. Nothing migrated yet. Two caveats for whoever starts:

  - The kit scripts were revived from ml-trainer's git history and
    generalised but have not been exercised since — the first
    `diff-chakra-themes.mjs` run here doubles as their validation.
  - `../python-editor-v3-microbit` pulled upstream changes on 2026-07-24
    that postdate the census — spot-check the census's private-theme
    claims against the current theme before acting on them.

- 2026-07-27: **differ run, validated, and classified; convergence order
  proposed (below) — awaiting review, no theme code changed.**

  **Kit validation.** `node ../ui/bin/diff-chakra-themes.mjs` failed on
  first run: the app's `node_modules/esbuild` carries only the
  `darwin-arm64` binary (macOS-populated tree, run on a linux-arm64 host).
  Per the playbook rule ("fix the script in ../ui, don't work around it
  here"), fixed in the kit rather than reinstalling app deps:
  `diff-chakra-themes.mjs` now resolves esbuild from the app repo first
  (to match the app's toolchain version) and **falls back to the kit's own
  esbuild** — same version (0.25.12), correct platform — when the app's
  binary won't launch, printing a one-line note. `packages: "external"`
  keeps `@chakra-ui/react` resolving through the app either way, so the
  fallback doesn't change what's diffed. Re-run clean: 56 token diffs, 56
  component diffs, 0 other, Panda cross-check skipped (no preset pair yet).
  This is the kit's first successful run in the family; the fix should be
  PR'd back to `../ui`.

  **Census cross-check (post-2026-07-24 pull).** Claims that still hold:
  Button `outline` _is_ still colorScheme-conditional (`color: {scheme}.{scheme==='brand'?500:600}`, hover `…?600:700`, bg transparent),
  plus `unstyled`, `language`, `baseStyle.borderRadius: button`; Alert
  `toast` per-status recolour is exactly `blimpTeal.700` (success/info) /
  `code.error` (else); Container `sidebar-header` black→`brand.500`;
  Tooltip private-only (`baseStyle.fontSize` sm→md); full custom `gray`
  ramp + `purple`/`teal`/`blimpTeal`; `withDefaultColorScheme('brand')` +
  `withDefaultVariant('outline')`. Discrepancies / additions found:

  - **Sidebar Tabs is broader than the census said** — three divergent
    props, not one (see the corrected Pre-work bullet above).
  - **Brand-ramp shape asymmetry:** OSS defines `brand.10/25/50/900`
    (brand = gray copy); the private `brand` ramp defines only `100–800`
    (no `.10/.25/.50/.900`). Low-risk — grep found **no app references to
    `brand.10/25/900`** — but the private ramp shape should be made
    intentional when the ramps move to the preset.
  - **Private brand-ramp data nits (brand-team, out of convergence scope):**
    `brand.100` is `#e1dbF3` (stray uppercase `F`); `brand.600` (`#50388f`)
    is _darker_ than `brand.700` (`#5c40a6`) — non-monotonic. Flag to
    whoever owns the palette; not a structure question.
  - **`withDefaultColorScheme('brand')` accounts for ~41 of the 56
    component diffs** (every `defaultProps.colorScheme → brand`). These are
    one config lever, **not** per-component structural extensions — handled
    at migration time by the recipe `defaultVariants` preset override the
    census already flagged, not by pre-work theme edits.

  **Classification of the 112 diffs.**

  - _A — token-value deltas (brand-preset territory, fine as values):_ all
    `gray.50–800`, `teal.*`, `purple.*`, `blimpTeal.*` (new ramp),
    `brand.100–800`, `code.*`, `radii.button` (0.375rem→2rem; base preset
    standardises 2rem family-wide). Plus the ramp-shape asymmetry above.
  - _B — structural extensions (converge onto semantic tokens while on
    Chakra):_ Button `outline`/`language`/`unstyled` + baseStyle radius;
    Alert `toast` per-status bg; Container `sidebar-header` bg; Tabs
    `sidebar` (×3 props); Tooltip `fontSize`.
  - _C — config-level, no pre-work edit:_ the ~41 `defaultProps.colorScheme`
    diffs from `withDefaultColorScheme`.

  Base preset already carries the target semantic tokens: `languageText`/
  `languageTextHover` (→`brand2.500/600`), `toast{Info,Success,Warning, Error}Bg` (Info/Success/Warning=`teal.800`, Error=`danger.600`),
  `statusBarBg`. **No `sidebarHeaderBg`/sidebar-Tabs tokens exist yet** —
  that name in the Pre-work list is a proposal; the sidebar token set is a
  front-load decision (playbook "Decisions to front-load",
  `statusBarBg`-family).

  **Proposed per-component convergence order** (rerun the differ after each;
  each step should move its rows out of section B into A or eliminate them —
  "brand divergence becomes token values, never structure"):

  1. **Button `baseStyle.borderRadius`** — add `borderRadius: 'button'` OSS
     baseStyle. **Decision (2026-07-27): OSS adopts 2rem** (converge to the
     family/base-preset value; OSS-grey-theme visual change accepted). The
     divergence disappears rather than becoming a token value. Trivial,
     lowest risk.
  2. **Button `unstyled`** — identical both sides; lift to OSS as-is. No
     token. Trivial.
  3. **Tooltip** — add OSS `Tooltip.baseStyle.fontSize`. **Decision
     (2026-07-27): set OSS to `md`, no token** — the sm/md split was an OSS
     oversight; both sides match and the divergence disappears.
  4. **Container `sidebar-header`** — introduce `sidebarHeaderBg` semantic
     token (OSS `black`, private `brand.500`); OSS container uses
     `bg: 'sidebarHeaderBg'`. First sidebar token — pairs with step 7.
  5. **Alert `toast`** — define the per-status container bg OSS-side against
     the base preset's `toast{Success,Info}Bg`/`toast{Error,Warning}Bg`
     tokens; app preset overrides Success/Info→`blimpTeal.700`, else→
     `code.error`. Retires the private-only status logic into tokens.
  6. **Button `outline` + `language`** — define both OSS-side. `outline`'s
     colours are already colorScheme-driven (brand ramp refs), so sharing
     the function OSS-side makes it structural-shared with value divergence
     living in the ramp. `language` uses the base preset's `languageText`/
     `languageTextHover` tokens (hardcoded `brand.500/600` privately →
     token overrides). Largest single step; retires two private-only
     variants.
  7. **Tabs `sidebar`** — last (app chrome, heaviest divergence). Three
     tokens: `sidebarTablistBg` (a semantic token _can_ hold the gradient
     string — flat `black` OSS / gradient private), `sidebarTabSelectedText`
     (`black`/`brand.300`), `sidebarTabSelectedBg` (`gray.50`/`gray.25`).
     OSS Tabs references the tokens; private preset overrides. Benefits
     from the token patterns established in steps 4–6, and from the
     `statusBarBg`-family front-load decision landing first.

  Not in this order: the `withDefaultColorScheme` `defaultProps` diffs
  (category C — migration-time recipe override, left on Chakra untouched)
  and the brand-ramp value/shape nits (brand-team, not structure).

- 2026-07-27 (later): **convergence executed — all seven steps landed in
  lockstep across both repos; differ shows zero structural divergence.**
  Mechanism on Chakra: each component config was made _structurally
  identical_ across the OSS (`src/deployment/default`) and private
  (`../python-editor-v3-microbit/src`) themes, with brand divergence moved
  into Chakra `semanticTokens` (a new `semanticTokens` block in each
  `theme.ts` — OSS holds the OSS value, private overrides the same names).
  Differ before → after: **56 → 43 component diffs, and every one of the 43
  remaining is a `defaultProps.colorScheme` (category C, from
  `withDefaultColorScheme('brand')`)** — no structural extension survives.
  Divergence now lives in section A (brand ramp values) + 8 `semanticTokens`
  (section C).

  Per-step outcomes (each verified by a differ re-run):

  1. Button radius — OSS `radii.button` → `2rem` + `baseStyle.borderRadius: 'button'`; unified, no token (`radii.button` + `Button.baseStyle`
     diffs gone).
  2. Button `unstyled` — lifted to OSS as-is (diff gone).
  3. Tooltip — new OSS `components/tooltip.ts` (`fontSize: 'md'`) registered
     in OSS `theme.ts`; unified, no token (diff gone).
  4. Container `sidebar-header` — `bg: 'sidebarHeaderBg'` both sides
     (`black` / `brand.500`).
  5. Alert `toast` — identical `toastBgByStatus` map → `toast{Success,Info, Warning,Error}Bg` both sides (OSS = Chakra solid status colours; private
     success/info→`blimpTeal.700`, warning/error→`code.error`). Retired the
     private-only per-status branch into tokens.
  6. Button `outline` + `language` — both defined identically OSS-side.
     `outline` stays colorScheme-conditional (value divergence flows through
     the brand ramp); `language` uses `languageText`/`languageTextHover`
     (both themes alias `brand.500`/`brand.600`, so the token names carry
     intent while divergence flows through the ramp).
  7. Tabs `sidebar` — `sidebarTablistBg` / `sidebarTabSelectedText` /
     `sidebarTabSelectedBg` both sides. The private gradient now lives in the
     `sidebarTablistBg` token (and the stray trailing `;` in the old inline
     gradient string was dropped in the move).

  Static checks: app `tsc --noEmit` clean for the theme changes (two
  pre-existing errors in `codemirror/lint` + `language-server/diagnostics`
  reproduce on the clean tree — unrelated); private-package `tsc --noEmit`
  clean; ESLint + Prettier clean in both repos. Files touched — OSS:
  `radii.ts`, `theme.ts`, `components/{button,alert,container,tabs}.ts`, new
  `components/tooltip.ts`; private: `theme.ts`,
  `components/{button,alert,container,tabs}.ts`.

  **Token mechanics verified (2026-07-27).** The differ validates structure,
  not rendering, so the two things it can't see were checked by resolving
  both themes through Chakra's `toCSSVar` pipeline (the private package was
  rebuilt first). Results:

  - **Gradient-in-a-semantic-token works.** `sidebarTablistBg` emits
    verbatim as `--chakra-colors-sidebarTablistBg: transparent linear-gradient(to bottom, var(--chakra-colors-brand-500) 0%, var(--chakra-colors-blimpTeal-400) 100%) 0% 0% no-repeat padding-box`
    (full background shorthand, nested var refs preserved, no trailing `;`);
    OSS resolves to `var(--chakra-colors-black)`. The Tabs sidebar variant
    references the token (`tablist.background → sidebarTablistBg`), so the
    var is consumed. `background: var(--prop)` holding a background shorthand
    is standard CSS and identical to the previous inline form.
  - **All 10 semantic tokens emit a var on both themes** (nothing undefined);
    toast tokens resolve per status (private success/info → `blimpTeal.700`,
    warning/error → `code.error`; OSS → green/blue/orange/red.500).
    Verification script: `scratchpad/verify-semantic-tokens.mjs` (throwaway).

  **Live fidelity confirmed (2026-07-27).** Ran a headless-Chromium
  side-by-side of the local branded build (private theme linked into
  `node_modules/@microbit-foundation/python-editor-v3-microbit`, vite dev)
  against the live `https://python.microbit.org/v/3`. The sidebar Tabs
  gradient renders **byte-identical** on both: computed
  `background-image: linear-gradient(rgb(108, 75, 193) 0%, rgb(123, 205, 194) 100%)` — i.e. `brand.500` (#6c4bc1) → `blimpTeal.400` (#7bcdc2) — exactly
  one gradient element (the tablist) on each side. Visually confirmed too
  (purple→teal sidebar, brand logo, brand-purple "Send to micro:bit"). So the
  inline-gradient-string → semantic-token refactor reproduces the production
  branded appearance exactly. Toasts were not triggered live, but their
  tokens are verified twice (differ + `toCSSVar`) and are ordinary colour
  refs (`blimpTeal.700` / `code.error`); a full toast pixel pass can ride the
  migration-time fidelity harness. Sandbox notes for whoever re-runs: the
  app's `node_modules` needed a clean reinstall (wrong-platform native
  binaries — rollup/esbuild), Chromium must be pointed at the sandbox proxy
  with credentials (env userinfo alone → 407, bypass loopback for the local
  server), and vite dev needs `CI=true` (+ same-command lifetime) to stay up.

- 2026-07-27 (step 2 — Panda foundation): **installed the Panda + preset
  stack in coexistence form; app unchanged on Chakra.** No components ported.

  - **Consumption:** `@microbit/ui` linked via `file:../ui/packages/ui` (it
    ships as source); survives installs. The private brand preset is consumed
    through the existing `node_modules/@microbit-foundation/python-editor-v3-microbit`
    symlink (manual — re-create after `npm install`, it's not a dep).
  - **Presets:** `panda.config.ts` (`eject: true`, `preflight: false`,
    `jsxFramework: react`, include app + `@microbit/ui/src`); app preset
    `src/deployment/default/panda-preset.ts` (the `code.*` palette + the
    sidebar/language semantic tokens the base preset lacks); private
    `src/panda-preset.ts` (brand/purple/teal/blimpTeal/gray ramps, `code.*`,
    and the brand-divergent semantic-token overrides — incl. the gradient
    `sidebarTablistBg`). Verified via cssgen: `brand.500` → `#6c4bc1`, and the
    gradient token interpolates `{colors…}` refs into
    `linear-gradient(var(--colors-brand-500) … var(--colors-blimp-teal-400))`.
  - **CSS (coexistence):** `panda` script = `panda codegen && panda cssgen --outfile src/styled-system.css && node ../ui/bin/unlayer-panda.mjs`;
    `panda:watch` = `panda-dev.mjs`; `prestart`/`prebuild`/`pretypecheck`/
    `prepare` regenerate. `styled-system.css` imported first in
    `src/index.tsx`. `styled-system` alias in tsconfig `paths` + vite. Output
    git/eslint/prettier-ignored; `panda.config.ts` added to
    `tsconfig.node.json`.
  - **Legacy Safari (required — targets Safari/iOS 14):** `postcss.config.cjs`
    runs `@microbit/ui/postcss-legacy-safari` (`expandLogicalShorthands`) +
    `@csstools/postcss-cascade-layers` in production only. Kept esbuild as the
    CSS minifier (existing `build.target` already pins the legacy floor), so no
    minifier switch was needed. At the kill-switch, prepend
    `@pandacss/dev/postcss` and drop the cssgen/unlayer wiring.
  - **Providers + i18n: deferred to step 3.** Nothing imports `@microbit/ui`
    at runtime yet (only the build-time base preset + postcss plugin), so
    `ToastProvider` and the `@microbit/ui` catalog compile land with the first
    shared component port, keeping this foundation behaviour-neutral.
  - **Verification:** `npm run panda` clean; `tsc --noEmit` clean (the two old
    codemirror errors vanished after the node_modules reinstall — dep bump);
    `npm run build` clean (8.9s); lint + prettier clean; headless re-render of
    the branded app shows the sidebar gradient unchanged. Two benign
    `sheet:process` empty-rule warnings during cssgen (extraction artifacts;
    the emitted CSS is clean) — likely gotcha #17 territory to tidy during
    porting.
  - **Differ improvement (`../ui`):** section D (Panda cross-check) now loads
    and deep-merges `@microbit/ui/base-preset`, so OSS tokens resolve as base
    ⊕ app (private as base ⊕ app ⊕ private) — without this, base-provided
    ramps read as `undefined` and false-mismatch. Result here: 55 → 13
    mismatches. The private (branded) `brand.100–800`/gray/teal/purple/code
    values all verify. The residual 13 are known and not preset bugs: the
    OSS-side `brand` reads blue (the family base default) vs the old OSS
    `brand`=gray, plus the parked brand-ramp shape asymmetry at
    `brand.10/25/50/900`, plus one whole-ramp differ artifact for `blimpTeal`
    (exists only in the private theme). Sandbox note: run needs Chromium
    pointed at the auth proxy and a `node_modules` reinstall for
    platform-native binaries (see the earlier fidelity notes).

- 2026-07-27 (step 3 — first port, pilot): **`common/ConfirmDialog.tsx`
  ported to `@microbit/ui`; renders byte-identical to live.** Established the
  porting pattern and shook out one critical integration gotcha.

  - **The port:** Chakra `AlertDialog`/`Button`/`Text` → `@microbit/ui`
    `Modal` (`role="alertdialog"`, controlled `isOpen`) + `ModalHeader`/
    `ModalBody`/`ModalFooter` + `Button`. `onClick` → RAC `onPress`. Cancel =
    default variant (now `outline`); destructive = `variant="warningSolid"`
    (the base recipe's danger-solid). Dropped the `leastDestructiveRef` focus
    machinery (gotcha #15) — least-destructive initial focus is now
    `autoFocus` on the cancel button (RAC's FocusScope honours it). Header
    `fontSize`/`level` set via css to match the old `Text as="h2" lg bold`.
  - **App preset button vocabulary (deferred from step 2, done here):** added
    python-editor's `outline` variant to the app preset's button recipe and
    set `defaultVariants.variant: "outline"` (census: OSS applies
    `withDefaultVariant("outline")`; the base recipe defaults to `secondary`).
    Verified the base `staticCss: { button: ["*"] }` covers the app-added
    variant (no extra staticCss needed).
  - **Gotcha #19 (new — dual React from dev-linking):** the ported dialog
    crashed at runtime (`useContext of null`) because `@microbit/ui` is
    consumed via `file:` symlink, so its `import "react"` resolved to the ui
    monorepo's copy — two Reacts. Fixed with `resolve.dedupe: ["react", "react-dom", "react-aria-components", "react-aria", "react-stately"]` in
    `vite.config.ts`. Typecheck + build passed regardless (runtime-only);
    added to the playbook gotcha catalog. A published package wouldn't hit it.
  - **Verified:** typecheck/build clean; drove the confirm-replace dialog
    (type → Project tab → Reset project) headless on the local branded build
    and live `python.microbit.org/v/3`. Both buttons byte-identical: Cancel
    `rgb(108,75,193)` (brand.500) 2px outline, Replace white-on-
    `rgb(229,62,62)` (red.500/danger), both 32px pill radius; layout matches.
  - **Minor, accepted:** the library's dialog footer uses a house-style
    `gap: 5` vs the old `ml={3}` — a slightly wider button gap, standardised
    across dialogs; visually within tolerance (override per-site if needed).
  - **Providers:** none needed yet — ConfirmDialog doesn't toast, and Modal's
    intl (close label) uses the existing `IntlProvider`. `ToastProvider` +
    `@microbit/ui` catalog compile still land with the first toast-using port.
  - Sandbox notes for re-running the visual check: `resolve.dedupe` requires
    clearing `node_modules/.vite` once; live needs the cookie-consent **and**
    welcome dialogs dismissed before driving the flow (local shows neither).

- 2026-07-27 (step 3 — dialog infrastructure): **ported the shared
  `common/GenericDialog.tsx` shell + `GenericDialogFooter` onto `@microbit/ui`
  Modal; the 8 consumer dialogs are untouched and render through it.**

  - **Shell:** Chakra `Modal`/`ModalOverlay`/`ModalContent` → `@microbit/ui`
    `Modal` + `ModalCloseButton`/`ModalHeader`/`ModalBody`/`ModalFooter`.
    Props API preserved (`header`/`body`/`footer`/`size`/`onClose`/
    `finalFocusRef`), so the consumers pass their still-Chakra content
    unchanged — it renders inside the RAC Modal fine during coexistence.
    `ModalContent minWidth 560px my="auto"` → `contentCss={{ minWidth }}` +
    `isCentered`. `size` typed as `ModalSize`.
  - **`returnFocusOnClose` is now a no-op** (kept in the props for API compat):
    RAC restores focus to the trigger by default (gotcha #15); `finalFocusRef`
    redirects it. Two consumers (NotFoundDialog, FirmwareDialog) still pass it;
    behaviour to spot-check if focus-return matters there.
  - **Footer:** `HStack` → Panda `styled-system/jsx` `HStack` (layout is Panda
    patterns now); the "don't show again" `Link as="button"` → `Button variant="link"` (css `color: brand.500`); the close `Button variant="solid"`
    → `variant="primary"`.
  - **Verified:** typecheck/build clean; `css`-prop + `HStack` styles confirmed
    present in the generated CSS (no gotcha #9 silent miss). Drove the
    PostSaveDialog (Save → name dialog → "Project saved", which exercises both
    the shell and `GenericDialogFooter`) headless on local branded vs live
    `python.microbit.org/v/3` — visually identical (header, body + purple
    "follow these steps" link, footer link + primary Close; ~5px vertical
    offset from `isCentered`, negligible). No console errors.
  - En route, confirmed the still-Chakra `InputDialog` ("Name your project")
    renders correctly in coexistence — good coexistence signal.
  - Build warning noted: an esbuild CSS-minifier `Expected identifier but found "0"` on the sidebar-gradient background shorthand; the gradient
    itself already renders byte-identical to live (step 2), so cosmetic — keep
    an eye on it at the kill-switch when CSS handling changes.

- 2026-07-27 (step 3 — common dialog contents): **ported the remaining shared
  `common/` dialogs' contents.** Verification bar for this and later batches:
  typecheck + build + a runtime smoke check (full visual pass deferred per
  owner).

  - **PostSaveDialog / MultipleFilesDialog:** bodies only (shell = ported
    GenericDialog). Chakra `VStack`/`Text`/`Link` → Panda `styled-system/jsx`
    `VStack` + `@microbit/ui` `Text`/`Link`; `spacing`→`gap`, `p={5}`→`p="5"`.
  - **InputDialog:** own Modal → `@microbit/ui` Modal + form. `Box as="form"`
    → Panda `styled.form`; submit refactored to a shared `submit()` (form
    `onSubmit` for Enter; footer Button `onPress` since it renders outside the
    form — RAC `onPress`, not a fake FormEvent). Cancel = default (outline),
    action = `primary`, `isDisabled` when invalid. `size` typed `ModalSize`.
  - **ProgressDialog:** own Modal → `@microbit/ui` Modal + `ProgressBar`
    (needs a required `aria-label` — used the `loading` message);
    `isDismissable={false}` + `isKeyboardDismissDisabled` (can't dismiss mid
    operation); Chakra `Progress` → `ProgressBar` (value 0–100, full width).
  - **Verified:** typecheck/build/lint clean; drove Save → the ported
    InputDialog ("Name your project") → the ported PostSaveDialog on the local
    branded build — both render, no console errors, PostSaveDialog body
    (Text/link) matches live. ProgressDialog not runtime-triggered (needs a
    flashing/device flow); static checks only.
  - `common/ModalCloseButton.tsx` is NOT dead yet — WelcomeDialog,
    FeedbackForm and AboutDialog (still Chakra) import it; retire it when
    those port.

- 2026-07-27 (step 3 — connect-dialogs family): **ported all 9
  `workbench/connect-dialogs/` files** (ConnectCableDialog, Overlay,
  WebUSBErrorDialog, TransferHexDialog, ConnectDialog, WebUSBDialog,
  FirmwareDialog, NotFoundDialog, ConnectHelpDialog). Same mapping as the
  common dialogs (Text/Link/Image → `@microbit/ui`; layout → Panda
  `styled-system/jsx`; Button `solid`→`primary`, default→`outline`,
  `onClick`→`onPress`). Done via a context-sharing fork; verified by me.

  - **Verified:** no `@chakra-ui` imports remain in the folder; tsc/build/
    lint clean; the one gotcha #9 risk (`css={{ minWidth: buttonWidth }}`)
    is safe — `buttonWidth` is a same-file literal const, and `min-width: 8.1rem` is present in the generated CSS. Smoke-tested "Send to micro:bit"
    → the ported ConnectDialog "Connect cable" renders correctly (illustration
    Image, "Don't show this again" link + outline Cancel + primary Next), no
    console errors.
  - **Flags for later:**
    - **FirmwareDialog** has a link-styled-as-primary-button (`<a>` +
      `button({ variant: "primary" })` classes) — there's no `@microbit/ui`
      link-button primitive. **Candidate for a shared `LinkButton` in
      `@microbit/ui`** (other apps will want it too).
    - **ConnectHelpDialog** `useMediaQuery("(min-width:768px)")` →
      `useBreakpointValue({ base:false, md:true })`. `useBreakpointValue` can
      return `undefined` on first render (mobile-first) — worth a look that the
      desktop layout appears correctly in the eventual visual pass.
    - `returnFocus` state in FirmwareDialog/NotFoundDialog is now effectively
      dead (GenericDialog's `returnFocusOnClose` is a no-op) — harmless, left
      to minimise the diff; remove later.
    - **SaveButton** (used inside NotFoundDialog) is still a Chakra app
      component — renders fine inside the ported dialog during coexistence;
      ports with the rest of the app chrome.

- 2026-07-27 (step 3 — workbench dialogs): **ported WelcomeDialog,
  FeedbackForm, AboutDialog; deleted `common/ModalCloseButton`** (all dialogs
  now use `@microbit/ui`'s). Via a context-sharing fork; verified by me.

  - **AboutDialog `<Table>` → plain HTML table with Panda `styled.table/tbody/ tr/td`** (owner decision: app-side, not a shared component — it's a simple
    version-info layout table). Cell padding/borders are approximate
    (`px="3" py="1"` + gray.100 bottom border ≈ Chakra `size="sm"`); confirm
    in the visual pass. Smoke-tested (Help → About): renders correctly — logos,
    heart image (native `aspectRatio`), the 3-row versions table with GitHub
    icons, Copy (outline) + Close (primary), and the "Read more" Collapse.
  - **`AspectRatio` → native `aspectRatio` CSS** (gotcha #11): a `Box` with
    `css={{ aspectRatio: "690 / 562" }}` etc., Image filling it.
  - **Kept Chakra in coexistence (library gaps):** `Collapse` (AboutDialog
    "read more" — roadmap: Collapse/Fade planned) is the one remaining
    `@chakra-ui` import in these files. `useClipboard` reimplemented inline
    (`navigator.clipboard` + 1.5s reset). `SimpleGrid` → Panda `Grid`;
    `useDisclosure` → `useState`.
  - **A11y:** these Modals have no `ModalHeader` (title in body / iframe), so
    each got an `aria-label` (RAC requires an accessible name). Fixed
    FeedbackForm's to be localized (`{ id: "feedback" }`) rather than a
    hardcoded English string.
  - `MicroPythonSection` stopped forwarding `BoxProps` (retired one gotcha #9
    hazard file; its single call site passed fixed literals).
  - **Still Chakra, ports later:** `common/YoutubeVideoEmbed` (used by
    WelcomeDialog; still Chakra `AspectRatio`) — renders fine in coexistence.

- 2026-07-27 (step 3 — toast infrastructure + common/ leaves): **the
  deferred providers/i18n step landed; toasts now render through
  `@microbit/ui`'s RAC `ToastProvider`, and `src/common` is ported except
  CollapsibleButton/FileInputButton.**

  - **i18n catalog merge:** new `bin/compile-lang.mjs` (adapted from
    ml-trainer's) replaces `formatjs compile-folder` in `i18n:compile` —
    compiles each `lang/ui.<locale>.json` together with `@microbit/ui`'s
    shipped catalog so the `ui.*` strings ride the app's lazy per-locale
    chunks. The app had three locales the ui package lacked (de, ga-ie,
    zh-cn); catalogs for them were added to `../ui` with `ui.close-action`
    lifted from this app's translated `close-action` (the only exact
    match — it's also the only user-visible ui string). The four
    toast-status screen-reader words stay English in those catalogs
    pending Crowdin, matching the untranslated entries in the existing
    Crowdin-sourced ones. Committed `src/messages/*.json` regenerate with
    the merged ids.
  - **`<ToastProvider />`** mounted in App.tsx directly inside
    `TranslationProvider` (its close label/status announcements need
    intl). The library `useToast` is context-free (module-level queue), so
    the class-based callers (`ActionFeedback`, language-server client via
    constructor injection) work unchanged; toasts fired before the region
    mounts (e.g. TranslationProvider's own offline toast while messages
    are still loading) queue and display once it renders.
  - **Call sites ported:** `use-action-feedback.tsx` (Chakra `useToast` →
    library; `ToastFn` type replaces `CreateToastFnReturn` in
    `language-server/{error-util,client,pyright}.ts` + hooks), and
    `TranslationProvider.tsx`. Library gained `toast.closeAll()`
    (committed to `../ui`) for `ActionFeedback.closeAll`.
  - **Decisions/behaviour changes:** (1) _paste-toast placement resolved_ —
    the shared region has a single (top) placement; XTerm's bottom-right
    `position` argument was dropped rather than growing region placement
    in the library. (2) Success/info toasts asked for `duration: 2000`;
    RAC enforces a 5s minimum for accessibility, so short toasts now show
    ~5s. (3) The Chakra `variant: "toast"` prop is gone — styling is the
    library Toast recipe over the converged `toast*Bg` tokens. (4)
    `error-util`'s manual `isActive` guard dropped — the library dedupes
    by toast id natively.
  - **common/ leaves ported:** MaybeLink, AreaHeading, ErrorBoundary,
    Placeholder, Spinner, YoutubeVideoEmbed (figure + native
    `aspectRatio`, gotcha #11), ScrollablePanel, HeadedScrollablePanel,
    FileDropTarget, ExpandCollapseIcon. Consumers passed almost no style
    props, so the `BoxProps` extensions were dropped outright (narrowed
    APIs) rather than converted to `css` forwarding — four gotcha-#9
    hazard files retired (ScrollablePanel, HeadedScrollablePanel,
    FileDropTarget + ProjectDropTarget, Placeholder). Call-site tweaks:
    ShowMoreButton `ml={1}` → `css={{ ml: "1" }}`, SerialBar `transform` →
    `css`, ProjectDropTarget stopped forwarding BoxProps.
    ExpandCollapseIcon now renders react-icons' `MdKeyboardArrowUp/Down`
    via the library `Icon` — the same Material paths as Chakra's
    `ChevronUpIcon`/`ChevronDownIcon`, so the glyphs are identical.
  - **OSS preset:** added `gray.10/25` (`#fcfcfc`/`#f5f6f8`) mirroring the
    OSS Chakra theme — the family base preset's `gray.25` is `#f5f5f5`,
    and HeadedScrollablePanel's sticky heading consumes `gray.25` via
    Panda now.
  - **Deferred:** CollapsibleButton + FileInputButton (Button-family
    wrappers; port together with their consumers — project/ buttons,
    SerialBar, SideBarHeader — as the buttons batch).
  - **Verified:** app typecheck/lint/prettier/build clean; all 217 unit
    tests pass; `../ui` typecheck + prettier clean. Runtime smoke
    (headless Chromium on the local branded dev build): docs sidebar
    renders through the ported HeadedScrollablePanel/AreaHeading,
    ShowMoreButton + ExpandCollapseIcon toggle, and loading an invalid
    .hex raises the error toast through the new RAC region — top-center,
    status icon + bold title + description + close button, bg `#cd0365` =
    the private `code.error` via the converged `toastErrorBg` token. No
    console errors (dedupe intact).
  - Sandbox notes: Playwright browsers need
    `PLAYWRIGHT_BROWSERS_PATH=$TMPDIR/ms-playwright` (`~/.cache` not
    writable); harness background tasks are network-isolated from the
    sandbox, so vite dev + the Playwright script must run in the _same_
    Bash invocation; the WelcomeDialog _does_ appear on local now (it's
    ported) and must be dismissed (Escape / "Start coding") before
    driving the app.

- 2026-07-27 (step 3 — CollapsibleButton family + z-index tokens):
  **`common/` is now fully ported.** CollapsibleButton and FileInputButton
  moved to `@microbit/ui` Button/IconButton/Tooltip, with prop translation
  at all eight consumer sites; the planned z-index token scale landed.

  - **z-index tokens (app preset), prompted by a live gotcha-#9 find:**
    `zIndex={importedConstant}` is not statically extractable — the
    previous batch's `zIndex={zIndexBreadcrumbContainer}` only worked
    because the ui package's InputGroup happens to emit a literal `z_2`
    class. The app preset now defines a `zIndex` token per `zIndex.ts`
    constant (same names/values); Panda-side styles must reference tokens
    (`zIndex: "splitViewHideButton"`), never the imported constants.
    `zIndex.ts` stays for the remaining Chakra files — keep the two in
    sync until the kill-switch retires it.
  - **CollapsibleButton:** icon mode → `IconButton` (aria-label = text,
    base `fontSize: xl`), button mode → `Button` left/rightIcon.
    `_collapsed` kept, now a Panda `SystemStyleObject` merged after `css`.
    Dead `buttonWidth` prop dropped (no remaining callers). `data-testid`
    typed explicitly (RAC passes data-\* through at runtime, but the
    library prop types don't declare them).
  - **FileInputButton:** Chakra Tooltip/Input → library `Tooltip`
    (conditional — only when a tooltip is set) + a plain hidden `<input type="file">`. Note RAC placement syntax: `"top start"`, not Chakra's
    `"top-start"`.
  - **Consumer translations:** New/Reset/Save/Open buttons (library
    Tooltip, `onClick`→`onPress`); SerialBar expand/collapse (`unstyled`
    variant + `css`); SideBarHeader search button — the old empty
    `_hover={{}}`/`_active={{}}` resets became explicit re-assertions of
    the base colours (a `css` merge can't erase recipe hover rules), the
    width-derived `pr` calc moved to an inline `style` (runtime value, not
    extractable; icon mode keeps `p: 3`), and its broken `color="fff"`
    icon prop was dropped (was invalid CSS → inherited, which is what the
    library `Icon` does anyway); ProjectAreaNav Reset `colorScheme="red"`
    → `variant="warning"` (danger.500 vs Chakra's red.600 outline — a
    slight shade change, accepted; revisit in the visual pass if it
    matters); ProjectActionBar/SaveMenuButton style props → `css`;
    EditorArea's simulator-expand button `ml`/`boxShadow` → `css`.
  - **HideSplitViewButton:** ported wholesale (own narrow props now — the
    Chakra `IconButtonProps` extension is gone). The direction-dependent
    radii/rotation use property-level ternaries with literal branches —
    the extraction-safe conditional pattern (verified present in generated
    CSS). Chakra's `ButtonGroup isAttached` in SaveMenuButton still styles
    the RAC SaveButton correctly (it works via child CSS selectors) — the
    attached Save|⋮ pair renders as before.
  - **Verified:** typecheck/lint/build clean; 217 unit tests pass; smoke
    on the branded dev build: project-area buttons render (Reset =
    red-outline warning variant, computed `rgb(229,62,62)`), Tooltip shows
    on hover, dirty-project Reset raises the ported ConfirmDialog (Cancel
    works), sidebar collapse/expand toggles (computed: 20px icon mode,
    `#eaecf1` bg, brand.500 glyph, z-index 4 via token, 6px/0 conditional
    radii), simulator hide → editor-area "Simulator" text button →
    restore. No console errors. Bonus: a clean-project Reset fires
    `ActionFeedback.success` — the success toast verified end-to-end.
    Smoke-test gotcha for later sessions: RAC toasts have
    `role="alertdialog"` — don't mistake one for a dialog in assertions;
    and Reset only confirms when the project is dirty.
  - **Next candidates:** rest of `src/project` (FileRow, question dialogs,
    ProjectAreaNav chrome, SendButton/MoreMenuButton — Menu-dependent),
    or `src/documentation` (needs Collapse/Fade library work first for
    ~14 files), or `src/settings`.

- 2026-07-27 (step 3 — src/project): **the whole project area is ported;
  zero `@chakra-ui` imports remain in `src/project/`.** Two library gaps
  from the census closed en route.

  - **Library additions (`../ui`):**
    - **Menu option groups** — `MenuOptionGroup` (RAC `MenuSection` with
      section-scoped single selection: `value`/`onChange` radio API like
      Chakra's) + `MenuItemOption` (check indicator, space always
      reserved). Recipe gained `group`/`groupTitle`/`itemIndicator` slots.
      RAC renders the options as `menuitemradio` — better semantics than
      Chakra's. Requires RAC ≥1.4 (section selection); we're on 1.19.
    - **`useMediaQuery(query)`** hook for raw queries (this app's custom
      `widthXl` 1200px + height-based queries) — `useBreakpointValue`
      covers only the token scale.
    - **TextField `autoCapitalize`** — react-aria's TextField omits it
      from its DOM-props surface; forwarded to the input.
  - **Menus:** FileRow / SendButton / SaveMenuButton /
    ChooseMainScriptQuestion / MoreMenuButton onto
    `MenuTrigger`/`MenuList`/`MenuItem`. Chakra's `MenuButton as=` pattern
    becomes a plain library (Icon)Button as MenuTrigger's first child.
    **Dropped `Portal` + explicit menu z-index constants** — RAC popovers
    portal to body natively and the menu recipe's `zIndex: dropdown`
    (1000) already clears xterm (~10), which is all
    `zIndexProjectAreaMenu`/`zIndexAboveTerminal` guarded against.
    Split buttons (Send|⋮, Save|⋮) keep the attached look via the library
    `ButtonGroup isAttached` (MenuTrigger adds no DOM node, so the
    first/last-child radius selectors still see two buttons).
  - **Forms:** ProjectNameQuestion / NewFileNameQuestion onto the library
    `TextField` (label/helperText/errorMessage slots ≙ FormControl
    family); RAC `onChange` passes the string directly. NewFileNameQuestion
    keeps its app-side warning `Text` for the valid-but-noteworthy case
    (the error slot only shows when invalid — same as Chakra).
  - **Chrome:** ProjectArea/ProjectAreaNav/ProjectNameEditable/
    ProjectActionBar onto Panda layout + library Text/List/Tooltip.
    ProjectActionBar is now a `styled.section` (Panda styled components
    have no `as` polymorphism — Workbench's `as="section"` moved into the
    component) with a `css` prop for Workbench's border. project-actions'
    dialog/toast JSX moved to library Text/Link/List + Panda stacks.
  - **Dead code dropped:** FileRow's unused `projectName` prop; SendButton's
    tooltip-suppression `onFocus` hack (RAC tooltips open only on
    keyboard focus-visible, so the flash-completion refocus can't raise
    it); two invalid Chakra colour props that never resolved
    (`grey.800` on FileRow's menu button / ProjectNameEditable heading —
    note "grey" not "gray").
  - **Verified:** app+ui typecheck/lint/prettier clean; 217 unit tests;
    build clean. Smoke on branded dev build: file-row ⋮ menu (Edit/Save/
    Delete, Delete correctly disabled on main.py), Send⋮ Connect menu,
    Save⋮ "Save Python script", project rename via the TextField dialog
    end-to-end, create-file validation ("This file already exists" on a
    reserved name; file created), and loading a non-main .py raises
    ChooseMainScriptQuestion whose options menu renders group title +
    check indicator and switches selection. No console errors.

- 2026-07-29 (step 3 — src/settings): **the settings area is ported; zero
  `@chakra-ui` imports remain in `src/settings/`.** The census's
  NumberInput gap closed in the library.

  - **Library `NumberField` (`../ui`):** react-aria-components NumberField
    styled like Chakra's NumberInput — outline input (reuses the `input`
    recipe) + right-hand stepper column; new `numberField` slot recipe
    (root/group/stepper/stepperButton). Clamping to min/maxValue is
    react-aria's; `onChange` gets NaN when emptied (SettingsArea guards).
    Style hooks: `css`/`labelCss`/`groupCss`/`inputCss` — SettingsArea
    uses them for the label-beside-field row layout and the old sm size.
  - **App preset `sidebar` button variant** — the Chakra theme's
    ghost-based sidebar variant (white hover pill over dark chrome), with
    the callers' `color="white"` folded into the variant base (both call
    sites passed it; note the recipes-vs-utilities layering means a
    caller's `css` colour would beat the variant's hover colour, so the
    colour must live in the variant). SerialBar's still-Chakra
    `variant="sidebar"` IconButtons adopt it when serial ports.
  - **Ports:** SettingsDialog + LanguageDialog → library Modal (`solid`→
    `primary` close; `preserveScrollBarGap` dropped); LanguageDialog's
    `SimpleGrid columns=[1,1,2,2]` → Panda `Grid columns={{base:1,md:2}}`;
    the language cards use the base preset's `language` variant as-is.
    SettingsMenu → MenuTrigger + `sidebar` IconButton (`useDisclosure` →
    `useState`). SettingsArea → library NumberField/Checkbox (RAC
    `isSelected`/`onChange(boolean)`) + Text helper lines;
    SelectFormControl → library NativeSelect with a styled label row.
    Chakra's `alignItems="left"` (invalid CSS) became `start`.
  - **Verified:** app+ui typecheck/lint/prettier clean; 217 tests; build
    clean. Smoke on branded dev build: gear menu (Language/Settings),
    Settings dialog — font-size stepper 14→15, both selects change value,
    checkbox toggles; Language dialog — 12 cards in the 2-col grid,
    choosing Français switches the whole UI (Projet tab) and back. No
    console errors. Screenshots match the Chakra layout (CJK glyph boxes
    are a sandbox font gap, not an app issue).

- 2026-07-29 (step 3 — src/serial): **the serial area is ported; zero
  `@chakra-ui` imports remain in `src/serial/`.** First use of the
  runtime token contract.

  - **Library `Kbd` + `Code`** (census gaps): small styled components
    matching Chakra's key-chip and inline-code looks.
  - **`fonts.code` token** added to the OSS app preset ("Source Code Pro,
    monospace" — same value both themes, so no private override). XTerm's
    Chakra `useToken("fonts", "code")` became Panda's runtime
    `token("fonts.code")` — the documented CSS-variable/`token()` contract
    (first of the census's "tokens consumed outside React" items;
    CodeMirror + simulator still to come).
  - **Ports:** SerialArea → `styled.section` (callers' `as="section"`
    dropped; `backgroundColorTerm` constant via inline style; XTerm height
    via inline style so `SerialArea.compactSize` stays a shared constant);
    SerialBar (its three-way status `backgroundColor` uses inline style +
    runtime `token()` — a nested-ternary css value is not reliably
    extractable); SerialIndicators (narrowed props, `boxSize` →
    width/height — Panda has no boxSize utility); SerialMenu (MenuTrigger
    - first `MenuDivider` use + `sidebar` variant, `color="white"`
      dropped per the variant fold-in); SerialHelp → library Modal +
      Kbd/Code; TracebackLink/MaybeTracebackLink → library Link/Text.
  - **Verified:** both repos' static checks clean; 217 tests; build clean.
    Smoke via the simulator serial area: expand/collapse (Show/Hide
    serial), xterm mounts, serial ⋮ menu (Ctrl-C/Ctrl-D + divider + hints
    item), SerialHelpDialog with 4 kbd + 2 code chips (computed styles
    match: gray bg, 3px key border). `token("fonts.code")` resolves to
    "Source Code Pro, monospace" in the generated tokens (the terminal
    canvas gets it via the xterm option; the container inherits body font
    as before). No console errors.

- 2026-07-29 (step 3 — SplitView + placement decision): **SplitView
  ported app-side (4 files); owner decision recorded that neither
  SplitView nor Tabs become library components** (see the App-specific
  items section for the reasoning; generic Tabs parked until a second
  family consumer exists).

  - SplitView/SplitViewSized/SplitViewRemainder/SplitViewDivider → Panda
    Flex/Box + library Icon. The runtime-computed pane dimensions
    (`dimensionProps` calc strings) become inline styles; static
    conditionals (cursor, boxShadow, rotate) stay extractable ternaries.
    The divider bar's direction-dependent 10px dimension relies on the
    inline style beating the `height="100%"` class — same override the
    old Chakra prop-spread order produced. `zIndexDivider` constant →
    `splitViewDivider` token. BoxProps/FlexProps forwarding dropped
    (call sites pass `css`); two more gotcha-#9 files retired.
  - **Verified:** static checks clean; 217 tests; build clean. Smoke:
    both dividers render (col-resize cursor, z-index 3 via token, 10px
    #eaecf1 bar + dots icon) and dragging the sidebar divider resizes
    the pane (294→449px). No console errors.

- 2026-07-29 (step 3 — src/editor): **the editor area is ported; zero
  `@chakra-ui` imports remain in `src/editor/`.**

  - **App preset `zoom` button variant** (solid gray pills with darker
    hover/active for the zoom and undo/redo pairs; the old Chakra theme's
    "ideally we'd drop this variant" comment carried over). Chakra put
    the variant on the ButtonGroup and let it cascade — the library
    ButtonGroup doesn't cascade, so it's set per IconButton.
  - **Ports:** ZoomControls/UndoRedoControls → library ButtonGroup +
    IconButton (`isRound` + attached still square the inner edges — the
    group's child selectors out-specify the radius utility, matching
    Chakra); ActiveFileInfo (unstyled Button + css); ModuleOverlay
    (plain HTML table with Panda styled.th/td per the AboutDialog owner
    precedent — Chakra md-size approximation; another invalid `grey.800`
    dropped; `Link as="button"` → `Button variant="link"`);
    CodeMirrorView (`useToken("fontSizes","md")` → `token()`, BoxProps →
    css; CodeEmbed call site updated); EditorArea (header →
    `styled.section`; the three-way `pr` + imported `topBarHeight` go to
    inline style with runtime `token()`; responsive `display` arrays in
    css extract fine).
  - **Verified:** static checks + 217 tests + build clean. Smoke: zoom
    buttons render (private gray.100 pill, round outer edges) and change
    the editor font 18.7→22.7px; undo/redo pill is rotated vertical,
    disabled when empty history, enables after typing and reverts on
    click; creating a second file shows ActiveFileInfo's name +
    back-to-main link, which returns to main.py. No console errors.

- 2026-07-29 (step 3 — src/workbench, the app chrome): **zero `@chakra-ui`
  imports remain in `src/workbench/`.** The Collapse/Fade library gap is
  closed, unblocking `src/documentation/`.

  - **Library additions (`../ui`):** `Collapse` (CSS height transition with
    ResizeObserver-measured content — no framer-motion, like Slide;
    Chakra-compatible `startingHeight`/`endingHeight`/`unmountOnExit`),
    `Fade`, `usePrevious`, and Modal `contentStyle` (inline styles for
    runtime-positioned dialogs — the search modal aligns to the measured
    logo offset).
  - **RAC sidebar Tabs (app-side, per the placement decision):** SideBar/
    SideBarTab onto react-aria Tabs/TabList/Tab/TabPanel with app-local
    Panda styling over the converged tokens (the gradient
    `sidebarTablistBg` strip + `sidebarTabSelectedText/Bg`). Four RAC
    lessons for the gotcha file:
    1. _Tabs cannot be selection-less_ — react-stately force-selects the
       first tab (and fires onSelectionChange) when the controlled
       `selectedKey` is null, which re-expanded the collapsed sidebar in a
       loop. The collapsed sidebar now keeps the last real selection
       hidden; the index-based `active` prop drives selected styling, and
       clicking the hidden-selected tab expands via the tab's onClick
       (selection-change doesn't fire for same-key clicks).
    2. _Collection pre-render:_ RAC renders items once without attaching
       refs — effects touching `ref.current` need null guards (the
       every-render tabindex override crashed the whole app otherwise).
    3. _Native `:focus-visible` on a tabindex'd div matches pointer
       clicks_ (unlike on the `<button>` Chakra rendered) — the tab
       title's keyboard-focus underline uses react-aria's
       `[data-focus-visible]` (keyboard modality) only. Found in the
       owner's visual review, along with the corner SVGs rendering
       unpositioned: their offsets/size were template literals over the
       imported `cornerSize` constant — not statically extractable
       (gotcha #9's template-literal variant) — now inline styles.
    4. _TabList may only contain Tabs_ — the old single-column tablist
       (spacer + tabs + settings/help menus) became a wrapper Flex column
       carrying the gradient, with the TabList flexing between spacer and
       menus so the API tab's `mb:auto` still pushes Project + menus to
       the bottom. 5. _The panel's tabindex belongs to react-aria_ — its
       has-tabbable-child check re-renders `tabIndex` 0→undefined, so a
       tabindex set from outside React gets stripped, blurring a
       just-focused panel to `<body>` (and `TabPanelProps` accepts no
       tabIndex). The focus-follows-navigation target is now an inner
       `tabIndex={-1}` wrapper (`[data-panel-content]`) owned by React.
       Net keyboard behaviour: Enter on a tab moves focus into the panel
       (as Chakra did); the panel is no longer an extra tab stop (APG:
       panels with tabbable content shouldn't be) — one deliberate delta:
       Enter on the already-selected tab no longer resets the docs slug
       (Chakra buttons fired click on Enter; RAC divs don't) — the
       breadcrumb back link covers that path.
       Panels: `shouldForceMount` keeps all mounted (Chakra parity — note
       inert panels drop `role=tabpanel`, so don't probe by role alone);
       inactive panels are `[inert]` → display:none, and `setPanelFocus`
       sets tabindex=-1 before focusing.
  - **Other ports:** Workbench (library `useMediaQuery`, `styled.section`/
    `styled.main`); PreReleaseNotice; HelpMenu (RAC MenuItem's native
    `href` replaces Chakra's `as="a"`); SideBarHeader (library Fade, the
    search Modal via `overlayCss`/`contentCss`/`contentStyle`, Container
    `sidebar-header` variant → `sidebarHeaderBg` styled.div, query-pill
    Button with explicit hover/active neutralisation); AboutDialog's
    Chakra `Collapse` → library (the last Chakra import in the dialogs).
    The tab Corner SVGs' `var(--chakra-colors-gray-25)` →
    `var(--colors-gray-25)`.
  - **Verified:** static checks + 217 tests + build clean in both repos.
    Smoke on the branded build: 4 tabs over the exact brand gradient
    (`rgb(108,75,193) → rgb(123,205,194)`), selection switches with
    correct selected styling (#f5f6f8 bg, brand.300 text, 32px radius,
    corner notches), collapse → Expand-sidebar → re-expand cycle works,
    search modal opens aligned to the logo, help menu lists all items
    with dividers, About's read-more Collapse expands to the comic, beta
    strip renders. No console errors.

- 2026-07-29 (step 3 — src/documentation + the density discovery):
  **`src/documentation/` fully ported (26 files, via a context-sharing
  fork, verified by me), and a port-wide fidelity gap found and fixed:
  the late-v3 "make everything smaller" theme change had not been
  ported.**

  - **The density shrink.** The Chakra theme overrides the _numeric
    spacing/size scale_ (Chakra's 0.25rem grid × 0.88 —
    `src/deployment/default/common-sizes.ts`, feeding both `space` and
    `sizes`) and _fontSizes_ from `md` up (× 0.9; xs/sm kept —
    `font-sizes.ts`). Identical in the private theme. **Why every
    safeguard missed it:** the library base preset snapshots Chakra
    _defaults_; the theme differ compares OSS-vs-private (no diff — both
    shrunken); the Panda cross-check validated colours only; and
    per-component visual checks compared colours/radii, not px sizes.
    Everything Panda-rendered was ~12% roomier with ~11% larger mid-range
    text — noticeable across the app (owner spotted it) and the direct
    cause of the reference code embeds overflowing their panel
    (scrollWidth 352 vs 294, exposed as left-clipped content when
    hover-scrolled). **Fix:** the app preset now overrides
    `spacing`/`sizes`/`fontSizes`, importing the Chakra theme files as
    the single source of truth while Chakra remains. **Panda-side this
    lives only in the app preset** — the private brand preset stacks on
    top of it (`panda.config.ts` preset order) and needs no mirror; the
    private repo's own `common-sizes.ts`/`font-sizes.ts` copies serve
    its Chakra theme only and retire at the kill-switch. Verified: "Send to
    micro:bit" measures 42px h / 16.19px font / 21.12px padding (the
    theme's 2.64rem/1.012rem/1.32rem exactly) and the embed overflow is
    gone (294 == 294).
  - **Documentation port highlights** (fork report, verified): new
    `ImageWithFallback` (library Image has no fallback support);
    `docStyles` sx-object → module-level `css()` class; draggable code
    chips get library Tooltip via react-aria `Focusable` + `role= "button"` (they are interactive); Chakra Portal → `createPortal`;
    `useClipboard` added to the library, `usePrefersReducedMotion` →
    `useMediaQuery`; V2Tag app-side styled span (library Tag parked —
    single consumer overrides everything); ApiNode's padding arithmetic
    → literal token maps + explicit `css()` extraction hints (map
    lookups aren't extractable); test image mock removed (snapshots now
    assert real markup), matchMedia stub gained the modern listener API.
  - **Flags:** `MoreButton.tsx` appears to be dead code (ported anyway;
    deletion candidate). jsdom renders no `aspect-ratio` inline style in
    the image snapshots (pre-existing, was hidden by the old mock).
  - **Smoke:** reference topic browse + breadcrumb, code embed hover
    raise/copy/drag tooltip, API drill-down + signature chips, Ideas
    grid images, search (36 results, navigation closes dialog). Only
    console warning is the pre-existing Sanity defaultProps deprecation.
  - Remaining Chakra: `src/simulator/` (13 files) + App.tsx
    ChakraProvider + the deployment theme files (kill-switch).

- 2026-07-29 (step 3 — src/simulator, the last component area): **the
  simulator is ported (13 files, context-sharing fork, verified by me).
  `src/` is now Chakra-free except App.tsx's ChakraProvider + the
  deployment theme files — the kill-switch is next.**
  - **Library Slider extended** (`../ui`): `children` as positioned
    overlays inside the slider root (always-visible marks — the existing
    `mark` slot stays focus-revealed), `thumbTooltip`/`isThumbTooltipOpen`
    (tooltip-look bubble above the thumb), `onThumbFocusChange` (RAC
    FocusableProps). RangeSensor builds its min/max/value labels as
    app-side overlays with runtime inline positions; threshold marks use
    the library Tooltip's `triggerRef` escape hatch (non-focusable
    markers, as before).
  - **Deltas/decisions:** Chakra's `SliderThumbIgnoreAriaDescribedBy`
    double-announcement hack not replicated — react-aria renders one
    correctly-labelled hidden input (verified: `aria-describedby` empty,
    names resolve via the labelledby chain — "Light level", "Heading",
    etc.). RAC has no `aria-valuetext` passthrough, so SRs hear the bare
    number without the unit — `formatOptions` is the RAC-blessed route
    if wanted (units arrive as free strings from the sim; flag for an SR
    pass). RadioModule's composer is now a real form (send = submit).
    Another invalid `grey.*` token corrected (gray.200).
  - **Fix found in verification:** the compass needle ref was placed on
    the svgr component, which doesn't forward refs (the old Chakra
    `<Icon>` wrapper did) — rotation silently broke with only a dev
    warning. Ref moved to a wrapper span. _Pattern for the gotcha file:
    svgr components take className but not ref._
  - **Smoke:** slider drag (127→182) + live value marks, module
    expansion, Press-button-A/B, gesture select (freefall), radio input
    correctly gated until a group is joined, data-log table, compass
    needle transform, sim iframe brand-colour param (#6c4bc1), slider
    accessible names. No console errors after the ref fix.
  - **Owner review fixes (continued):** drag-handle dots too small —
    react-icons' RiDraggable draws finer dots than Chakra's bespoke
    DragHandleIcon; the original 10×10 glyph is now inlined in
    DragHandle.tsx (MIT, credited). Bullets visible in the API lists —
    the library List relied on Panda preflight for marker removal, but
    coexistence runs preflight-off; List now sets
    `listStyleType: none` itself (library fix, Chakra parity).
  - **Owner review fixes:** (0) ShowMoreButton's More/Less rendered
    semibold — the Chakra original was a Link (weight inherited normal)
    and the button recipe base is semibold; explicit
    `fontWeight: normal` added (check other Link→Button conversions for
    the same in the visual pass). (1) top-level docs items' right-arrow button
    did nothing — the Chakra button relied on its native click bubbling
    to the list item's onClick, which react-aria's press handling
    suppresses; the button now has its own `onPress={onForward}`
    (behaviour pattern for the gotcha file: _RAC buttons don't bubble
    clicks — parents relying on bubbling need explicit wiring_).
    (2) the thumb-bubble arrow rendered as a
    grey bar — Panda tokens don't resolve inside multi-value shorthands
    (the 4-value `borderColor` emitted verbatim and the browser dropped
    it). Per-side longhands fix it; catalogued as playbook gotcha #20.

## Notes to revisit later

- **App density (parked for team discussion, owner 2026-07-29).** The
  late-v3 shrink (spacing × 0.88, fontSizes md+ × 0.9) is replicated in
  the Panda presets for fidelity, but the owner intends to discuss with
  the team whether python-editor keeps its bespoke density or aligns
  with the family scale (the editor is more information-dense than the
  other apps, so there may be grounds to keep it). If alignment wins,
  delete the `spacing`/`sizes`/`fontSizes` overrides in
  `src/deployment/default/panda-preset.ts` (one commit: 96ec19c5) and
  re-run the visual pass.

- **Sidebar tabs: focus-follows-activation vs ARIA tabs pattern (parked
  2026-07-29 pending discussion).** Today, activating a tab moves focus
  into the panel (longstanding behaviour, restored after the RAC port).
  The ARIA tabs pattern would keep focus on the tab — better for
  arrow-key tab comparison and for magnifier users — and the change is
  cleanly separable (only the `!slug` arm of SideBar's router effect;
  `focus: true` navigation like the simulator's reference links should
  keep moving focus regardless; search/editor navigation never moved
  it). The sticking point is the extra Tab stops: with the app's
  all-tabs-tabbable override, keeping focus on the tab puts panel
  content ~3–5 Tab presses away after activation. Options to weigh
  together: (a) keep as-is; (b) ARIA pattern + keep the override
  (accept the stops); (c) ARIA pattern + standard roving tabindex (one
  stop for the whole strip, content one Tab away — but loses
  direct-Tab access to each tab). A tried-and-reverted implementation
  of (b) is in git history (18533ba5, reverted).

Parked items surfaced during pre-work — out of scope for the convergence
steps above, to raise with the relevant owner when convenient.

- **Private brand-ramp data nits (`../python-editor-v3-microbit`
  `src/colors.ts`).** Not structure — palette-value bugs for whoever owns
  the brand colours:
  - `brand.100` is `#e1dbF3` — stray uppercase `F`. Harmless to CSS but
    inconsistent with the rest of the ramp; normalise to lowercase.
  - `brand.600` (`#50388f`) is _darker_ than `brand.700` (`#5c40a6`) — the
    ramp is non-monotonic in lightness at 600→700. Likely a mistake; confirm
    the intended values before the ramps move to the Panda preset (a
    non-monotonic ramp will bake the oddity into the preset tokens).
- **Brand-ramp shape asymmetry.** OSS `brand` (= gray copy) defines
  `brand.10/25/50/900`; the private `brand` ramp defines only `100–800`. No
  app references to `brand.10/25/900` today (grep-clean), so it's latent —
  but decide the intended private ramp shape when the ramps move to the
  preset rather than carrying the asymmetry forward silently.

- **Cross-app `brand`/`brand2` mapping (2026-07-27 investigation) — teal↔
  brand2 does NOT map; parked.** This app has two brand hues — **purple**
  (`brand`/`purple` ramps, both centred on `#6c4bc1`) and **teal**
  (`teal`/`blimpTeal`, ~`#7bcdc2`) — over a gray/black/white base. Usage
  census verdict:

  - **Purple = primary interactive** — links, primary buttons, dialog
    accents, sidebar header/logo, focus/hover; it's the private default
    `colorScheme` (`withDefaultColorScheme('brand')`). This maps _cleanly_
    onto the family `brand` role (ml-trainer's `brand` = primary interactive
    too), and is already true here — `brand` **is** the purple ramp. Nothing
    to do beyond confirming it at preset time.
  - **Teal = a code/content marker, not a general accent** — docs code
    snippets, drag-to-insert handles, simulator sensor icons, editor
    code-block backgrounds. The intent is explicit in
    `simulator/RadioModule.tsx` (`from === 'code' ? blimpTeal : brand` →
    teal = machine/code-origin, purple = user). It is **never** a button
    `colorScheme` and never general chrome.
  - **Why teal ≠ `brand2`:** ml-trainer's `brand2` is a _general secondary
    accent_ (LED/progress/animation/toggle/status-chrome; even neutral gray
    in OSS, green only privately). Same slot number, different meaning — and
    a direct conflict: chrome/status fill is `brand2` (green) in ml-trainer
    but `brand` (purple) here. Aliasing this app's teal to `brand2` would
    misname it and cross the two apps' chrome onto opposite tokens.
    **Decision: treat this app's teal as an app-specific "code/content"
    semantic (sibling to the `code.*` category), not a family `brand2`.**
  - Genuine consistency that _does_ hold: `toast*Bg` is on the `teal` ramp
    family-wide and this app's success/info toasts are already `blimpTeal.700`
    (kept). Errors/destructive on red/`danger` also aligns.
  - Within-app cleanup (independent): the `purple` and `teal` ramps are
    **unused by name** — the app references `brand.*` and `blimpTeal.*`
    exclusively — so they duplicate the canonical ramps. Consolidating to one
    purple + one teal ramp is a simplification, but watch the `code.*`
    palette, which hardcodes `teal.500`/`teal.700` hexes.

- **`languageText` base-preset default looks wrong (raise against `../ui`).**
  The base preset defaults `languageText`/`languageTextHover` to
  `brand2.*`, but **both** apps override it to their _primary_ brand
  (ml-trainer → `brand.600`; this app → `brand.500`). Two apps overriding the
  same default the same way suggests the base-preset default should be
  `brand`, not `brand2` — a small family-level fix for the shared-ui repo.
