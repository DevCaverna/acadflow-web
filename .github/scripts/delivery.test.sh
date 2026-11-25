#!/usr/bin/env bash
set -euo pipefail

export GITHUB_REPOSITORY=DevCaverna/acadflow-web GITHUB_SERVER_URL=https://github.com
temp=$(mktemp -d)
trap 'rm -r -- "$temp"' EXIT
export GITHUB_OUTPUT="$temp/output" GITHUB_STEP_SUMMARY="$temp/summary"
export writes="$temp/writes"
export RUNNER_TEMP="$temp" GITHUB_RUN_ID=123 GITHUB_RUN_ATTEMPT=1
printf -v candidate_commit '%040d' 1
printf -v main_commit '%040d' 2
printf -v older_commit '%040d' 4
printf -v digest 'sha256:%064d' 3
candidate="$candidate_commit@$digest"
export candidate_commit main_commit older_commit
export GITHUB_SHA="$main_commit"
export fixture_digest="$digest" fixture_candidate="$candidate"

gh() {
  local args="$*" tag_ref='refs/tags/v0.1.0' body tagged
  body=$(jq -cn --arg candidate "$fixture_candidate" --arg commit "$main_commit" \
    '{candidate: $candidate, commit: $commit}')
  case $args in
    *"/compare/$main_commit...main"*) printf 'identical\n' ;;
    *"/compare/$candidate_commit...main"* | *"/compare/$older_commit...main"*)
      printf '%s\n' "${COMPARE_STATUS:-ahead}" ;;
    *'/actions/workflows/ci.yml/runs '*branch=main*)
      local commit=$main_commit
      if [[ $args == *"head_sha=$older_commit"* ]]; then commit=$older_commit; fi
      if [[ $args == *"head_sha=$candidate_commit"* ]]; then commit=$candidate_commit; fi
      jq -cn --arg commit "$commit" --arg result "${CI_RESULT:-success}" \
        --arg event "${CI_EVENT:-push}" \
        '{workflow_runs: [{head_sha: $commit, conclusion: $result, event: $event}]}'
      ;;
    *"/git/commits/$candidate_commit"*) printf 'signed-tree\n' ;;
    *"/git/commits/$older_commit"*) printf 'other-tree\n' ;;
    *"/git/commits/$main_commit"*) printf '%s\n' "${TARGET_TREE:-signed-tree}" ;;
    *'/actions/runs/123 '*) printf '2026-11-25T13:00:00Z\n' ;;
    'workflow run ci.yml --ref main') printf 'ci\n' >> "$writes" ;;
    'release create v0.2.0 --verify-tag --title v0.2.0 --notes-file '*)
      printf 'release\n' >> "$writes"
      cp "${@: -1}" "$temp/published-notes"
      ;;
    *'/git/matching-refs/tags/v0.2.0')
      if tagged=$(git rev-parse --verify refs/tags/v0.2.0 2>/dev/null); then
        jq -cn --arg sha "$tagged" '[{ref: "refs/tags/v0.2.0", object: {type: "tag", sha: $sha}}]'
      else
        printf '[]\n'
      fi
      ;;
    *'/git/tags/'*)
      jq -cn --arg sha "$(git rev-parse 'refs/tags/v0.2.0^{}')" '{type: "commit", sha: $sha}'
      ;;
    *'/git/matching-refs/tags/v0.1.0')
      if [[ ${TAG_EXISTS:-} == yes ]]; then
        jq -cn --arg ref "$tag_ref" --arg sha "$main_commit" \
          '[{ref: $ref, object: {sha: $sha, type: "commit"}}]'
      else
        printf '[]\n'
      fi
      ;;
    *'/releases?per_page=100') printf '[]\n' ;;
    *'/releases/tags/v0.1.0')
      jq -cn --arg body "<!-- acadflow-image: $body -->" --argjson draft "${DRAFT:-false}" \
        '{body: $body, draft: $draft, prerelease: false}'
      ;;
    *) printf 'Unexpected API call: %s\n' "$args" >&2; return 1 ;;
  esac
}

