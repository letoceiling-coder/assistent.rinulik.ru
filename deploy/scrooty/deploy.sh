#!/bin/sh
# Deploy the `scrooty` branch to https://scrooty.ru. Run on the server: sh /opt/scrooty.ru/deploy/scrooty/deploy.sh
set -eu
cd /opt/scrooty.ru
git fetch origin scrooty
git checkout scrooty
git reset --hard origin/scrooty
docker compose build app web
docker compose up -d postgres redis
docker compose run --rm app php artisan migrate --force
docker compose up -d --remove-orphans
sh deploy/scrooty/ensure-gateway.sh
docker compose ps
