#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'Delivery: %s\n' "$*" >&2; exit 1; }

repo="repos/${GITHUB_REPOSITORY:?}"
image="ghcr.io/${GITHUB_REPOSITORY,,}"
snapshot_signer="${GITHUB_SERVER_URL:?}/${GITHUB_REPOSITORY}/.github/workflows/deploy-snapshot.yml@refs/heads/main"
sha_pattern='[0-9a-f]{40}'
digest_pattern='sha256:[0-9a-f]{64}'
version_pattern='(0|[1-9][0-9]*)'

parse_candidate() {
  [[ $1 =~ ^($sha_pattern)@($digest_pattern)$ ]] || fail 'Expected COMMIT@sha256:DIGEST.'
  revision=${BASH_REMATCH[1]}
  digest=${BASH_REMATCH[2]}
}

validate_version() {
  [[ $1 =~ ^v$version_pattern\.$version_pattern\.$version_pattern$ ]] || fail 'Expected vX.Y.Z.'
}

commit_tree() { gh api "$repo/git/commits/$1" --jq '.tree.sha'; }

verify_candidate() {
  tree=$(commit_tree "$revision")
  local -a identity=(--certificate-identity "$snapshot_signer"
    --certificate-oidc-issuer 'https://token.actions.githubusercontent.com')
  cosign verify "${identity[@]}" -a "revision=$revision" -a "tree=$tree" "$image@$digest" > /dev/null
  cosign verify-attestation "${identity[@]}" --type spdxjson "$image@$digest" > /dev/null
}

require_branch_ci() {
  local branch=$1 commit=$2
  gh api --method GET "$repo/actions/workflows/ci.yml/runs" \
    -f branch="$branch" -f event=push -f head_sha="$commit" -f status=success -F per_page=1 |
    jq -e --arg commit "$commit" 'any(.workflow_runs[]; .head_sha == $commit and .conclusion == "success")' \
      > /dev/null || fail "No successful push CI for $commit on $branch."
}

require_main_commit() {
  [[ $1 =~ ^$sha_pattern$ ]] || fail 'Expected a full commit SHA.'
  gh api "$repo/compare/$1...main" --jq '.status' | grep -Ex 'ahead|identical' > /dev/null ||
    fail 'Commit is not in main.'
  require_branch_ci main "$1"
}

