#!/usr/bin/env bash
#
# Utility to update the JSON file that stores the custom typeshed.
#
# Assumes it is run from the root of the editor project and the stubs project is a sibling checkout.
#
set -euxo pipefail
(cd ../micropython-microbit-stubs && python3 scripts/browser-package.py)
cp ../micropython-microbit-stubs/typeshed.*.json src/language-server/
