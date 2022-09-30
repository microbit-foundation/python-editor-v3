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

## Developing the editor

The editor is written in TypeScript using React. We use the Chakra UI component library and [CodeMirror 6](https://codemirror.net/6/) editor component.

To learn React, check out the [React documentation](https://reactjs.org/).

To learn TypeScript, check out the [TypeScript documentation](https://www.typescriptlang.org/).

To learn more about Chakra UI check out the [component library documentation](https://chakra-ui.com/docs/getting-started).

CodeMirror 6 has [great documentation](https://codemirror.net/6/docs/). The [system guide](https://codemirror.net/6/docs/guide/) is a particularly useful overview of the key concepts.

The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

## Deployments

The editor is deployed by [CircleCI](https://circleci.com/gh/microbit-foundation/python-editor-v3).

The `main` branch is deployed to https://python.microbit.org/v/beta on each commit.

Other branches (e.g. for PRs) are deployed to https://review-python-editor-v3.microbit.org/{branch}. Special characters in the branch name are replaced by hyphens.

For custom deployments, note that the educational content in the sidebar is currently sourced live from our CMS. For non-localhost deploys this will require CORS configuration on our end. Please open an issue to discuss this.

## Building and running the editor

1. Ensure you have a working Node.js environment. We recommend using the LTS version of Node and NPM 8+.
2. Checkout this repository.
3. Install the dependencies via `npm install`.
4. Choose from the NPM scripts documented below.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

If you have a connected micro:bit device, then setting the environment variable `TEST_MODE_DEVICE=1` will enable additional tests that will connect to your micro:bit. The tests will overwrite programs and data on the micro:bit.

### `npm run test:e2e`

Launches the test runner in the interactive watch mode running the end to end tests.

These are excluded from the normal test run.

The tests expect the app to already be running on http://localhost:3000, for example via `npm start`.

We use [Puppeteer](https://pptr.dev/) and the helpers provided by [Testing Library](https://testing-library.com/docs/pptr-testing-library/intro/).

The CI tests run these end-to-end tests against a production build.

### `npm run test:all --testPathPattern toolkit`

An example of how to use jest options to filter to a specific subset of the tests (e2e or unit).

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Feature flags

The editor supports a simple runtime feature flag system to:

- allow work-in-progress features to be integrated before they're ready for general use
- allow scenarios to be set up for user testing
- enable debug features

This system may change without notice. Flags are regularly added and removed.

The current set of flags are documented in [the source](./src/flags.ts).

Flags may be specified via the query string with repeated `flag` parameters,
for example, http://localhost:3000/?flag=oneFlag&flag=anotherFlag

By default, all flags are enabled for local development and branches builds.
They can be disabled with the special flag `none`.

## Translations

We use react-intl from [FormatJS](https://formatjs.io/) to manage strings for translation.

Add strings to `lang/ui.en.json` and run `npm run i18n:compile` to update the strings used by the app.

The UI strings are translated via Crowdin. Run `npm run i18n:convert` and upload `crowdin/ui.en.json`
to Crowdin.

Place translated files from Crowdin in `crowdin/translated/` and run `npm run i18n:convert`. The
files in `lang/` will be updated. Then run `npm run i18n:compile` to update the compiled versions.

The translations for other content are managed separately, though they are also translated via Crowdin.

- API documentation is managed in the type stubs repository
- Reference and Ideas content is managed in the Foundation's content management system
- Common Pyright error messages are managed [in the Foundation's Pyright fork](https://github.com/microbit-foundation/pyright/blob/microbit/packages/pyright-internal/src/localization/simplified.nls.en-us.json).

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
