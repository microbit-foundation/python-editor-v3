# AI agent notes

## Styling/theming

This app uses react-aria-components + Panda CSS via `@microbit/ui`
(migrated from Chakra UI, July 2026). **Read the gotcha catalog in
`../ui/docs/migration-playbook.md` before styling/theming/UI work** —
Panda's static extraction rules and RAC behaviours catalogued there still
apply to new code. The private theme package is the sibling repo
`../python-editor-v3-microbit` (consumed via a manual `node_modules`
symlink locally — re-create it after `npm install`).

`@microbit/ui` is consumed as the **published package**, pinned in
`package.json`. To develop against a local `../ui` checkout instead — what you
want whenever a change spans the library and this app — symlink
`node_modules/@microbit/ui` to `../ui/packages/ui`, the same arrangement as the
theme package above. Re-create it after `npm install` (which restores the pinned
version), and regenerate clean afterwards (`rm -rf styled-system && npm run
panda`) — incremental codegen does not detect external preset changes.
`resolve.dedupe` in `vite.config.ts` is what stops the symlinked package loading
its own copies of React and friends, so leave it in place either way.

## Commands

- Unit tests: `npm test` (vitest). E2e: run headlessly via
  `npm run test:e2e:headless`.
- `npm run typecheck`, `npm run lint`.
- Format with Prettier: `npx prettier --write` (no npm script).
- New source files need the licensing header — `npm run fix-licensing-headers` applies it.
