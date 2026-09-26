FROM node:22-bookworm-slim AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY vite.config.js tsconfig.json ./
COPY resources ./resources
RUN npm run build

FROM php:8.3-fpm-bookworm AS app
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev libzip-dev libonig-dev libxml2-dev libsqlite3-dev poppler-utils antiword unzip ca-certificates \
    && docker-php-ext-install pdo_pgsql pdo_sqlite bcmath mbstring zip pcntl opcache \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction --optimize-autoloader
COPY . .
COPY --from=frontend /app/public/build ./public/build
COPY deploy/php.ini /usr/local/etc/php/conf.d/assistent.ini
RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs storage/app/private \
    && composer dump-autoload --no-dev --optimize && chown -R www-data:www-data storage bootstrap/cache
USER www-data
CMD ["php-fpm"]

FROM nginx:1.27-alpine AS web
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=app /var/www/html/public /var/www/html/public
