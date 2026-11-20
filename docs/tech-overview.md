# Technical overview

This document discusses the components used to build the editor. It's a good starting point for working on the editor or for using ideas and components from the editor in other projects.

The document assumes some familiarity with the app as a user. [Try it out](http://python.microbit.org/v/3) before reading further.

## User interface

The editor is written in [TypeScript](https://www.typescriptlang.org/) using [React](https://reactjs.org/).

The user interface is built with the Foundation's shared `@microbit/ui` component library, which combines [react-aria-components](https://react-spectrum.adobe.com/react-aria/) for accessible component behaviour with [Panda CSS](https://panda-css.com/) for styling.

The project is bundled using [Vite](https://vitejs.dev/). The test runner is [Vitest](https://vitest.dev/) and we're using [eslint](https://eslint.org/).

We use Prettier to format code. Please set this up to format before committing changes, ideally on save (there's [a VS Code plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)).

The app has three pages: a home page, a projects page and the editor. See [Pages and routing](#pages-and-routing).

The editor's UI is split into different areas by the [workbench component](../src/workbench/Workbench.tsx). This component manages layout including expand/collapse of the sidebar and simulator and is a good starting point to navigate the codebase. The main areas are:

1. The sidebar on the left, with Reference, Ideas, API and Files tabs as well as settings and help menus.
2. The main editing area with the text editor for the current file, a breadcrumb with the project name and the open file, and the project action bar with buttons for key interactions. When a micro:bit device is connected over WebUSB, the serial area appears between the text editor and the project actions.
3. The simulator on the right, with its own serial area and controls.

The branding that you see on the [Foundation deployment](https://python.microbit.org/v/3) is not Open Source and is managed in a private GitHub project. This is swapped in via an alias for `theme-package` in the Vite config.

## Pages and routing

Routing uses [react-router](https://reactrouter.com/). The routes are set up in [router.tsx](../src/router.tsx) and the URLs are built in [urls.ts](../src/urls.ts).

- The home page is at the app's root and the projects page at `/projects`. Both are in [src/pages](../src/pages) and are built from components in `@microbit/ui-patterns`, which micro:bit CreateAI also uses, so the two apps present projects the same way. Page composition, the banner and the resource cards are specific to this app.
- The editor is at `/project`, with the sidebar's tab and position in the URL as `/project/:tab/:slug`. The editor used to be at the root, so its old `/:tab/:slug` URLs redirect.
- There is no project id in the URL. Which project a tab has open is kept in session storage.
- The editor route's loader chooses the project: the tab's current one, otherwise the most recently used, otherwise a new one with the starter program. The pages don't need a project, so they render without choosing one.

The Foundation's website links to the editor with a program in the URL, as a `#project:` link. [project-link.ts](../src/fs/project-link.ts) reads it once at startup. It becomes a new project when the editor first opens (or replaces the single project where there is no database), and is then removed from the address so that a reload does not open it again. Such links point at the root, so the home page sends the user on to the editor while a link is still waiting to be opened. A link that cannot be read is dropped.

When the editor is embedded in an iframe in controller mode, as micro:bit classroom does, the embedding page owns the project. The editor is then the only page, at the root, and there is no home or projects page.

## Projects and storage

Projects are stored in the browser, in IndexedDB, so a user can have several and come back to them. Nothing is stored on a server.

The pieces:

- [`ProjectsDatabase`](../src/fs/projects-db.ts) is the database, accessed with [idb](https://github.com/jakearchibald/idb). It has a `projects` store (id, name and a timestamp) and a `files` store keyed by project id and file name.
- [`FileSystem`](../src/fs/fs.ts) is what the editor reads and writes. It keeps an in-memory working copy of the open project and the MicroPython file system used to build a hex file. Its storage sits behind the `FSStorage` interface in [storage.ts](../src/fs/storage.ts).
- [`IndexedDBFSStorage`](../src/fs/indexeddb-storage.ts) is the `FSStorage` for one project in the database.
- [`Projects`](../src/project/projects.ts) lists, creates, opens, renames, duplicates and deletes projects, and keeps the file system on the open one. UI components go through it and never touch the database.

### Opening and saving

Opening a project loads its record and all its files in one read, then switches the file system's storage. Loading first means a failed read leaves the previously open project as it was.

Edits are written through as they happen. There is no separate "save" action for browser storage:

- Writes are coalesced per file for 300ms, then flushed as one transaction. The project's timestamp is the time of the edit, so "last modified" does not depend on when the flush ran.
- Pending writes are also flushed when the page is hidden or unloading. A transaction that waits on a read, or on its requests finishing, does not survive the page unloading. So a flush never reads before it writes, and one from a hidden or unloading page commits explicitly. This is why the storage holds the project's name and writes the whole project record each time, rather than reading the record and updating it.
- A flush at any other time checks, in the same transaction, that the project still exists.
- A failed flush is not retried. The in-memory copy still has the edit, the user sees a toast that stays until dismissed ("Browser storage full" when the quota is exceeded), and the error is logged once per session.

MicroPython itself is only needed to build a hex file or flash, not to edit. If it fails to load, projects still open and save, and loading is tried again the next time something needs it.

### More than one tab

Tabs tell each other about changes over a `BroadcastChannel`, naming the projects affected:

- Every tab refreshes its list of projects.
- A tab with a changed project open reloads it.
- A tab with a deleted project open stops writing it, and if the editor is showing goes to the home page with a message.

### Without IndexedDB, and embedded

If IndexedDB is unavailable, for example in some private browsing modes, the editor falls back to how it worked before projects were stored: one project in session storage, lost when the tab closes. There is no project management, the pages redirect to the editor, and the user is warned before closing a tab with unsaved changes.

In iframe controller mode the embedding page supplies and stores the project, and none of the above applies.

A tab that was open on a version of the editor from before the database has its project in session storage. It is moved into the database once, at startup, and becomes that tab's current project.

### Importing files

A hex file is always a whole program. Other files are added to the open project from the editor, and make a new project from the pages. [project-import.tsx](../src/project/project-import.tsx) handles both.

"Editor" below is the Files tab's Add files button or a drop on the editor.

| Input                        | Iframe, editor                             | No IndexedDB, editor | Database, editor                                            | Database, home or projects page                             |
| ---------------------------- | ------------------------------------------ | -------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| One hex                      | Replaces the project; asks first if edited | Same                 | New project named after the file; the editor switches to it | New project; the editor opens on it                         |
| Hex with other files         | Error                                      | Same                 | Same                                                        | Same                                                        |
| `.mpy`                       | Error                                      | Same                 | Same                                                        | Same                                                        |
| One `.py` script             | Added under its own name                   | Same                 | Same                                                        | New project named after the script, which becomes `main.py` |
| `main.py`                    | Replaces `main.py`; asks first             | Same                 | Same                                                        | New untitled project with that `main.py`                    |
| Several files, or a module   | Added; asks before overwriting any         | Same                 | Same                                                        | New untitled project; starter `main.py` added if none       |
| Idea from the Ideas tab      | Replaces the project; asks first if edited | Same                 | New project named after the idea                            | n/a                                                         |
| `#project:` link at startup  | Ignored; the host owns the project         | Replaces the project | New project                                                 | n/a                                                         |
| Host `importproject` message | Replaces the project                       | n/a                  | n/a                                                         | n/a                                                         |

### Design decisions

Some choices that are not obvious from the code:

- **The editor opens straight to code.** `/project` in a new tab opens the most recent project rather than asking the user to pick one. The editor has always been quick to get into, and some users bookmark it.
- **No project id in the URL.** The tab's project is kept in session storage instead. This may be revisited if projects are ever stored on a server.
- **Each deployment has its own database.** The database name includes the base path, so deployments that share an origin, such as production and beta, keep separate projects.
- **No warning before closing a tab.** The editor used to warn when a tab was closed with changes made since the last hex file was loaded or saved, because closing the tab lost them. With the database every edit is already stored, so there is nothing to warn about. The warning remains where there is no database.
- **Imports never overwrite silently.** With the database, a hex or an idea makes a new project rather than replacing the open one. Without it there is only one project, so the editor asks before replacing one that has been edited: in micro:bit classroom a student's dropped hex would otherwise replace the teacher's starter program without a word. Adding files that would overwrite existing ones asks first in every mode.
- **A project changed in another tab is reloaded, not merged.** The last write wins.

Known limits:

- An edit may still be lost if the page unloads in the few milliseconds that an ordinary flush is mid-transaction.
- Switching project waits for MicroPython if it is still loading, which is only noticeable on a slow first visit.
- Browsers can evict stored data, for example when the device is short of space. Safari removes it for a site that has not been visited in seven days of browser use.

## Connecting to the micro:bit via WebUSB, flashing and hex files

The [device folder](../src/device) contains WebUSB support for the micro:bit using [DAP.js](https://github.com/ARMmbed/dapjs). This includes an implementation of partial flashing which signficiantly speeds up subsequent flashing.

We're open to extracting this code to a separate NPM package if there's interest in reusing it. Expressions of interest and views on what should be in scope are very welcome.

To produce the correct data format to flash a micro:bit, we use the Foundation's Open Source [microbit-fs library](https://github.com/microbit-foundation/microbit-fs).

## The sidebar and educational content

The Reference and Ideas sidebar tabs show educational content that is managed in the Micro:bit Educational Foundation's content management system (Sanity CMS). This content is not Open Source. The content is sourced live from the CMS APIs. It will work for local development but non-Foundation deployments will see CORS errors.

You can substitute your own content by setting `VITE_SANITY_PROJECT` and `VITE_SANITY_DATASET` environment variables, overriding the defaults in `.env`. The schemas we use for Sanity CMS are [packaged as a plugin in this GitHub project](https://github.com/microbit-foundation/sanity-plugin-python-editor-v3/).

We also plan to explore adding Markdown documentation support as an alternative to Sanity CMS. You can follow the discussion on [#1160](https://github.com/microbit-foundation/python-editor-v3/issues/1160).

The API tab shows detailed documentation of the MicroPython API for users who need more detail than the curated content in the Reference tab provides. The API tab content is generated at runtime from the bundled type stubs for MicroPython. We do this using an enhancement to the Foundation's fork of Pyright. For more details see [Python code intelligence](#python-code-intelligence).

## Text editing

We use [CodeMirror 6](https://codemirror.net/6/). We selected it for its modern design, extensibility, accessibility and tablet/mobile support.

CodeMirror 6 has [great documentation](https://codemirror.net/6/docs/). The [system guide](https://codemirror.net/6/docs/guide/) is a particularly useful overview of the key concepts.

We've wrapped CodeMirror in a custom React component that configures and integrates it into our application. There are now a number of third-party React wrappers for CodeMirror that might be worth considering for other React applications.

We've written a number of non-trivial CodeMirror 6 extensions:

- A [code structure highlighting extension](../src/editor/codemirror/structure-highlighting) that uses CodeMirror's syntax tree (a concrete syntax tree) to highlight the block structure of Python programs. The aim is to make Python program structure clearer. The extension assumes four space indentation and aims to guide users towards correct indentation. We'd be open to packaging this separately if there was interest.
- A [custom version of CodeMirror's lint extension](../src/editor/codemirror/lint) that delays showing red gutter markers for the actively edited line. This uses another extension that tracks the actively edited line.
- An extension that integrates with the Reference and API sidebar tabs to allow [drag and drop](../src/editor/codemirror/dnd.ts) and [copy/paste](../src/editor/codemirror/copypaste.ts) of code snippets.
- A partial language server client, see [Python code intelligence](#python-code-intelligence) for more details.

## Python code intelligence

Modern code intelligence features depend on a good understanding of types in the users program.

The content in the API tab, lint messages/diagnostics, autocomplete and parameter help are all provided by a fork of Microsoft's Open Source Pyright language server that runs as a Web Worker integrated with CodeMirror using a custom language server client.

We use this together with our type stubs for [micro:bit MicroPython](https://github.com/microbit-foundation/micropython-microbit-stubs/).

We've written [notes on our Pyright changes in its Git repository](https://github.com/microbit-foundation/pyright/blob/microbit/THIS_FORK.md). The micro:bit usecases are simple relative to general purpose Web-based Pyright as we have a small code size and a fixed API.

We benefit from customising Pyright and control over the language server client, allowing us to carefully consider what we present to our educational users. We intentionally have fewer features and present simplified error messages and function signatures to our users.

We don't consider our CodeMirror language server client suitable for more general use without signficant work. It's feature support is limited and it has only been tested with our Pyright fork. It also has a number of hacks specific to the micro:bit MicroPython documentation.

In addition to Pyright, we also have a custom mapping, stored in our content management system, that allows the parameter help for the MicroPython API to link to the educational content in the Reference tab. This is what powers the "Help" link you see on the parameter help tooltip.

## Simulator

The simulator is a [separate project on GitHub](https://github.com/microbit-foundation/micropython-microbit-v2-simulator). The simulator project is a Web Assembly build of MicroPython with MicroPython's hardware abstraction layer implemented using an SVG board and other Web technologies. The Python Editor communicates with it over postMessage.

If you have a micro:bit MicroPython app that would benefit from it please consider embedding the simulator. We'd be very happy to discuss this further, please raise an issue or get in touch via [support](mailto:help@microbit.org).

The serial area and simulator controls below the board are part of the Python Editor project rather than the simulator. This allows embedders control over the user interface for the simulator interactions. The play action is kept inside the simulator project in part for technical reasons: iframe performance can be throttled if there is no user interaction. You may find our implementation of the controls a useful reference.

## Terminal

We're using [xterm.js](https://github.com/xtermjs/xterm.js) for our serial terminal, both for the device connection and the simulator. This is the same terminal component that's used in Visual Studio Code.

We've enabled the [screenreader mode](https://github.com/xtermjs/xterm.js/wiki/Design-Document:-Screen-Reader-Mode) by default as we have less of a focus on performance and this seems suitable for an educational setting.

## Feature flags

The editor supports a simple runtime feature flag system to:

- allow work-in-progress features to be integrated before they're ready for general use
- allow scenarios to be set up for user testing
- enable debug features

This system may change without notice. Flags are regularly added and removed.

The current set of flags are documented in [the source](../src/flags.ts).

Flags may be specified via the query string with repeated `flag` parameters,
for example, http://localhost:3000/?flag=oneFlag&flag=anotherFlag

By default, all flags are enabled for local development and branch builds.
They can be disabled with the special flag `none`.

## Translations

We manage translations via Crowdin. Different sources of text are integrated with Crowdin in different ways.

We use react-intl from [FormatJS](https://formatjs.io/) to manage user interface strings. These are stored in this repository in `lang/ui.en.json`.

In development, add strings to `lang/ui.en.json` and run `npm run i18n:compile` to regenerate the catalogs the app loads in `src/messages/` (gitignored; also run on install and before start, typecheck and build).

Other content:

- API documentation is managed in the [type stubs repository](https://github.com/microbit-foundation/micropython-microbit-stubs/) and reaches the editor as the `@microbit/micropython-microbit-stubs` npm package (see below)
- Reference and Ideas content is managed in the Foundation's content management system
- Common Pyright error messages are managed [in the Foundation's Pyright fork](https://github.com/microbit-foundation/pyright/blob/microbit/packages/pyright-internal/src/localization/simplified.nls.en-us.json).

### Moving strings to and from Crowdin

The editor, the stubs repository and the Pyright fork each have an `i18n.config.mjs` for [`@microbit/i18n-tools`](https://github.com/microbit-foundation/ui/tree/main/packages/i18n-tools), which downloads and uploads files one at a time via the Crowdin API rather than through a full project build and zip. `download`, `upload` and `status` need a Crowdin personal access token in `CROWDIN_PERSONAL_TOKEN`.

The `lang/ui.<lang>.json` files hold only what Crowdin has translated; the compile falls back to English for the rest, and `npm run i18n:tidy` keeps the files sorted and pruned (checked in CI).

The CMS content is managed separately by the Micro:bit Educational Foundation and is synchronized daily by an automated process.

#### Incorporating changes from Crowdin

Each of the three repositories has a translations-download workflow that runs weekly and opens a pull request; run it from the Actions tab for an earlier sync, or `npm run i18n:download` locally for the editor's UI strings.

The stubs and Pyright changes reach the editor differently:

- The stubs repository publishes its `typeshed.<lang>.json` to npm as `@microbit/micropython-microbit-stubs` when a GitHub release is created there. Renovate then opens a pull request here to take the new version. `npm run stubs` (part of `npm run generate`, run on install and before start, typecheck and build) copies the files into `src/micropython/main/`, which is gitignored.
- The Pyright fork's worker is built and vendored into `public/workers/` with [update-pyright.sh](../bin/update-pyright.sh), which expects a sibling checkout of the fork on its `microbit` branch.

#### Updating files in Crowdin

Run the translations-upload workflow from the Actions tab when the English copy is ready to translate, or `npm run i18n:upload` locally. Either shows what changes before uploading (`--dry-run` stops there). Tick "keep translations" for a correction, such as a typo, that translators need not revisit. The stubs repository uploads the same way with `npm run i18n:upload`; the Pyright fork, which does not install the tool, with `npx --yes --package @microbit/i18n-tools microbit-i18n upload`.

### Adding a new language

This process assumes the language is already in Crowdin and has at least some translations. `npm run i18n:status` shows how far each language has got.

When considering a new language it's worth checking early whether support is available in [lunr-languages](https://github.com/MihaiValentin/lunr-languages) as we need that support for our client-side search. Search is not currently supported for zh-CN and zh-TW due to the technical challenge of indexing those languages in the browser. ga-IE also lacks support in lunr-languages.

Steps:

1. Add the language to the stubs repository's `i18n.config.mjs`, run a sync there and cut a release.
2. Add the language to the editor repository:
   1. Add the language to `i18n.config.mjs`.
   2. Add lunr language support. See [search-client.ts](../src/documentation/search/search-client.ts).
   3. Update `supportedLanguages` in [settings.tsx](../src/settings/settings.tsx). You can add the language as a preview language. In this case it will only show up on the beta deployment and will be tagged as a preview in the UI.
3. Add the language to the pyright repository: its `i18n.config.mjs` and the switch statement in `localize.ts`.
4. Run a translation sync as documented above, take the stubs release and rebuild Pyright.

## Updating MicroPython

Follow the instructions in the [issue template](https://github.com/microbit-foundation/python-editor-v3/issues/new?assignees=&labels=&template=micropython-update.md).

We've previously explored using the feature flag support to run a beta of MicroPython on the editor beta deployment. This might be a good strategy for feedback in future, though we'd need to coordinate it with a beta of the simulator (we already use simulator staging on beta).
