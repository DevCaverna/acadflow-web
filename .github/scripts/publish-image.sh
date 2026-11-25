#!/usr/bin/env bash
set -euo pipefail

image="ghcr.io/${GITHUB_REPOSITORY:?}"
image=${image,,}
revision=$(git rev-parse HEAD)
tree=$(git rev-parse 'HEAD^{tree}')
tag=$1
[[ $tag == "snapshot-$revision" || $tag == "release-$revision" ]]

# Only advertise a reusable tag after its digest has passed scanning and signing.
candidate="$image:build-${GITHUB_RUN_ID:?}-${GITHUB_RUN_ATTEMPT:?}"
docker buildx build --file docker/Dockerfile --platform linux/amd64 --push \
  --label "org.opencontainers.image.source=${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}" \
  --label "org.opencontainers.image.revision=$revision" \
  --tag "$candidate" --metadata-file "$RUNNER_TEMP/image.json" . >&2
digest=$(jq -er '."containerimage.digest" | select(test("^sha256:[0-9a-f]{64}$"))' \
  "$RUNNER_TEMP/image.json")
trivy image --scanners vuln --severity CRITICAL --table-mode detailed --exit-code 1 "$image@$digest" >&2
trivy image --format spdx-json --output "$RUNNER_TEMP/sbom.spdx.json" "$image@$digest" >&2
cosign attest --yes --type spdxjson --predicate "$RUNNER_TEMP/sbom.spdx.json" "$image@$digest" >&2
cosign sign --yes -a "revision=$revision" -a "tree=$tree" "$image@$digest" >&2
docker buildx imagetools create --prefer-index=false --tag "$image:$tag" "$image@$digest" >&2
published=$(docker buildx imagetools inspect "$image:$tag" --format '{{json .Manifest}}' | jq -er '.digest')
[[ $published == "$digest" ]] || { printf 'Published tag does not preserve the signed digest.\n' >&2; exit 1; }
printf '%s\n' "$digest"
