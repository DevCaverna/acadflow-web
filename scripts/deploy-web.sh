#!/usr/bin/env bash
# Executed from the trusted workflow checkout over SSH.
set -euo pipefail
export PATH=/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/bin
umask 077

fail() { printf 'Deploy: %s\n' "$*" >&2; exit 1; }

[[ $# == 2 ]] || fail 'Expected an environment and image digest.'
environment=$1
digest=$2
case $environment in
  development | staging | production) ;;
  *) fail 'Unknown environment.' ;;
esac
[[ $digest =~ ^sha256:[0-9a-f]{64}$ ]] || fail 'Expected sha256:DIGEST.'
image="ghcr.io/devcaverna/acadflow-web@$digest"

keys=(WEB_HOST_PORT VITE_API_BASE_URL)
for key in "${keys[@]}"; do
  IFS= read -r -d '' -t 10 -n 8193 entry || fail "Missing runtime setting: $key."
  [[ $entry == "$key="* && ${#entry} -lt 8193 ]] || fail "Invalid runtime setting: $key."
  value=${entry#*=}
  [[ -n $value ]] || fail "Empty runtime setting: $key."
  if [[ $key == WEB_HOST_PORT ]]; then
    host_port=$value
  else
    export "$key=$value"
  fi
done
if ! [[ $host_port =~ ^[0-9]{1,5}$ ]] || ! ((10#$host_port >= 1 && 10#$host_port <= 65535)); then
  fail 'Invalid WEB_HOST_PORT.'
fi
host_port=$((10#$host_port))
[[ $VITE_API_BASE_URL =~ ^https://[a-zA-Z0-9.-]+(:[0-9]{1,5})?/?$ ]] ||
  fail 'VITE_API_BASE_URL must be a public HTTPS origin.'
unset entry value
IFS= read -r -d '' -t 10 -n 256 ghcr_username && [[ $ghcr_username =~ ^[a-zA-Z0-9_-]+(\[bot\])?$ ]] ||
  fail 'Missing or invalid GHCR username.'
IFS= read -r -d '' -t 10 -n 8193 ghcr_token && [[ -n $ghcr_token && ${#ghcr_token} -lt 8193 ]] ||
  fail 'Missing or invalid GHCR token.'

name="acadflow-web-$environment"
previous="$name-previous"
exec 9> "/run/lock/$name.lock"
flock -n 9 || fail 'Another deploy is in progress.'
exec 8> "/run/lock/acadflow-web-port-$host_port.lock"
flock -n 8 || fail 'Another deploy is using the requested port.'

for other in development staging production; do
  [[ $other != "$environment" ]] || continue
  for container in "acadflow-web-$other" "acadflow-web-$other-previous"; do
    ports=$(docker container inspect --format \
      '{{range index .HostConfig.PortBindings "8080/tcp"}}{{println .HostPort}}{{end}}' \
      "$container" 2> /dev/null) || continue
    if grep -Fxq "$host_port" <<< "$ports"; then
      fail 'Port is assigned to another AcadFlow Web environment.'
    fi
  done
done

exists() { docker container inspect "$1" > /dev/null 2>&1; }
serves_index() {
  curl --noproxy '*' --fail --silent --max-time 3 "http://127.0.0.1:$host_port/" > /dev/null
}
healthy() {
  local response
  response=$(curl --noproxy '*' --fail --silent --max-time 3 \
    "http://127.0.0.1:$host_port/runtime-config.js") &&
    [[ $response == "window.__ACADFLOW_API_BASE_URL__ = \"$VITE_API_BASE_URL\";" ]] &&
    serves_index
}

pull_image() (
  registry_config=$(mktemp -d) || exit 1
  trap 'rm -f -- "$registry_config/config.json"; rmdir -- "$registry_config"' EXIT
  # A real auth entry prevents Docker from selecting a host credential helper.
  auth=$(printf '%s:%s' "$ghcr_username" "$ghcr_token" | base64 -w 0) || exit 1
  printf '{"auths":{"ghcr.io":{"auth":"%s"}}}\n' "$auth" > "$registry_config/config.json" || exit 1
  docker --config "$registry_config" pull "$image"
)
if ! pull_image; then
  fail 'GHCR pull failed. Verify that this repository has Actions read access to the package.'
fi
unset ghcr_username ghcr_token

keep_current=false
if exists "$name"; then
  if ! exists "$previous" || { [[ $(docker inspect --format '{{.State.Status}}' "$name") == running ]] &&
    serves_index; }; then
    keep_current=true
  fi
fi

if exists "$name"; then
  if $keep_current; then
    docker stop "$name"
    if exists "$previous"; then docker rm "$previous"; fi
    docker rename "$name" "$previous"
  else
    docker rm -f "$name"
  fi
fi
docker run --detach --restart unless-stopped --name "$name" --env VITE_API_BASE_URL \
  --cap-drop ALL --security-opt no-new-privileges \
  --publish "127.0.0.1:$host_port:8080" "$image"

deadline=$((SECONDS + 120))
while ((SECONDS < deadline)); do
  if healthy; then
    printf 'Healthy: %s (%s)\n' "$name" "$image"
    exit 0
  fi
  sleep 2
done
fail 'Web health check failed. Inspect the container or restore the previous one.'