deployment_records() {
  gh api --paginate --method GET "$repo/deployments" \
    -f environment="$1" -f task=acadflow-web-image -F per_page=100 "${@:2}" |
    jq -rs 'add // [] | sort_by(.created_at, .id) | reverse | .[] |
      select(.creator.login == "github-actions[bot]") |
      [.id, .sha, ((.payload | if type == "string" then fromjson? else . end).digest // "")] | @tsv'
}

deployment_succeeded() {
  gh api --paginate "$repo/deployments/$1/statuses" |
    jq -es 'any(.[][]; .state == "success")' > /dev/null
}

require_previous_deploy() {
  local target=$1 records id sha recorded_digest
  records=$(deployment_records "$target" -f sha="$revision")
  while IFS=$'\t' read -r id sha recorded_digest; do
    [[ $id =~ ^[0-9]+$ && $sha == "$revision" && $recorded_digest == "$digest" ]] || continue
    if deployment_succeeded "$id"; then return 0; fi
  done <<< "$records"
  fail "No successful $target deployment for $revision@$digest."
}

find_deployed_candidate() {
  local target=$1 wanted_revision=${2:-} records id sha recorded_digest
  local -a filters=()
  if [[ -n $wanted_revision ]]; then filters=(-f "sha=$wanted_revision"); fi
  records=$(deployment_records "$target" "${filters[@]}") || return 1
  while IFS=$'\t' read -r id sha recorded_digest; do
    [[ $id =~ ^[0-9]+$ && $sha =~ ^$sha_pattern$ && $recorded_digest =~ ^$digest_pattern$ ]] || continue
    [[ -z $wanted_revision || $sha == "$wanted_revision" ]] || continue
    if deployment_succeeded "$id"; then
      printf '%s@%s\n' "$sha" "$recorded_digest"
      return 0
    fi
  done <<< "$records"
  return 0
}

release_metadata() {
  jq -cer '.body | split("\n") | map(select(startswith("<!-- acadflow-image: ") and endswith(" -->")))
    | if length == 1 then .[0] | ltrimstr("<!-- acadflow-image: ") | rtrimstr(" -->") | fromjson
      else error("Expected one release metadata line") end'
}

tag_object() {
  gh api "$repo/git/matching-refs/tags/$1" |
    jq -c --arg ref "refs/tags/$1" '.[] | select(.ref == $ref) | .object'
}

require_tag() {
  local tag=$1 commit=$2 object
  object=$(tag_object "$tag")
  if [[ -z $object ]] || ! jq -e --arg commit "$commit" '.type == "commit" and .sha == $commit' \
    <<< "$object" > /dev/null; then
    fail "Tag $tag does not point to $commit."
  fi
}

create_release() {
  local version=$1 candidate=$2 commit= object metadata existing notes id saved_candidate
  validate_version "$version"
  existing=$(gh api --paginate "$repo/releases?per_page=100" |
    jq -c --arg version "$version" '.[] | select(.tag_name == $version)')
  object=$(tag_object "$version")
  if [[ -n $object ]]; then
    commit=$(jq -er 'select(.type == "commit") | .sha' <<< "$object") ||
      fail "Tag $version does not point directly to a commit."
    [[ $commit =~ ^$sha_pattern$ ]] || fail 'Invalid tag commit.'
  fi
  if [[ -n $existing ]]; then
    jq -e '.prerelease == false' <<< "$existing" > /dev/null ||
      fail "Release $version already exists as a prerelease."
    metadata=$(release_metadata <<< "$existing")
    saved_candidate=$(jq -er '.candidate' <<< "$metadata")
    [[ -z $candidate || $candidate == "$saved_candidate" ]] ||
      fail "Release $version already has a different candidate."
    candidate=$saved_candidate
    commit=$(jq -er '.commit' <<< "$metadata")
    require_tag "$version" "$commit"
    id=$(jq -er '.id' <<< "$existing")
  fi
  if [[ -z $candidate ]]; then
    candidate=$(find_deployed_candidate staging "$commit")
    [[ -n $candidate ]] || fail 'No successful staging deployment found. Deploy a snapshot to staging first.'
  fi
  parse_candidate "$candidate"
  if [[ -z $commit ]]; then commit=$revision; fi
  require_main_commit "$commit"
  verify_candidate
  [[ $(commit_tree "$commit") == "$tree" ]] || fail 'Candidate tree differs from the release commit.'
  require_previous_deploy staging
  metadata=$(jq -cn --arg candidate "$revision@$digest" --arg commit "$commit" \
    '{candidate: $candidate, commit: $commit}')
  if [[ -z $object ]]; then
    gh api --method POST "$repo/git/refs" -f ref="refs/tags/$version" -f sha="$commit" > /dev/null
  fi
  require_tag "$version" "$commit"
  if [[ -z $existing ]]; then
    # shellcheck disable=SC2016
    printf -v notes 'Image: `%s@%s`\n\nCandidate: `%s`\n\n<!-- acadflow-image: %s -->' \
      "$image" "$digest" "$revision" "$metadata"
    id=$(gh api --method POST "$repo/releases" -f tag_name="$version" -f name="$version" \
      -f body="$notes" -F draft=true --jq '.id')
  elif jq -e '.draft == false' <<< "$existing" > /dev/null; then
    printf 'Release %s is already published.\n' "$version"
    return
  fi
  gh api --method PATCH "$repo/releases/$id" -F draft=false --jq .html_url
}

resolve_snapshot() {
  local target=$1 commit=$2 candidate
  case "$target" in development | staging) ;; *) fail 'Unknown snapshot environment.' ;; esac
  commit=${commit:-${GITHUB_SHA:?}}
  require_main_commit "$commit"
  candidate=$(find_deployed_candidate development "$commit")
  if [[ -z $candidate ]]; then
    [[ $target == development ]] || fail 'No successful development deployment matches this commit. Deploy to development first.'
    revision=$commit
    digest=
  else
    parse_candidate "$candidate"
    verify_candidate
  fi
  printf 'revision=%s\ndigest=%s\n' "$revision" "$digest" >> "${GITHUB_OUTPUT:?}"
  printf 'Source: main at %s\n' "$commit" >> "${GITHUB_STEP_SUMMARY:?}"
}

resolve_deploy() {
  local target=$1 version=$2 release metadata commit
  case $target in
    development)
      parse_candidate "$version"
      require_main_commit "$revision"
      verify_candidate
      ;;
    staging)
      parse_candidate "$version"
      require_main_commit "$revision"
      verify_candidate
      require_previous_deploy development
      ;;
    production)
      validate_version "$version"
      gh api "$repo/environments/production" |
        jq -e 'any(.protection_rules[]?; .type == "required_reviewers" and
          .prevent_self_review == true and (.reviewers | length) > 0)' > /dev/null ||
        fail 'Configure production required reviewers with self-review disabled.'
      release=$(gh api "$repo/releases/tags/$version")
      jq -e '.draft == false and .prerelease == false' <<< "$release" > /dev/null ||
        fail 'Expected a published stable release.'
      metadata=$(release_metadata <<< "$release")
      parse_candidate "$(jq -er '.candidate' <<< "$metadata")"
      commit=$(jq -er '.commit' <<< "$metadata")
      [[ $commit =~ ^$sha_pattern$ ]] || fail 'Invalid release commit.'
      require_tag "$version" "$commit"
      require_main_commit "$commit"
      verify_candidate
      [[ $(commit_tree "$commit") == "$tree" ]] || fail 'Candidate tree differs from the release commit.'
      require_previous_deploy staging
      ;;
    *) fail 'Unknown environment.' ;;
  esac

  printf 'revision=%s\ndigest=%s\n' "$revision" "$digest" >> "${GITHUB_OUTPUT:?}"
  # shellcheck disable=SC2016
  printf 'Deploy `%s@%s` to **%s**.\n' "$image" "$digest" "$target" >> "${GITHUB_STEP_SUMMARY:?}"
}

case ${1:-} in
  release) [[ $# == 3 ]] || fail 'Expected version and optional candidate.'; create_release "$2" "$3" ;;
  resolve) [[ $# == 3 ]] || fail 'Expected environment and version/candidate.'; resolve_deploy "$2" "$3" ;;
  snapshot) [[ $# == 3 ]] || fail 'Expected environment and optional commit.'; resolve_snapshot "$2" "$3" ;;
  *) fail 'Unknown operation.' ;;
esac
