#!/usr/bin/env bash
#
# Pulls every source of translated text into the editor. Expects sibling
# checkouts of our pyright fork (branch microbit) and the stubs repository
# (branch main), each on a clean branch ready for a pull request, and a
# CROWDIN_PERSONAL_TOKEN in the environment.
#
# Each repository has its own i18n.config.mjs for @microbit/i18n-tools; this
# script only strings the downloads and rebuilds together. The pyright fork
# does not install the tool, so npx fetches it there. New languages need
# adding to each config and the code changes listed in docs/tech-overview.md.
#
set -euxo pipefail

# UI strings.
npm run i18n:download

# API documentation, then rebuild the typeshed JSON from it.
(
  cd ../micropython-microbit-stubs
  npx microbit-i18n download
  ./scripts/build-translations.sh
)

# Error messages.
(
  cd ../pyright
  npx --yes --package @microbit/i18n-tools microbit-i18n download
)

./bin/update-pyright.sh
./bin/update-typeshed.sh
# We sometimes have newer English stubs than translations and don't want to
# regress them as part of a translations update.
git checkout -- src/micropython/main/typeshed.en.json
