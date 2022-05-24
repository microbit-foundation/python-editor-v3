#!/usr/bin/env bash
#
# Utility to build our Pyright fork and update the worker code in this project.
#
# Assumes it is run from the root of the editor project and Pyright is a sibling checkout.
#
set -euxo pipefail
(cd ../pyright/packages/browser-pyright && npm run build)
rm public/workers/pyright-*.js*
cp ../pyright/packages/browser-pyright/dist/* public/workers/
source_file_with_dot_slash=$(cd public/workers && find . -name 'pyright-*.js')
source_file=$(basename "${source_file_with_dot_slash}")
cp 'src/language-server/pyright.ts' 'src/language-server/pyright.ts.input'
cat 'src/language-server/pyright.ts.input' | sed -e "s/pyright-[a-f0-9]*\.worker\.js/${source_file}/" > 'src/language-server/pyright.ts'
rm 'src/language-server/pyright.ts.input'