cosign() { [[ $1 != "${FAIL_COSIGN:-}" ]]; }
trivy() { [[ ${FAIL_SCAN:-} != yes ]]; }
docker() {
  case "$*" in
    'buildx imagetools inspect '*)
      if [[ ${REGISTRY_ERROR:-} == yes ]]; then printf 'unauthorized\n' >&2; return 1; fi
      if [[ ${IMAGE_EXISTS:-} == yes || -f $temp/registry-tag ]]; then
        jq -cn --arg digest "$fixture_digest" '{digest: $digest}'
      else
        printf 'manifest unknown\n' >&2
        return 1
      fi
      ;;
    'buildx build '*)
      printf 'build\n' >> "$writes"
      jq -cn --arg digest "$fixture_digest" '{"containerimage.digest": $digest}' > "$RUNNER_TEMP/image.json"
      ;;
    'buildx imagetools create '*) touch "$temp/registry-tag" ;;
    *) return 1 ;;
  esac
}
export temp
export -f gh cosign trivy docker

assert_failure() {
  local expected=$1
  shift
  if "$@" > "$temp/error" 2>&1; then
    printf 'Unexpected success: %s\n' "$*" >&2
    exit 1
  fi
  if ! grep -Fq -- "$expected" "$temp/error"; then
    cat "$temp/error" >&2
    exit 1
  fi
}

delivery=(bash .github/scripts/delivery.sh)
touch "$writes"
assert_failure 'Expected COMMIT' "${delivery[@]}" resolve development invalid
if FAIL_COSIGN=verify-attestation "${delivery[@]}" resolve development "$candidate"; then
  printf 'Accepted candidate without a verified SBOM.\n' >&2
  exit 1
fi
"${delivery[@]}" resolve development "$candidate"
grep -Fxq "digest=$digest" "$GITHUB_OUTPUT"
COMPARE_STATUS=diverged assert_failure 'Commit is not in main' \
  "${delivery[@]}" resolve staging "$candidate"
"${delivery[@]}" resolve staging "$candidate"
"${delivery[@]}" snapshot development ''
grep -Fxq "revision=$main_commit" "$GITHUB_OUTPUT"
grep -Fxq 'digest=' "$GITHUB_OUTPUT"
"${delivery[@]}" snapshot staging "$candidate_commit"
grep -Fxq "revision=$candidate_commit" "$GITHUB_OUTPUT"
[[ $(tail -n 1 "$GITHUB_OUTPUT") == 'digest=' ]]
IMAGE_EXISTS=yes "${delivery[@]}" snapshot staging "$candidate_commit"
[[ $(tail -n 1 "$GITHUB_OUTPUT") == "digest=$digest" ]]
REGISTRY_ERROR=yes assert_failure 'unauthorized' "${delivery[@]}" snapshot staging "$candidate_commit"
IMAGE_EXISTS=yes FAIL_COSIGN=verify assert_failure 'Candidate signature' \
  "${delivery[@]}" snapshot staging "$candidate_commit"
COMPARE_STATUS=diverged assert_failure 'Commit is not in main' \
  "${delivery[@]}" snapshot development "$older_commit"
CI_RESULT=failure assert_failure 'No successful CI' \
  "${delivery[@]}" snapshot development ''
CI_EVENT=workflow_dispatch "${delivery[@]}" snapshot development "$older_commit"
grep -Fxq "revision=$older_commit" "$GITHUB_OUTPUT"
assert_failure 'Expected X.Y.Z' "${delivery[@]}" release 0.1
DRAFT=true TAG_EXISTS=yes assert_failure 'Expected a published stable release' \
  "${delivery[@]}" resolve production v0.1.0
TAG_EXISTS=yes "${delivery[@]}" resolve production 0.1.0
grep -Fxq 'version=v0.1.0' "$GITHUB_OUTPUT"
TARGET_TREE=other TAG_EXISTS=yes assert_failure 'Candidate tree differs' \
  "${delivery[@]}" resolve production 0.1.0

