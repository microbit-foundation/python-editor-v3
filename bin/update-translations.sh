#!/usr/bin/env bash
#
# Partial automation of updating translations.
# This process expects sibling checkouts of pyright and the stubs projects.
#
# New languages require code change in:
# 1. Pyright to add to the switch in localization.ts
# 2. Some undocumented change in the Python editor TBC.

set -euxo pipefail

if [ $# -eq 0 ]; then
  echo Missing argument to extracted Crowdin ZIP >&1
  exit 1
fi

languages="fr es-ES ja ko zh-CN zh-TW"

mkdir -p crowdin/translated
for language in $languages; do
    lower="${language,,}"
    prefix="${1}/${language}/new/apps/python-editor-v3"
    cp "${prefix}/ui.en.json" "crowdin/translated/ui.${lower}.json"
    cp "${prefix}/errors.en.json" "../pyright/packages/pyright-internal/src/localization/simplified.nls.${lower}.json"
    cp "${prefix}/api.en.json" "../micropython-microbit-stubs/crowdin/translated/api.${lower}.json"
done
npm run i18n:convert
npm run i18n:compile || true # Failing for the moment

(
  cd ../micropython-microbit-stubs
  for language in $languages; do
      lower="${language,,}"
      rm -rf "lang/${lower}"
      cp -r lang/en "lang/${lower}"
  done
  npm run i18n:crowdin-to-typeshed
  npm run i18n:typeshed-to-crowdin
)

./bin/update-pyright.sh
./bin/update-typeshed.sh