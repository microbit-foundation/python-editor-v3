# AI agent notes

## RAC/Panda migration

This app is migrating from Chakra UI to react-aria-components + Panda CSS
via `@microbit/ui`. **Read `RAC-MIGRATION.md` at the repo root before any
styling/theming/UI work** — it is the status log and app-specific plan; the
method and gotcha catalog are in `../ui/docs/migration-playbook.md`. The
private theme package is the sibling repo `../python-editor-v3-microbit`.

## Commands

- Unit tests: `npm test` (vitest). E2e: run headlessly via
  `npm run test:e2e:headless`.
- `npm run typecheck`, `npm run lint`.
- Format with Prettier: `npx prettier --write` (no npm script).
- New source files need the licensing header — `npm run fix-licensing-headers` applies it.
