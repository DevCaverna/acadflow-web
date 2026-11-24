#!/bin/sh
set -eu

umask 077
value=${VITE_API_BASE_URL:-}
if [ -n "$value" ]; then
  if ! printf '%s' "$value" | grep -Eq '^https?://[a-zA-Z0-9.-]+(:[0-9]{1,5})?/?$' ||
    [ "$(printf '%s' "$value" | tr -d '\n\r')" != "$value" ]; then
    printf '%s\n' 'VITE_API_BASE_URL must be an HTTP(S) origin.' >&2
    exit 1
  fi
  printf 'window.__ACADFLOW_API_BASE_URL__ = "%s";\n' "$value" > /tmp/acadflow-runtime-config.js
else
  cp /usr/share/nginx/html/runtime-config.js /tmp/acadflow-runtime-config.js
fi

exec nginx -g 'daemon off;'
