#!/bin/sh
set -eu
certbot renew --cert-name assistent.rinulik.ru \
  --config-dir /var/lib/docker/volumes/rinulik_certbot-conf/_data \
  --work-dir /opt/assistent/certbot-work --logs-dir /opt/assistent/certbot-logs \
  --deploy-hook 'docker exec rinulik-nginx-1 nginx -t && docker exec rinulik-nginx-1 nginx -s reload' --quiet
