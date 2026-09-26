#!/bin/sh
set -eu
certbot renew --cert-name scrooty.ru \
  --config-dir /var/lib/docker/volumes/rinulik_certbot-conf/_data \
  --work-dir /opt/scrooty.ru/certbot-work --logs-dir /opt/scrooty.ru/certbot-logs \
  --deploy-hook 'docker exec rinulik-nginx-1 nginx -t && docker exec rinulik-nginx-1 nginx -s reload' --quiet
