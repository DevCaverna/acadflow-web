#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'Delivery: %s\n' "$*" >&2; exit 1; }

repo="repos/${GITHUB_REPOSITORY:?}"
image="ghcr.io/${GITHUB_REPOSITORY,,}"
workflow_root="${GITHUB_SERVER_URL:?}/${GITHUB_REPOSITORY}/.github/workflows"
sha_pattern='[0-9a-f]{40}'
digest_pattern='sha256:[0-9a-f]{64}'
version_pattern='(0|[1-9][0-9]*)'

parse_candidate() {
  [[ $1 =~ ^($sha_pattern)@($digest_pattern)$ ]] || fail 'Expected COMMIT@sha256:DIGEST.'
  revision=${BASH_REMATCH[1]}
  digest=${BASH_REMATCH[2]}
}

version_tag() {
  local version=${1#v}
  [[ $version =~ ^$version_pattern\.$version_pattern\.$version_pattern$ ]] || fail 'Expected X.Y.Z.'
  printf 'v%s\n' "$version"
}

commit_tree() { gh api "$repo/git/commits/$1" --jq '.tree.sha'; }

verify_candidate() {
  local candidate_tree=${1:-} identity
  shift
  if [[ -z $candidate_tree ]]; then candidate_tree=$(commit_tree "$revision"); fi
  local issuer='https://token.actions.githubusercontent.com' workflow
  for workflow in "$@"; do
    identity="$workflow_root/$workflow.yml@refs/heads/main"
    if cosign verify --certificate-identity "$identity" --certificate-oidc-issuer "$issuer" \
      -a "revision=$revision" -a "tree=$candidate_tree" "$image@$digest" > /dev/null; then
      cosign verify-attestation --certificate-identity "$identity" --certificate-oidc-issuer "$issuer" \
        --type spdxjson "$image@$digest" > /dev/null
      return
    fi
  done
  fail 'Candidate signature could not be verified.'
}

require_main_history() {
  [[ $1 =~ ^$sha_pattern$ ]] || fail 'Expected a full commit SHA.'
  gh api "$repo/compare/$1...main" --jq '.status' | grep -Ex 'ahead|identical' > /dev/null ||
    fail 'Commit is not in main.'
}

require_main_commit() {
  require_main_history "$1"
  gh api --paginate --method GET "$repo/actions/workflows/ci.yml/runs" \
    -f branch=main -f head_sha="$1" -f status=success -F per_page=100 |
    jq -es --arg commit "$1" 'any(.[].workflow_runs[]; .head_sha == $commit and
      .conclusion == "success" and (.event == "push" or .event == "workflow_dispatch"))' \
    > /dev/null || fail "No successful CI for $1 on main."
}

inspect_image() {
  local descriptor
  if ! descriptor=$(docker buildx imagetools inspect "$image:$1" --format '{{json .Manifest}}' 2>&1); then
    if grep -Eiq 'manifest unknown|manifest_unknown|: not found$' <<< "$descriptor"; then return 0; fi
    printf '%s\n' "$descriptor" >&2
    return 1
  fi
  jq -er --arg pattern "^$digest_pattern$" '.digest | select(test($pattern))' <<< "$descriptor"
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
  local tag=$1 commit=$2 object object_sha object_type
  object=$(tag_object "$tag")
  [[ -n $object ]] || fail "Missing tag $tag."
  object_type=$(jq -er '.type' <<< "$object")
  object_sha=$(jq -er '.sha' <<< "$object")
  if [[ $object_type == tag ]]; then
    [[ $object_sha =~ ^$sha_pattern$ ]] || fail 'Invalid tag object SHA.'
    object=$(gh api "$repo/git/tags/$object_sha" --jq '.object')
  fi
  jq -e --arg commit "$commit" '.type == "commit" and .sha == $commit' <<< "$object" > /dev/null ||
    fail "Tag $tag does not point to $commit."
}

