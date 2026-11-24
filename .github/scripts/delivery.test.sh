#!/usr/bin/env bash
set -euo pipefail

export GITHUB_REPOSITORY=DevCaverna/acadflow-web GITHUB_SERVER_URL=https://github.com
temp=$(mktemp -d)
trap 'rm -r -- "$temp"' EXIT
export GITHUB_OUTPUT="$temp/output" GITHUB_STEP_SUMMARY="$temp/summary"
export writes="$temp/writes"
printf -v candidate_commit '%040d' 1
printf -v main_commit '%040d' 2
printf -v older_commit '%040d' 4
printf -v digest 'sha256:%064d' 3
candidate="$candidate_commit@$digest"
export candidate_commit main_commit older_commit
export GITHUB_SHA="$main_commit"
export fixture_digest="$digest" fixture_candidate="$candidate"

gh() {
  local args="$*" tag_ref='refs/tags/v0.1.0' body
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
        '{workflow_runs: [{head_sha: $commit, conclusion: $result}]}'
      ;;
    *"/git/commits/$candidate_commit"*) printf 'signed-tree\n' ;;
    *"/git/commits/$older_commit"*) printf 'other-tree\n' ;;
    *"/git/commits/$main_commit"*) printf '%s\n' "${TARGET_TREE:-signed-tree}" ;;
    *'/deployments/123/statuses'*) printf '[{"state":"success"}]\n' ;;
    *'/deployments/124/statuses'*) printf '[{"state":"failure"}]\n' ;;
    *'/deployments '*)
      jq -cn --arg digest "${DEPLOYED_DIGEST:-$fixture_digest}" --arg sha "$candidate_commit" \
        --argjson omit "${NO_DEPLOYMENT:-false}" '
          if $omit then [] else
            [124, 123] | map({id: ., sha: $sha, creator: {login: "github-actions[bot]"},
              payload: {digest: $digest}})
          end'
      ;;
    *'/git/matching-refs/tags/v0.1.0')
      if [[ ${TAG_EXISTS:-} == yes || -s $temp/tag-commit ]]; then
        local tagged=${TAG_COMMIT:-$main_commit}
        if [[ -s $temp/tag-commit ]]; then tagged=$(< "$temp/tag-commit"); fi
        jq -cn --arg ref "$tag_ref" --arg sha "$tagged" \
          '[{ref: $ref, object: {sha: $sha, type: "commit"}}]'
      else
        printf '[]\n'
      fi
      ;;
    *'POST '*'/git/refs '*) printf 'tag\n' >> "$writes"; printf '%s\n' "${args##*sha=}" > "$temp/tag-commit" ;;
    *'POST '*'/releases '*) printf 'draft\n' >> "$writes"; printf '456\n' ;;
    *'PATCH '*'/releases/456 '*) printf 'publish\n' >> "$writes" ;;
    *'/releases?per_page=100')
      if [[ ${DRAFT_EXISTS:-} == yes ]]; then
        jq -cn --arg body "<!-- acadflow-image: $body -->" \
          '[{id: 456, tag_name: "v0.1.0", body: $body, draft: true, prerelease: false}]'
      else
        printf '[]\n'
      fi
      ;;
    *'/environments/production')
      jq -cn --argjson protected "${PROTECTED:-true}" \
        '{protection_rules: [{type: "required_reviewers", prevent_self_review: $protected, reviewers: [{}]}]}'
      ;;
    *'/releases/tags/v0.1.0')
      jq -cn --arg body "<!-- acadflow-image: $body -->" --argjson draft "${DRAFT:-false}" \
        '{body: $body, draft: $draft, prerelease: false}'
      ;;
    *) printf 'Unexpected API call: %s\n' "$args" >&2; return 1 ;;
  esac
}

cosign() { [[ $1 != "${FAIL_COSIGN:-}" ]]; }
export temp
export -f gh cosign

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
DEPLOYED_DIGEST=other assert_failure 'No successful development deployment' \
  "${delivery[@]}" resolve staging "$candidate"
COMPARE_STATUS=diverged assert_failure 'Commit is not in main' \
  "${delivery[@]}" resolve staging "$candidate"
"${delivery[@]}" resolve staging "$candidate"
"${delivery[@]}" snapshot development ''
grep -Fxq "revision=$main_commit" "$GITHUB_OUTPUT"
grep -Fxq 'digest=' "$GITHUB_OUTPUT"
"${delivery[@]}" snapshot staging "$candidate_commit"
grep -Fxq "revision=$candidate_commit" "$GITHUB_OUTPUT"
assert_failure 'Deploy to development first' "${delivery[@]}" snapshot staging ''
COMPARE_STATUS=diverged assert_failure 'Commit is not in main' \
  "${delivery[@]}" snapshot development "$older_commit"
CI_RESULT=failure assert_failure 'No successful push CI' \
  "${delivery[@]}" snapshot development ''
NO_DEPLOYMENT=true "${delivery[@]}" snapshot development "$older_commit"
grep -Fxq "revision=$older_commit" "$GITHUB_OUTPUT"
DEPLOYED_DIGEST=other assert_failure 'No successful staging deployment' \
  "${delivery[@]}" release v0.1.0 "$candidate"
NO_DEPLOYMENT=true assert_failure 'No successful staging deployment found' \
  "${delivery[@]}" release v0.1.0 ''
COMPARE_STATUS=diverged assert_failure 'Commit is not in main' \
  "${delivery[@]}" release v0.1.0 "$candidate"
[[ ! -s $writes ]]
"${delivery[@]}" release v0.1.0 ''
diff -u <(printf 'tag\ndraft\npublish\n') "$writes"
[[ $(< "$temp/tag-commit") == "$candidate_commit" ]]
: > "$writes"
"${delivery[@]}" release v0.1.0 ''
diff -u <(printf 'draft\npublish\n') "$writes"
: > "$temp/tag-commit"
: > "$writes"
DRAFT_EXISTS=yes TAG_EXISTS=yes "${delivery[@]}" release v0.1.0 ''
diff -u <(printf 'publish\n') "$writes"
PROTECTED=false assert_failure 'Configure production required reviewers' \
  "${delivery[@]}" resolve production v0.1.0
DRAFT=true TAG_EXISTS=yes assert_failure 'Expected a published stable release' \
  "${delivery[@]}" resolve production v0.1.0
TAG_EXISTS=yes "${delivery[@]}" resolve production v0.1.0
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