mkdir "$temp/project"
git init -q --bare -b main "$temp/origin.git"
(
  mkdir -p "$temp/project/.github/scripts"
  cp .github/scripts/{delivery.sh,prepare-release.mjs,publish-image.sh} "$temp/project/.github/scripts/"
  cd "$temp/project"
  git init -q -b main
  git config user.name 'Release Test'
  git config user.email 'release-test@example.com'
  printf '{\n  "name": "release-fixture",\n  "version": "0.1.0"\n}\n' > package.json
  printf '# Changelog\n\n## [Unreleased]\n\n### Adicionado\n\n- Nova funcionalidade.\n\n## [0.1.0] - 2026-11-24\n' > CHANGELOG.md
  git add .
  git commit -qm 'test: add release fixture'
  git remote add origin "$temp/origin.git"
  git push -q origin main
  export GITHUB_SHA main_commit
  GITHUB_SHA=$(git rev-parse HEAD)
  main_commit=$GITHUB_SHA
  assert_failure 'must be newer' node .github/scripts/prepare-release.mjs 0.1.0 2026-11-25
  assert_failure 'Expected X.Y.Z' node .github/scripts/prepare-release.mjs 0.02.0 2026-11-25
  (
    mkdir "$temp/empty-changelog"
    cp package.json "$temp/empty-changelog/"
    cd "$temp/empty-changelog"
    printf '# Changelog\n\n## [Unreleased]\n' > CHANGELOG.md
    assert_failure 'no release notes' node "$temp/project/.github/scripts/prepare-release.mjs" 0.2.0 2026-11-25
    printf '## [0.2.0] - 2026-11-24\n' >> CHANGELOG.md
    assert_failure 'already exists' node "$temp/project/.github/scripts/prepare-release.mjs" 0.2.0 2026-11-25
  )
  git diff --exit-code
  if FAIL_SCAN=yes "${delivery[@]}" release 0.2.0; then
    printf 'Release published despite a failed image scan.\n' >&2
    exit 1
  fi
  [[ -z $(git ls-remote --tags origin) ]]
  git switch -q --detach "$GITHUB_SHA"
  "${delivery[@]}" release 0.2.0
  released=$(git rev-parse HEAD)
  [[ $(git rev-parse 'v0.2.0^{}') == "$released" ]]
  [[ $(git ls-remote origin refs/heads/main | cut -f1) == "$released" ]]
  [[ $(jq -r '.version' package.json) == 0.2.0 ]]
  grep -Fxq '## [0.2.0] - 2026-11-25' CHANGELOG.md
  grep -Fxq -- '- Nova funcionalidade.' "$temp/published-notes"
  grep -Fq "$released@$digest" "$temp/published-notes"
  : > "$writes"
  git switch -q --detach "$GITHUB_SHA"
  "${delivery[@]}" release 0.2.0
  [[ $(git rev-parse HEAD) == "$released" ]]
  diff -u <(printf 'ci\nrelease\n') "$writes"
)
assert_failure 'Expected sha256:DIGEST' bash scripts/deploy-web.sh production "$digest extra"
script=$(< scripts/deploy-web.sh)
printf -v remote_command "bash -c '%s' -- '%s' '%s'" "${script//\'/\'\\\'\'}" production "$digest"
assert_failure 'Missing runtime setting: WEB_HOST_PORT' sh -c "$remote_command" < /dev/null
assert_failure 'Invalid runtime setting: WEB_HOST_PORT' \
  sh -c "$remote_command" < <(printf '%s\0' 'PATH=/tmp')
assert_failure 'Invalid WEB_HOST_PORT' \
  sh -c "$remote_command" < <(printf '%s\0' \
    'WEB_HOST_PORT=65536' 'VITE_API_BASE_URL=https://api.example.com')
assert_failure 'VITE_API_BASE_URL must be a public HTTPS origin' \
  sh -c "$remote_command" < <(printf '%s\0' \
    'WEB_HOST_PORT=4300' 'VITE_API_BASE_URL=http://api.example.com')
assert_failure 'Missing or invalid GHCR token' \
  sh -c "$remote_command" < <(printf '%s\0' \
    'WEB_HOST_PORT=4300' 'VITE_API_BASE_URL=https://api.example.com' \
    'github-actions[bot]')

printf 'Delivery policy tests passed.\n'
