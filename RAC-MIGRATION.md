# Chakra → react-aria-components + Panda CSS migration

Status: **not started — census done (July 2026); semantic-token pre-work
can begin now, while still on Chakra.**

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
proper. Changing the OSS theme is acceptable where it simplifies — agreed
in principle; scope per component. Run the resolved-theme differ
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
  sidebar Tabs variant's background (OSS black → private brand
  **linear-gradient**): `sidebarHeaderBg`-type semantic tokens — a
  semantic token can hold the gradient privately, flat black OSS.
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
