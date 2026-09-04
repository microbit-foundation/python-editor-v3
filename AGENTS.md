# AI agent notes

## Styling/theming

This app uses react-aria-components + Panda CSS via `@microbit/ui`.
Read `../ui/docs/hints.md` before styling/theming/UI work.
The private theme package is the sibling repo
`../python-editor-v3-microbit` (consumed via a manual `node_modules`
symlink locally — re-create it after `npm install`).

`@microbit/ui` is consumed as the **published package**, pinned in
`package.json`. To develop against a local `../ui` checkout instead — what you
want whenever a change spans the library and this app — symlink
`node_modules/@microbit/ui` to `../ui/packages/ui`, the same arrangement as the
theme package above. Re-create it after `npm install` (which restores the pinned
version), and regenerate clean afterwards (`rm -rf styled-system && npm run panda`) — incremental codegen does not detect external preset changes.
`resolve.dedupe` in `vite.config.ts` is what stops the symlinked package loading
its own copies of React and friends, so leave it in place either way.
After bumping the pinned `@microbit/ui` version, follow "Upgrading in an app" in
`../ui/packages/ui/README.md`.

## Analytics

Events go through `Logging` (`src/logging/`) and are documented in
`docs/analytics-events.md`; update the doc when adding or changing an event.
Names are snake_case with flat primitive params. gtag only exists on
Foundation builds (`VITE_FOUNDATION_BUILD`, see `index.html`), so OSS and
local dev log events to the console instead. The private theme package
supplies brand config only, including the `product` analytics slug.

## Commands

- Unit tests: `npm test` (vitest). E2e: run headlessly via
  `npm run test:e2e:headless`.
- `npm run typecheck`, `npm run lint`.
- Format with Prettier: `npx prettier --write` (no npm script).
- New source files need the licensing header — `npm run fix-licensing-headers` applies it.
