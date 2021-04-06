# Development version of the next micro:bit Python editor

*This project is a development version of the next major version of the editor. It is not ready for use.*

This project is a web-based editor that targets the [MicroPython](https://micropython.org) version of the [Python programming language](http://python.org/). Code written with this editor is expected to run on the [BBC micro:bit device](https://microbit.org).

The currently supported micro:bit Python editor is available at https://python.microbit.org/ and its source code can be found in GitHub at https://github.com/bbcmicrobit/PythonEditor.


## Developing the editor

The editor is written in TypeScript using React.

To learn React, check out the [React documentation](https://reactjs.org/).

To learn TypeScript, check out the [TypeScript documentation](https://www.typescriptlang.org/).

This early prototype uses the [Chakra UI](https://chakra-ui.com/) component library.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

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

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

If you have a connected micro:bit device, then setting the environment variable `TEST_MODE_DEVICE=1` will enable additional tests that will connect to your micro:bit. The tests will overwrite programs and data on the micro:bit.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.