create_release() {
  local tag timestamp notes object metadata existing remote tip
  tag=$(version_tag "$1")
  require_main_commit "${GITHUB_SHA:?}"
  [[ $(git rev-parse HEAD) == "$GITHUB_SHA" ]] || fail 'Release checkout differs from this run commit.'
  existing=$(gh api --paginate "$repo/releases?per_page=100" |
    jq -c --arg tag "$tag" '.[] | select(.tag_name == $tag)')
  object=$(tag_object "$tag")
  timestamp=$(gh api "$repo/actions/runs/${GITHUB_RUN_ID:?}" --jq '.created_at')
  [[ $timestamp =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$ ]] ||
    fail 'Invalid release run timestamp.'
  notes="$RUNNER_TEMP/release-notes.md"
  node .github/scripts/prepare-release.mjs "${tag#v}" "${timestamp%%T*}" > "$notes"
  [[ $(git diff --name-only) == $'CHANGELOG.md\npackage.json' ]] ||
    fail 'Release preparation changed unexpected files.'
  export GIT_AUTHOR_NAME='github-actions[bot]' GIT_COMMITTER_NAME='github-actions[bot]'
  export GIT_AUTHOR_EMAIL='41898282+github-actions[bot]@users.noreply.github.com'
  export GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"
  export GIT_AUTHOR_DATE="$timestamp" GIT_COMMITTER_DATE="$timestamp"
  git add -- CHANGELOG.md package.json
  git -c commit.gpgsign=false commit -m "chore(release): $tag" >&2
  revision=$(git rev-parse HEAD)
  if [[ -n $object ]]; then require_tag "$tag" "$revision"; fi
  if [[ -n $existing && -z $object ]]; then fail "Release $tag exists without its tag."; fi

  remote=$(git ls-remote --exit-code origin refs/heads/main)
  tip=${remote%%$'\t'*}
  if [[ -z $object && $tip != "$GITHUB_SHA" ]]; then fail 'main advanced; start a new release run.'; fi

  digest=$(inspect_image "release-$revision")
  if [[ -z $digest ]]; then
    [[ -z $object ]] || fail 'Published release image is missing; restore it without moving the tag.'
    digest=$(bash .github/scripts/publish-image.sh "release-$revision")
  fi
  verify_candidate "$(git rev-parse 'HEAD^{tree}')" create-release
  metadata=$(jq -cn --arg candidate "$revision@$digest" --arg commit "$revision" \
    '{candidate: $candidate, commit: $commit}')
  if [[ -n $existing ]]; then
    [[ $(release_metadata <<< "$existing") == "$metadata" ]] ||
      fail "Release $tag already has different metadata."
    printf 'Release %s is already published.\n' "$tag"
    return
  fi
  if [[ -z $object ]]; then
    git -c tag.gpgsign=false tag -a "$tag" -m "Release $tag"
    git push --atomic origin HEAD:refs/heads/main "refs/tags/$tag:refs/tags/$tag"
  fi
  # GITHUB_TOKEN pushes do not trigger CI. Dispatch it for the new main commit.
  remote=$(git ls-remote --exit-code origin refs/heads/main)
  if [[ ${remote%%$'\t'*} == "$revision" ]]; then gh workflow run ci.yml --ref main; fi
  printf '\nImage: `%s@%s`\n\n<!-- acadflow-image: %s -->\n' "$image" "$digest" "$metadata" >> "$notes"
  gh release create "$tag" --verify-tag --title "$tag" --notes-file "$notes"
}

resolve_snapshot() {
  local target=$1 commit=$2
  case "$target" in development | staging) ;; *) fail 'Unknown snapshot environment.' ;; esac
  commit=${commit:-${GITHUB_SHA:?}}
  require_main_commit "$commit"
  revision=$commit
  digest=$(inspect_image "snapshot-$revision")
  if [[ -n $digest ]]; then
    verify_candidate '' deploy-snapshot
  else
    digest=$(inspect_image "release-$revision")
    if [[ -n $digest ]]; then verify_candidate '' create-release; fi
  fi
  printf 'revision=%s\ndigest=%s\n' "$revision" "$digest" >> "${GITHUB_OUTPUT:?}"
  printf 'Source: main at %s\n' "$commit" >> "${GITHUB_STEP_SUMMARY:?}"
}

resolve_deploy() {
  local target=$1 version=$2 release metadata commit tag
  case $target in
    development | staging)
      parse_candidate "$version"
      require_main_commit "$revision"
      verify_candidate '' deploy-snapshot create-release publish-snapshot
      ;;
    production)
      tag=$(version_tag "$version")
      release=$(gh api "$repo/releases/tags/$tag")
      jq -e '.draft == false and .prerelease == false' <<< "$release" > /dev/null ||
        fail 'Expected a published stable release.'
      metadata=$(release_metadata <<< "$release")
      parse_candidate "$(jq -er '.candidate' <<< "$metadata")"
      commit=$(jq -er '.commit' <<< "$metadata")
      [[ $commit =~ ^$sha_pattern$ ]] || fail 'Invalid release commit.'
      require_tag "$tag" "$commit"
      require_main_history "$commit"
      local release_tree
      release_tree=$(commit_tree "$commit")
      [[ $(commit_tree "$revision") == "$release_tree" ]] || fail 'Candidate tree differs from the release commit.'
      verify_candidate "$release_tree" create-release deploy-snapshot publish-snapshot
      printf 'version=%s\n' "$tag" >> "${GITHUB_OUTPUT:?}"
      ;;
    *) fail 'Unknown environment.' ;;
  esac

  printf 'revision=%s\ndigest=%s\n' "$revision" "$digest" >> "${GITHUB_OUTPUT:?}"
  # shellcheck disable=SC2016
  printf 'Deploy `%s@%s` to **%s**.\n' "$image" "$digest" "$target" >> "${GITHUB_STEP_SUMMARY:?}"
}

case ${1:-} in
  release) [[ $# == 2 ]] || fail 'Expected version.'; create_release "$2" ;;
  resolve) [[ $# == 3 ]] || fail 'Expected environment and version/candidate.'; resolve_deploy "$2" "$3" ;;
  snapshot) [[ $# == 3 ]] || fail 'Expected environment and optional commit.'; resolve_snapshot "$2" "$3" ;;
  *) fail 'Unknown operation.' ;;
esac
