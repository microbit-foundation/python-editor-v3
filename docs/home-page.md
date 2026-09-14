# Python home page / multipe-projects support

New WIP version: https://review-python-editor-v3.microbit.org/home-page/ (pending PR merge)

Older prototype: https://review-python-editor-v3.microbit.org/multiple-projects-prototype/

The older prototype likely has nothing further to offer except as a comparison for one open question (the way home from the editor, see below).

## 1. What this is

The Python Editor gains a home page and a projects page, and keeps projects in an IndexedDB database in the browser, so a user can have more than one and come back to them. The editor moves to `/project`. The pages are built from shared components in `@microbit/ui-patterns`, lifted from ml-trainer, so the two apps present projects the same way.

Launch is coordinated with content, support articles and video, so the work sits on an integration branch and reaches `main` at launch or for a TBC beta period. A react-router routing foundation and the shared error page have aready shipped.

## 2. Where the work is

- `home-page` (python-editor-v3, origin): the integration branch, from `main` after #1326. Merge `main` into it rather than rebasing.
- `storage-foundation` → `home-page`: PR open, under review from 12 September. `FileSystem.switchStorage`, the projects database and per-project storage, session-storage migration and fallback, the review-stage clear-and-reload page.
- `projects-pages` → `storage-foundation`: stacked, local. Everything else in this document: routes, pages, import, editor chrome, header, notice, toasts, e2e. Pins the released `@microbit/ui` 0.5.0, `ui-carousel` 0.4.0 and `ui-patterns` 0.7.0; the `dev:link-ui` and `dev:link-theme` scripts are no longer in use here.
- `projects-pages` (private theme package): the home page images, the `AppLogo` and `OrgLogo` header components and the footer's `copyrightHolder`. A temporary branch build, `0.0.0-projects.pages.111`, is pinned in `build.yml`; merge and publish a release before landing.
- `shared-project-components` (ml-trainer): consumes the shared components. Bump its pins to the releases before merging.

Order once the storage PR is in: publish the theme package and pin the release, review `projects-pages`, land on `home-page`. At launch merge `home-page` to `main`; the database name includes the base path, so beta starts empty.

## 3. Reviewing and running it

There are still a lot of scenarios that haven't been manually exercised.

Easy to miss cases:

