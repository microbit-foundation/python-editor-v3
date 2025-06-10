# Technical overview

This document discusses the components used to build the editor. It's a good starting point for working on the editor or for using ideas and components from the editor in other projects.

The document assumes some familiarity with the app as a user. [Try it out](http://python.microbit.org/v/3) before reading further.

## User interface

The editor is written in [TypeScript](https://www.typescriptlang.org/) using [React](https://reactjs.org/).

We use the [Chakra UI component library](https://chakra-ui.com/docs/getting-started) which provides a base set of accessible components. We're currently using Chakra UI 2.x.

The project is bundled using [Vite](https://vitejs.dev/). The test runner is [Vitest](https://vitest.dev/) and we're using [eslint](https://eslint.org/).

We use Prettier to format code. Please set this up to format before committing changes, ideally on save (there's [a VS Code plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)).

The UI is split into different areas by the [workbench component](../src/workbench/Workbench.tsx). This component manages layout including expand/collapse of the sidebar and simulator and is a good starting point to navigate the codebase. The main areas are:

1. The sidebar on the left, with Reference, Ideas, API and Project tabs as well as settings and help menus.
2. The main editing area with the text editor for the current file, header with the project title and the project action bar with buttons for key interactions. When a micro:bit device is connected over WebUSB, the serial area appears between the text editor and the project actions.
3. The simulator on the right, with its own serial area and controls.

The branding that you see on the [Foundation deployment](https://python.microbit.org/v/3) is not Open Source and is managed in a private GitHub project. This is swapped in via an alias for `theme-package` in the Vite config.

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

We use react-intl from [FormatJS](https://formatjs.io/) to manage user interface strings. These are stored in this repository.

In development, add strings to `lang/ui.en.json` and run `npm run i18n:compile` to update the strings used by the app.

Other content:

- API documentation is managed in the [type stubs repository](https://github.com/microbit-foundation/micropython-microbit-stubs/)
- Reference and Ideas content is managed in the Foundation's content management system
- Common Pyright error messages are managed [in the Foundation's Pyright fork](https://github.com/microbit-foundation/pyright/blob/microbit/packages/pyright-internal/src/localization/simplified.nls.en-us.json).

### Running a translation sync

The CMS content is managed separately by the Micro:bit Educational Foundation and is synchronized daily by an automated process.

#### Incorporting changes from Crowdin

Use [update-translations.sh](../bin/update-translations.sh). Review it first. It assumes sibling checkouts of our pyright fork and the stubs repository. Prepare them with a clean branch from the main (editor, stubs) or microbit (pyright) branches.

Build and download the Crowdin zip and unzip it to a temporary location. Note the zip itself doesn't contain a top-level directory, so on Mac/Linux use e.g. `unzip -d ~/tmp/trans microbit-org.zip`. Run the script passing the directory containing the unzipped translations.

The script will update the stubs and pyright repository and update the editor with the stubs and pyright changes as well as the UI strings.

Review the changes and create PRs for each repository. Review the pyright and stubs PRs first.

The script for this process could be improved to create and/or verify clean branches.

#### Updating files in Crowdin

The UI, Pyright and API files are updated manually. Please download the existing files and diff locally to ensure the changes are as expected. Each project contains an NPM script to produce a file in the format needed for Crowdin except the Pyright project where the JSON file can be used directly.

For the editor itself, run `npm run i18n:convert` to create `crowdin/ui.en.json` in the correct format.

### Adding a new language

This process assumes the language is already in Crowdin and has at least some translations.

When considering a new language it's worth checking early whether support is available in [lunr-languages](https://github.com/MihaiValentin/lunr-languages) as we need that support for our client-side search. Search is not currently supported for zh-CN and zh-TW due to the technical challenge of indexing those languages in the browser. ga-IE also lacks support in lunr-languages.

Steps:

1. Add the language in the stubs repository. The script there needs updating.
2. Add the language to the editor repository:
   1. Add the language to the update script.
   2. Add lunr language support. See [search.ts](../src/documentation/search/search.ts).
   3. Update `supportedLanguages` in [settings.tsx](../src/settings/settings.tsx). You can add the language as a preview language. In this case it will only show up on the beta deployment and will be tagged as a preview in the UI.
3. Add the language to the pyright repository. There's a switch statement in `localize.ts`.
4. Run a translation sync as documented above.

## Updating MicroPython

Follow the instructions in the [issue template](https://github.com/microbit-foundation/python-editor-v3/issues/new?assignees=&labels=&template=micropython-update.md).

We've previously explored using the feature flag support to run a beta of MicroPython on the editor beta deployment. This might be a good strategy for feedback in future, though we'd need to coordinate it with a beta of the simulator (we already use simulator staging on beta).
