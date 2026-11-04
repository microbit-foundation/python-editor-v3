# micro:bit Python Editor V3

This project is a web-based code editor that targets the [MicroPython](https://micropython.org) version of the [Python programming language](http://python.org/).

Code written with this editor is expected to run on the [BBC micro:bit device](https://microbit.org).

Try it out at https://python.microbit.org/

<figure>
  <img src="https://user-images.githubusercontent.com/44397098/193227581-58d86d58-d679-4244-ac80-2282007a20b9.png" alt="Screenshot of the Python editor showing the code editing area, Reference documentation and micro:bit simulator" width="100%">
  <figcaption>The image shows the micro:bit-branded deployment</figcaption>  
</figure>

## Previous versions

For more background about how this editor relates to the original Python Editor project, see [this explanation](https://github.com/bbcmicrobit/PythonEditor/issues/391).

The V2 editor project is still available at https://python.microbit.org/v/2 and its source code can be found in GitHub at https://github.com/bbcmicrobit/PythonEditor.

## Building and running the editor

We've written a [technical overview](./docs/tech-overview.md) that's a good starting point for working on the Python Editor or for using ideas and components from the app in other projects. We'd love to hear from you if you're making use of this project. You can get in touch via [support](https://support.microbit.org/).

Getting up and running:

1. Ensure you have a working [Node.js environment](https://nodejs.org/en/download/). We recommend using the LTS version of Node and NPM version 8 or newer.
2. Checkout this repository with Git. GitHub have some [learning resources for Git](https://docs.github.com/en/get-started/quickstart/git-and-github-learning-resources) that you may find useful.
3. Install the dependencies by running `npm install` on the command line in the checkout folder.
4. Choose from the NPM scripts documented below. Try `npm run dev` if you're not sure.

### `npm run dev`

Runs the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

On Linux, this local development server also accelerates senseBox transfers by
flushing all required CIRCUITPY files and their directories after the browser save,
including byte-identical files skipped during writing. This also flushes pending
OS writes when retrying a previous transfer.
This avoids waiting for delayed Linux writeback without changing mount options.
The helper accepts only local requests from the same origin and checks the selected
board identity and file hashes. MCU verification still runs before restarting.
Hosted/production builds use the normal browser transfer and verification path.
See [the senseBox change record](docs/sensebox-device-changes.md) for measurements
and limitations.

When transferring to a CircuitPython 10.x senseBox, static imports automatically
install matching libraries and their dependencies from the pinned Adafruit bundle
into `CIRCUITPY/lib`. Imports in reachable project modules are included. Built-in
modules such as `board` need no installation; project-owned modules take priority.
Unchanged files are compared and skipped. Unknown libraries and dynamic imports
still require manual installation. The first use needs access to the editor's
library assets. This also works in hosted builds.

The bundled third-party assets retain their individual licenses and notices under
[`public/circuitpython/adafruit-10-20261016/`](public/circuitpython/adafruit-10-20261016/README.txt).
Regenerate the pinned assets with `python3 tools/prepare-circuitpython-libraries.py`;
the script verifies the upstream archives and regenerates the catalog and hashes.

Autocomplete, parameter help and diagnostics use CircuitPython 10.3 type data for
the senseBox MCU-S2 and the drivers used in the bundled sensor/module examples.
Transfers display each preparation, writing, verification and startup phase.
See [CircuitPython code help and transfer phases](docs/circuitpython-code-help.md)
for coverage, sources and regeneration instructions.

The page will reload if you make edits.

This does not show TypeScript or lint errors.
Use the eslint plugin for your editor and consider also running `npm run typecheck:watch` to see full type checking errors.

### Linux: the serial port cannot be opened

The browser needs operating-system permission to read and write the senseBox
serial device, in addition to the browser's device-selection permission. If the
device (for example `/dev/ttyACM0`) belongs to `root:dialout` with mode `0660`,
your user must be a member of `dialout` or have an explicit ACL granting access.

For ongoing access on a system using `dialout`:

```sh
sudo usermod -aG dialout "$USER"
```

Sign out of the desktop session and sign in again, then reopen the browser.
Opening a new terminal alone does not update the groups of an already running
browser.

For immediate access without restarting the desktop session, an administrator can
grant access to just the currently attached device:

```sh
sudo setfacl -m u:"$USER":rw /dev/ttyACM0
```

Verify that `/dev/ttyACM0` is the senseBox first (for example through
`/dev/serial/by-id/`). This ACL is temporary and is lost when the device is
removed or its device node is recreated. Reconnect with **Connect senseBox** at
the bottom left. Connecting does not transfer code.

### `npm test`

Launches the [test runner](https://vitest.dev/) in interactive mode (unless the `CI` environment variable is defined).
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

If you have a connected micro:bit device, then setting the environment variable `TEST_MODE_DEVICE=1` will enable additional tests that will connect to your micro:bit. The tests will overwrite programs and data on the micro:bit.

### `npm run test:e2e`

Opens the [Playwright](https://playwright.dev/) UI to run the end to end tests.
`npm run test:e2e:headless` runs them without it.

These are excluded from the normal test run.

Playwright starts the dev server itself, reusing one already running on
http://localhost:3000 if there is one.

The browsers are a separate download: run `npx playwright install` before the
first run.

The CI tests run these end-to-end tests against a production build.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Deployments

Most users should use the supported Foundation deployment at https://python.microbit.org/

The editor is deployed by [GitHub actions](https://github.com/microbit-foundation/python-editor-v3/actions).

The `main` branch is deployed to https://python.microbit.org/v/beta on each push.

Other branches (e.g. for PRs) are deployed to https://review-python-editor-v3.microbit.org/{branch}. Special characters in the branch name are replaced by hyphens. Deployments will not run in forks.

## License

This software is under the MIT open source license.

[SPDX-License-Identifier: MIT](LICENSE)

Binaries for MicroPython are included for micro:bit V1 ([license](https://github.com/bbcmicrobit/micropython/blob/master/LICENSE)) and micro:bit V2 ([license](https://github.com/microbit-foundation/micropython-microbit-v2/blob/master/LICENSE)). Both are MIT licensed.

Python diagnostics and autocomplete use a fork of Microsoft's Pyright type checker which has been [modified by us](public/workers/PYRIGHT_README.txt) to run as a Web Worker. Pyright is © Microsoft Corporation and [used under an MIT license](public/workers/PYRIGHT_LICENSE.txt).

We use dependencies via the NPM registry as specified by the package.json file under common Open Source licenses.

Full details of each package can be found by running `license-checker`:

```bash
$ npx license-checker --direct --summary --production
```

Omit the flags as desired to obtain more detail.

## Code of Conduct

Trust, partnership, simplicity and passion are our core values we live and
breathe in our daily work life and within our projects. Our open-source
projects are no exception. We have an active community which spans the globe
and we welcome and encourage participation and contributions to our projects
by everyone. We work to foster a positive, open, inclusive and supportive
environment and trust that our community respects the micro:bit code of
conduct. Please see our [code of conduct](https://microbit.org/safeguarding/)
which outlines our expectations for all those that participate in our
community and details on how to report any concerns and what would happen
should breaches occur.
