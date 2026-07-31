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

`@microbit/ui` is currently **also** consumed via a manual symlink to
`../ui/packages/ui`, because classroom's migration is adding to the library
and this app tracks those changes (`panda.config.ts` imports
`@microbit/ui/dense-preset`, which the pinned published version predates).
Re-create that symlink after `npm install` too, and regenerate clean
afterwards (`rm -rf styled-system && npm run panda`) — incremental codegen
does not detect external preset changes. Both go away when the pin moves to
the next published alpha.

## Commands

- Unit tests: `npm test` (vitest). E2e: run headlessly via
  `npm run test:e2e:headless`.
- `npm run typecheck`, `npm run lint`.
- Format with Prettier: `npx prettier --write` (no npm script).
- New source files need the licensing header — `npm run fix-licensing-headers` applies it.
