# Chakra → react-aria-components + Panda CSS migration

Status: **Step 3 (coexistence porting) in progress (2026-07-27) — the shared
`common/` dialogs are ported to `@microbit/ui`: ConfirmDialog, GenericDialog
(shell for 8), InputDialog, ProgressDialog, PostSaveDialog, MultipleFilesDialog.
Steps 1–2 complete. Verification for later batches is typecheck/build + a
runtime smoke check; full visual pass deferred (per owner) until more is
converted. Porting continues area-by-area.**

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
  (2026-07-27 differ run):** the sidebar Tabs variant diverges on *three*
  properties, not just the tablist background the census named — `tablist.
  background` (black → brand→blimpTeal linear-gradient), `tab._selected.
  color` (black → `brand.300`) and `tab._selected.bg` (`gray.50` →
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

- Tabs adoption: library recipe + this app's branded sidebar variant as
  preset-side styling.
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
  Button `outline` *is* still colorScheme-conditional (`color:
  {scheme}.{scheme==='brand'?500:600}`, hover `…?600:700`, bg transparent),
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
    is *darker* than `brand.700` (`#5c40a6`) — non-monotonic. Flag to
    whoever owns the palette; not a structure question.
  - **`withDefaultColorScheme('brand')` accounts for ~41 of the 56
    component diffs** (every `defaultProps.colorScheme → brand`). These are
    one config lever, **not** per-component structural extensions — handled
    at migration time by the recipe `defaultVariants` preset override the
    census already flagged, not by pre-work theme edits.

  **Classification of the 112 diffs.**
  - *A — token-value deltas (brand-preset territory, fine as values):* all
    `gray.50–800`, `teal.*`, `purple.*`, `blimpTeal.*` (new ramp),
    `brand.100–800`, `code.*`, `radii.button` (0.375rem→2rem; base preset
    standardises 2rem family-wide). Plus the ramp-shape asymmetry above.
  - *B — structural extensions (converge onto semantic tokens while on
    Chakra):* Button `outline`/`language`/`unstyled` + baseStyle radius;
    Alert `toast` per-status bg; Container `sidebar-header` bg; Tabs
    `sidebar` (×3 props); Tooltip `fontSize`.
  - *C — config-level, no pre-work edit:* the ~41 `defaultProps.colorScheme`
    diffs from `withDefaultColorScheme`.

  Base preset already carries the target semantic tokens: `languageText`/
  `languageTextHover` (→`brand2.500/600`), `toast{Info,Success,Warning,
  Error}Bg` (Info/Success/Warning=`teal.800`, Error=`danger.600`),
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
     tokens: `sidebarTablistBg` (a semantic token *can* hold the gradient
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
  Mechanism on Chakra: each component config was made *structurally
  identical* across the OSS (`src/deployment/default`) and private
  (`../python-editor-v3-microbit/src`) themes, with brand divergence moved
  into Chakra `semanticTokens` (a new `semanticTokens` block in each
  `theme.ts` — OSS holds the OSS value, private overrides the same names).
  Differ before → after: **56 → 43 component diffs, and every one of the 43
  remaining is a `defaultProps.colorScheme` (category C, from
  `withDefaultColorScheme('brand')`)** — no structural extension survives.
  Divergence now lives in section A (brand ramp values) + 8 `semanticTokens`
  (section C).

  Per-step outcomes (each verified by a differ re-run):
  1. Button radius — OSS `radii.button` → `2rem` + `baseStyle.borderRadius:
     'button'`; unified, no token (`radii.button` + `Button.baseStyle`
     diffs gone).
  2. Button `unstyled` — lifted to OSS as-is (diff gone).
  3. Tooltip — new OSS `components/tooltip.ts` (`fontSize: 'md'`) registered
     in OSS `theme.ts`; unified, no token (diff gone).
  4. Container `sidebar-header` — `bg: 'sidebarHeaderBg'` both sides
     (`black` / `brand.500`).
  5. Alert `toast` — identical `toastBgByStatus` map → `toast{Success,Info,
     Warning,Error}Bg` both sides (OSS = Chakra solid status colours; private
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
    verbatim as `--chakra-colors-sidebarTablistBg: transparent
    linear-gradient(to bottom, var(--chakra-colors-brand-500) 0%,
    var(--chakra-colors-blimpTeal-400) 100%) 0% 0% no-repeat padding-box`
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
  `background-image: linear-gradient(rgb(108, 75, 193) 0%, rgb(123, 205, 194)
  100%)` — i.e. `brand.500` (#6c4bc1) → `blimpTeal.400` (#7bcdc2) — exactly
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
  - **CSS (coexistence):** `panda` script = `panda codegen && panda cssgen
    --outfile src/styled-system.css && node ../ui/bin/unlayer-panda.mjs`;
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
    monorepo's copy — two Reacts. Fixed with `resolve.dedupe: ["react",
    "react-dom", "react-aria-components", "react-aria", "react-stately"]` in
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
    patterns now); the "don't show again" `Link as="button"` → `Button
    variant="link"` (css `color: brand.500`); the close `Button variant="solid"`
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
  - Build warning noted: an esbuild CSS-minifier `Expected identifier but
    found "0"` on the sidebar-gradient background shorthand; the gradient
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
  - `common/ModalCloseButton.tsx` may now be dead (GenericDialog/InputDialog
    use `@microbit/ui` ModalCloseButton) — grep + remove when convenient.

## Notes to revisit later

Parked items surfaced during pre-work — out of scope for the convergence
steps above, to raise with the relevant owner when convenient.

- **Private brand-ramp data nits (`../python-editor-v3-microbit`
  `src/colors.ts`).** Not structure — palette-value bugs for whoever owns
  the brand colours:
  - `brand.100` is `#e1dbF3` — stray uppercase `F`. Harmless to CSS but
    inconsistent with the rest of the ramp; normalise to lowercase.
  - `brand.600` (`#50388f`) is *darker* than `brand.700` (`#5c40a6`) — the
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
    `colorScheme` (`withDefaultColorScheme('brand')`). This maps *cleanly*
    onto the family `brand` role (ml-trainer's `brand` = primary interactive
    too), and is already true here — `brand` **is** the purple ramp. Nothing
    to do beyond confirming it at preset time.
  - **Teal = a code/content marker, not a general accent** — docs code
    snippets, drag-to-insert handles, simulator sensor icons, editor
    code-block backgrounds. The intent is explicit in
    `simulator/RadioModule.tsx` (`from === 'code' ? blimpTeal : brand` →
    teal = machine/code-origin, purple = user). It is **never** a button
    `colorScheme` and never general chrome.
  - **Why teal ≠ `brand2`:** ml-trainer's `brand2` is a *general secondary
    accent* (LED/progress/animation/toggle/status-chrome; even neutral gray
    in OSS, green only privately). Same slot number, different meaning — and
    a direct conflict: chrome/status fill is `brand2` (green) in ml-trainer
    but `brand` (purple) here. Aliasing this app's teal to `brand2` would
    misname it and cross the two apps' chrome onto opposite tokens.
    **Decision: treat this app's teal as an app-specific "code/content"
    semantic (sibling to the `code.*` category), not a family `brand2`.**
  - Genuine consistency that *does* hold: `toast*Bg` is on the `teal` ramp
    family-wide and this app's success/info toasts are already `blimpTeal.700`
    (kept). Errors/destructive on red/`danger` also aligns.
  - Within-app cleanup (independent): the `purple` and `teal` ramps are
    **unused by name** — the app references `brand.*` and `blimpTeal.*`
    exclusively — so they duplicate the canonical ramps. Consolidating to one
    purple + one teal ramp is a simplification, but watch the `code.*`
    palette, which hardcodes `teal.500`/`teal.700` hexes.

- **`languageText` base-preset default looks wrong (raise against `../ui`).**
  The base preset defaults `languageText`/`languageTextHover` to
  `brand2.*`, but **both** apps override it to their *primary* brand
  (ml-trainer → `brand.600`; this app → `brand.500`). Two apps overriding the
  same default the same way suggests the base-preset default should be
  `brand`, not `brand2` — a small family-level fix for the shared-ui repo.
