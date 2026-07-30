# AI agent notes

## Styling/theming

This app uses react-aria-components + Panda CSS via `@microbit/ui`
(migrated from Chakra UI, July 2026). **Read the gotcha catalog in
`../ui/docs/migration-playbook.md` before styling/theming/UI work** —
Panda's static extraction rules and RAC behaviours catalogued there still
apply to new code. The private theme package is the sibling repo
`../python-editor-v3-microbit` (consumed via a manual `node_modules`
symlink locally — re-create it after `npm install`). The visual fidelity
harness is `npm run fidelity` (see `bin/fidelity.mjs`).

## Commands

- Unit tests: `npm test` (vitest). E2e: run headlessly via
  `npm run test:e2e:headless`.
- `npm run typecheck`, `npm run lint`.
- Format with Prettier: `npx prettier --write` (no npm script).
- New source files need the licensing header — `npm run fix-licensing-headers` applies it.
