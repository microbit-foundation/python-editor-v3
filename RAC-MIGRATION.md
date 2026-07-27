# Chakra → react-aria-components + Panda CSS migration

Status: **semantic-token pre-work done on Chakra (2026-07-27) — all
structural OSS/private divergence converged onto shared component structure +
semantic tokens; differ shows zero structural diffs (only the
`withDefaultColorScheme` `defaultProps` diffs remain, by design). Static
checks green both repos; semantic-token CSS-var emission (incl. the sidebar
gradient) verified via `toCSSVar`. Pixel fidelity vs the live branded
deployment left as a migration-time harness task (see status log).**

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

  **Still nice-to-have — pixel fidelity against the live branded deployment.**
  The token mechanics are confirmed, but an actual side-by-side against
  https://python.microbit.org/ (sidebar chrome + real toasts) is still worth
  doing at migration time via the fidelity harness — not blocking now, and
  this sandbox can't reach the live host. A local branded run needs
  `npm run build && npm run preview` with `node_modules/@microbit-foundation/
  python-editor-v3-microbit` linked to the local private package (the vite
  `theme-package` alias points there; the private changes are
  unpublished/unpinned).

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
