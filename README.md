# Alpha version of the micro:bit Python editor

_This project is an alpha version of the next major version of the editor. The currently supported micro:bit Python editor is available at https://python.microbit.org/ and its source code can be found in GitHub at https://github.com/bbcmicrobit/PythonEditor._

This project is a web-based code editor that targets the [MicroPython](https://micropython.org) version of the [Python programming language](http://python.org/).

Code written with this editor is expected to run on the [BBC micro:bit device](https://microbit.org).

<figure>
  <img src="https://user-images.githubusercontent.com/44397098/124456486-a8a7fa80-dd82-11eb-93bf-292b86267d6d.png" alt="Screenshot of the Python editor showing the welcome message and code editing area" width="800px" style="border-radius:50%">
  <figcaption>You can try out the micro:bit-branded deployment of the alpha at https://python.microbit.org/v/alpha</figcaption>  
</figure>

## Developing the editor

The editor is written in TypeScript using React. We use the Chakra UI component library and [CodeMirror 6](https://codemirror.net/6/) editor component.

To learn React, check out the [React documentation](https://reactjs.org/).

To learn TypeScript, check out the [TypeScript documentation](https://www.typescriptlang.org/).

To learn more about Chakra UI check out the [component library documentation](https://chakra-ui.com/docs/getting-started).

CodeMirror 6 has [great documentation](https://codemirror.net/6/docs/). The [system guide](https://codemirror.net/6/docs/guide/) is a particularly useful overview of the key concepts.

The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

If you use Visual Studio Code you might find the devcontainer included in this repository a useful option to get an automatically configured development environment. [Find out more about containers and Visual Studio Code](https://code.visualstudio.com/docs/remote/containers).

## Deployments

The editor is deployed by [CircleCI](https://circleci.com/gh/microbit-foundation/python-editor-next).

The `main` branch is deployed to https://stage-python-editor-next.microbit.org/ on each commit.

Other branches (e.g. for PRs) are deployed to https://review-python-editor-next.microbit.org/{branch}. Special characters in the branch name are replaced by hyphens.

## Building and running the editor

1. Ensure you have a working Node.js environment. We recommend using the LTS version of Node.
2. Checkout this repository.
3. Install the dependencies via `npm install`.
4. Choose from the NPM scripts documented below.

If you're using the devcontainer with Visual Studio Code then the "Clone a repository from GitHub in a Container Volume" action will address steps 1 through 3.

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

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## License

This software is under the MIT open source license.

[SPDX-License-Identifier: MIT](LICENSE)

Binaries for MicroPython are included for micro:bit V1 ([license](https://github.com/bbcmicrobit/micropython/blob/master/LICENSE)) and micro:bit V2 ([license](https://github.com/microbit-foundation/micropython-microbit-v2/blob/master/LICENSE)). Both are MIT licensed.

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
