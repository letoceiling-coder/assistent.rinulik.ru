#!/bin/sh
# Installs only /etc/nginx/conf.d/scrooty.conf into the shared gateway; rolls back if nginx -t fails.
set -eu
src=${1:-/opt/scrooty.ru/deploy/scrooty/gateway.conf}
container=rinulik-nginx-1
docker inspect "$container" >/dev/null 2>&1 || exit 0
current=$(docker exec "$container" sh -c 'cat /etc/nginx/conf.d/scrooty.conf 2>/dev/null' || true)
desired=$(cat "$src")
if [ "$current" = "$desired" ]; then exit 0; fi
docker cp "$src" "$container":/etc/nginx/conf.d/scrooty.conf
if docker exec "$container" nginx -t; then
    docker exec "$container" nginx -s reload
else
    if [ -n "$current" ]; then
        printf '%s\n' "$current" | docker exec -i "$container" sh -c 'cat > /etc/nginx/conf.d/scrooty.conf'
    else
        docker exec "$container" rm -f /etc/nginx/conf.d/scrooty.conf
    fi
    exit 1
fi