- **Iframe controller mode**, which the e2e suite covers only with a synthetic host page. Check the real embeds: `python-editor-embed`'s Storybook, and micro:bit classroom against a review build. Look at load, edits reaching the host, `importproject`, a dropped hex or Python file, the replace confirmation on an edited project, the before-unload prompt, and that no home or projects page is reachable.
- **No IndexedDB outside an iframe.** The session-storage fallback exists for this cohort, but it is not known whether the cohort is real. Test the browsers and modes that plausibly block IndexedDB (Firefox and Safari private windows, Chrome with site data blocked, a school-managed Chromebook profile if one is to hand, Safari's storage settings) and record what actually happens in each. If none blocks it in practice, the fallback can be simplified or dropped; if some do, that is the case the fallback has to be good at.

Notes for reviewers:

## 4. Design notes

### Storage

- Write-through via the existing `FSStorage` seam. `FileSystem` keeps its in-memory working copy; the persistent secondary is `IndexedDBFSStorage`, scoped to a project id, in place of session storage. Opening a project is `FileSystem.switchStorage`. There is one record of a project's content and no autosave loop.
- Schema: `projects` (id, name, timestamp) and `files` keyed by `[projectId, name]`, storing `Uint8Array`. Stores are asserted on open; a version mismatch shows a clear-and-reload page on non-public stages, which share one database. Production and beta databases are separate by base path.
- Writes are coalesced per file with a short delay and flushed on `pagehide` and `visibilitychange`, stamped with the edit time so "last modified" is the edit. A failed flush drops that batch, keeps the in-memory copy, logs once per session and shows ml-trainer's persistent toast: "Browser storage full" for a quota error, "Failed to save your project to browser storage" otherwise. Page actions that hit the quota show the same toast.
- Cross-tab: a `BroadcastChannel` carries `changed` and `deleted` project ids. Tabs refresh their lists; a tab with a changed project open reloads it; one with a deleted project open lets go of it. Timestamp bumps (e.g. from open) are not broadcast.
- No IndexedDB (private browsing, blocked storage): one implicit project in session storage as today, no project management, pages redirect to the editor. Iframe controller mode is unchanged: the host owns the project.
- Migration: on first load, session-storage files with no current project id become a new project with the stored name, and the editor opens on them. A `#project:` link takes precedence.
- The dirty flag is not stored in the database. The before-unload prompt applies only without the database, where closing the tab still loses work.
- Not done, deliberately: `navigator.storage.persist()` (Firefox prompts, Safari ignores it). The home page's info tooltip says projects are stored in this browser.

### Routing

- `react-router` 7, `createBrowserRouter`, one root layout route with `errorElement`, `urls.ts` builders as route paths, as ml-trainer. No project id in the URL; the tab's project is in `sessionStorage`.
- Editor at `/project` with tabs at `/project/:tab/:slug`; the old `/:tab/:slug` paths redirect; unknown paths are the shared not-found page. Iframe mode has a single-route router with the editor at the root.
- The editor route's loader chooses the project: the tab's, else migrated session storage, else the most recent, else a new one with the starter program. So `/project` in a fresh tab goes straight to code, which ml-trainer does not do; the editor is low friction today and some users bookmark it.
- The editor's project is chosen when its route loads, not at boot, so the pages render without one.

### Pages and sharing

- Shared in `@microbit/ui-patterns`: `ProjectCard` and its actions, `ProjectsToolbar`, `SearchInput`, `SortInput`, `NameProjectDialog`, the search, sort and selection hooks, and the `useProjectActions` flows. Kept per app: page composition, banner, resource cards, header, storage, import, the editor. No shared `ProjectsPage` body; revisit if paging arrives.
- Pages live in `src/pages/`; the `Projects` session in `src/project/projects.ts` owns storage switching and the cross-tab channel. Components never touch storage. Route loaders refresh the list so there is no empty-then-populated flash.
- Cards show the Python logo in brand colour, and no file list, since it would almost always say `main.py`. File names are still loaded for search.
- Header: organisation logo, divider, product wordmark, from `AppLogo` and `OrgLogo` in `BrandConfig`, the same `LogoProps` shape as ml-trainer. The OSS build has a text wordmark and no organisation logo; the SVG wordmark stays private because it is set in the brand typeface. The header buttons are pinned to 48px with a 24px icon because this app's dense preset would shrink them (see Open). Page header icon buttons use the `plain` variant, no hover state, as the family does; the editor's black chrome keeps `sidebar`.
- The projects page's back button is the white `toolbar` pill with ml-trainer's `BackArrow`, copied not promoted.
- The beta notice is a band under the page header with ml-trainer's copy and a Feedback button; the editor keeps its short sidebar notice, minus the "More" button. English only, since it shows on non-public stages only.
- Images: `theme-package/images/*` resolves per file, the branded package winning and `src/deployment/default/images/` standing in with ml-trainer's minimal grey placeholders. Project idea card images are the matching MICI pages' images (updated for the recent changes). `ResourceCard` fills its slide (`w="100%"`), which ml-trainer should copy so the width lives in one place.

### Import

- A hex is always a whole program. With the database it becomes a new project, named after the file; without it, it replaces the implicit project, asking first if there are unsaved edits. Ideas and `#project:` links behave the same way.
- From the editor, other files join the open project under their own names. Files that would overwrite existing ones ask first, in every mode.
- From the home and projects pages, everything becomes a new project that opens in the editor: a single script becomes `main.py` and names the project; otherwise names are kept and the starter `main.py` added if missing.
- The editor's drop target wraps the editor routes only. The pages have their own. This fixed two bugs found on 13 September: a drop on the projects page in a fresh tab waited silently on the storage promise and landed in whatever project opened next, and a drop on the home page left the app-level overlay stuck over the editor.
- Gone: Reset project, the Open button in the action bar, the choose-main-script dialog. The Project tab is Files, with Add files.

What each input does, by surface. "Editor" is the Files tab's Add files button or a drop on the editor. The pages only exist with the projects database; without it, and in iframe mode, their routes redirect to the editor.

| Input                        | Iframe, editor                             | No IndexedDB, editor         | Database, editor                                            | Database, home or projects page                             |
| ---------------------------- | ------------------------------------------ | ---------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| One hex                      | Replaces the project; asks first if edited | Same                         | New project named after the file; the editor switches to it | New project; the editor opens on it                         |
| Hex with other files         | Error toast                                | Same                         | Same                                                        | Same                                                        |
| `.mpy`                       | Error toast                                | Same                         | Same                                                        | Same                                                        |
| One `.py` script             | Added under its own name                   | Same                         | Same                                                        | New project named after the script, which becomes `main.py` |
| `main.py`                    | Replaces `main.py`; asks first             | Same                         | Same                                                        | New untitled project with that `main.py`                    |
| Several files, or a module   | Added; asks before overwriting any         | Same                         | Same                                                        | New untitled project; starter `main.py` added if none       |
| Idea from the Ideas tab      | Replaces the project; asks first if edited | Same                         | New project named after the idea                            | n/a                                                         |
| `#project:` link at boot     | Ignored; the host owns the project         | Replaces the project at boot | New project                                                 | n/a                                                         |
| Host `importproject` message | Replaces the project                       | n/a                          | n/a                                                         | n/a                                                         |

Against `main`: the replace confirmation used to gate a hex, an idea, reset and `#project:` links when the project was dirty; with the database those make a new project instead, and without it the confirmation remains. The choose-main-script dialog used to default a lone script to `main.py` and let the user pick; that default is the open question in section 6. Same-name replacement used to be shown in that dialog before confirming; it now has its own confirmation.

## 5. Copy for review

All new pages strings are new copy. Changed or notable:

- `homepage-banner-heading` "Python for the BBC micro:bit"; `homepage-banner-subtitle` "Write a program, try it in the simulator, then send it to your micro:bit." microbit.org's vocabulary, describing the flow to a student.
- `project-tab` "Project" → "Files"; `add-files-action` "Add files…"; `add-files-hover` "Add Python or other files to your project. A hex file opens as a new project."; `import-file-action` "Import" (ml-trainer's id and text).
- `load-error-mixed` → "A hex file can only be imported on its own."
- New: `confirm-replace-files-title` "Replace existing files?" and `confirm-replace-files-body`.
- Restored from `main` with translations: the confirm-replace strings. Copied from ml-trainer so Crowdin dedupes: `storage-error-*`, `project-storage-tooltip`.
- Never change shipped wording inside a refactor. Strings moved into ui-patterns keep their translations only if the ui-patterns Crowdin sync runs before the apps remove theirs; the sync is manual.

## 6. Open decisions and discussion

- **Home page banner artwork.** The background is ml-trainer's, brought across as a stand-in. It was drawn for CreateAI and does not suit this editor. A replacement drops in as `theme-package/images/banner-background.svg`.
- **A lone dropped script no longer becomes `main.py`.** The old dialog's default made it so; now it is added under its own name and only a file called `main.py` replaces main. Renaming is the workaround. Hex downloads have been encouraged over script downloads for some time, which may make this moot, but the case that matters is the editor embedded in micro:bit classroom, where there is no home page to import from. Options: treat a single script dropped on the editor as "replace main.py" with a confirmation, or a lighter dialog.
- **Where the welcome dialog appears.** Its state lives in the editor's sidebar, so a user landing on the home page sees nothing until they first open a project. Inherited, not chosen. Keep it in the editor, or lift it to the root layout. A re-recorded video's script probably decides this: a video that opens on the home page wants the dialog there.
- **"Learn more" on the banner** links to the user guide for now. Its target is undecided and may be a landing page, which means recasting the "new micro:bit Python Editor" announcement page.
- **Home page content.** The rows carry the prototype's project ideas, lessons and help cards as a first pass. The real list is to come, along with a feedback pass on cards, banner and copy once there is a shareable build.
- **The way home from the editor** is the sidebar logo, which links to microbit.org without the database or in iframe mode. The collapsed sidebar has no room for a separate home button; the prototype had one in place of the logos, which is the comparison worth looking at. Revisit with any header change.
- **Dense preset versus the shared pages.** This app stacks `@microbit/ui`'s dense preset; ml-trainer does not. The pages are now near-identical UI in both apps, so the difference is stark: the same `lg` icon button is 48px there and 42px here. The header pins its sizes as a visible hack. Options: accept the difference; pin more sizes as they come up; drop dense for this app (the editor was designed dense); or un-dense the pages by overriding token variables on the page root, which nothing does yet. The shared components are token-based, so the choice applies to them too.
- **Promotions to the ui packages**, when the shared header work happens: `BackArrow` (now byte-identical in both apps, the family's bar), the header pattern (logo, divider, wordmark, back button), the beta notice. Also the family-wide absence of hover and active states on icon buttons in the brand bar, which is a gap to fix in `@microbit/ui` rather than here.
- **ml-trainer follow-ups:** `ResourceCard` width as above; the `shared-error-pages` branches (ml-trainer, classroom, data-microbit-org) consume ui-patterns 0.6.1 and await review outside this stream.

## 7. Decisions taken, subject to review/discussion

- Iframe controller mode unchanged. Editor at `/project`; revisit if server-side projects arrive. New tab at `/` lands on home; `/project` goes straight to code.
- Database name namespaced by base path; review stages share one. `Uint8Array` in the files store.
- No IndexedDB: as the iframe path, with session storage kept as the fallback.
- Before-unload prompt only without the database. Dirty flag not stored.
- Without the database, a hex or idea asks before replacing an edited project. Revised 13 September: the first version dropped this, reasoning that the before-unload prompt protected the cohort, but that only guards closing the tab, and in classroom a student's dropped hex would silently replace the teacher's starter.
- Adding files that overwrite existing ones asks first, in every mode.
- Shared components in `ui-patterns`; no `ui-carousel` dependency there; no shared `ProjectsPage` body.
- Integration branch `home-page`, merged from `main`, PRs into it reviewed as normal. `projects-pages` stacked ahead of the ui releases, red CI accepted.
- The SVG wordmark stays in the private theme package. OSS placeholders are ml-trainer's minimal ones.
- Beta notice and header not shared yet; the "More" button is gone.
