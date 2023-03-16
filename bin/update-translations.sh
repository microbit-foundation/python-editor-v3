#!/usr/bin/env bash
#
# Partial automation of updating translations.
# This process expects sibling checkouts of pyright and the stubs projects.
#
# New languages require code change in:
# 1. Pyright to add to the switch in localization.ts
# 2. Editor updates in settings.tsx and TranslationProvider.tsx.
# 

set -euxo pipefail

if [ $# -eq 0 ]; then
  echo Missing argument to extracted Crowdin ZIP >&1
  exit 1
fi

languages="ca fr es-ES ja ko nl zh-CN zh-TW"

mkdir -p crowdin/translated
for language in $languages; do
    lower="${language,,}"
    prefix="${1}/${language}/new/apps/python-editor-v3"
    cp "${prefix}/ui.en.json" "crowdin/translated/ui.${lower}.json"
    cp "${prefix}/errors.en.json" "../pyright/packages/pyright-internal/src/localization/simplified.nls.${lower}.json"
    cp "${prefix}/api.en.json" "../micropython-microbit-stubs/crowdin/translated/api.${lower}.json"
done
npm run i18n:convert
npm run i18n:compile

(
  cd ../micropython-microbit-stubs
  ./scripts/build-translations.sh
)
./bin/update-pyright.sh
./bin/update-typeshed.sh
# We sometimes have newer English stubs than translations and don't want to
# regress them as part of a translations update.
git checkout -- src/micropython/main/typeshed.en.json