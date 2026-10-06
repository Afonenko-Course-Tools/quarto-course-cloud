#!/usr/bin/env bash
set -euo pipefail
repo=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
export DEMO_SOURCE_COMMIT="$(git -C "$repo" rev-parse HEAD)"
if [[ -n $(git -C "$repo" status --porcelain) ]]; then export DEMO_SOURCE_DIRTY=true; else export DEMO_SOURCE_DIRTY=false; fi
core=${CORE:?Set CORE to the current Core source}
stage=$(mktemp -d "${TMPDIR:-/tmp}/cloud-demo.XXXXXXXX")
trap 'rm -rf "$stage"' EXIT
cp -R "$repo/examples/course/." "$stage/"
rm -rf "$stage/_book" "$stage/_extensions" "$stage/_generated" "$stage/.quarto"
cd "$stage"
quarto add "$core" --no-prompt
mkdir -p _extensions/Afonenko-Course-Tools
mv _extensions/course-core _extensions/Afonenko-Course-Tools/course-core
quarto add "$repo" --no-prompt
quarto run build.ts
if [[ -n ${DEMO_OUTPUT:-} ]]; then mkdir -p "$(dirname "$DEMO_OUTPUT")"; [[ ! -e "$DEMO_OUTPUT" ]] || { echo "DEMO_OUTPUT must be a fresh directory" >&2; exit 1; }; cp -R "$stage/_book/full" "$DEMO_OUTPUT"; fi
