# Development version of the next micro:bit Python editor

_This project is an alpha version of the next major version of the editor. The currently supported micro:bit Python editor is available at https://python.microbit.org/ and its source code can be found in GitHub at https://github.com/bbcmicrobit/PythonEditor._

This project is a web-based code editor that targets the [MicroPython](https://micropython.org) version of the [Python programming language](http://python.org/).

Code written with this editor is expected to run on the [BBC micro:bit device](https://microbit.org).

## Licensing

The Python editor is [MIT licensed](./LICENSE).

The Adobe Source Code Pro font used for code is copyright Adobe and licensed under the [SIL Open Font License](src/fonts/SOURCE_CODE_PRO_LICENSE.md).

## Developing the editor

The editor is written in TypeScript using React. We use the Chakra UI component library and [CodeMirror 6](https://codemirror.net/6/) editor component.

To learn React, check out the [React documentation](https://reactjs.org/).

To learn TypeScript, check out the [TypeScript documentation](https://www.typescriptlang.org/).

To learn more about Chakra UI check out the [component library documentation](https://chakra-ui.com/docs/getting-started).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

If you use Visual Studio Code you might find the devcontainer included in this repository a useful option to get an automatically configured development environment. [Find out more about containers and Visual Studio Code](https://code.visualstudio.com/docs/remote/containers).

## Deployments

The editor is deployed by [CircleCI](https://circleci.com/gh/microbit-foundation/python-editor-next).

There is not yet a production deployment.

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
