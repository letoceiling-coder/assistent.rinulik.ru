#!/bin/sh
set -eu
src=/opt/assistent/deploy/gateway.conf
container=rinulik-nginx-1
docker inspect "$container" >/dev/null 2>&1 || exit 0
current=$(docker exec "$container" sh -c 'cat /etc/nginx/conf.d/assistent.conf 2>/dev/null' || true)
desired=$(cat "$src")
if [ "$current" = "$desired" ]; then exit 0; fi
docker cp "$src" "$container":/etc/nginx/conf.d/assistent.conf
if docker exec "$container" nginx -t; then
    docker exec "$container" nginx -s reload
else
    printf '%s\n' "$current" | docker exec -i "$container" sh -c 'cat > /etc/nginx/conf.d/assistent.conf'
    exit 1
fi
