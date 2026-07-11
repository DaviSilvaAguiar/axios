FROM composer:2.8 AS deps

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
      --no-dev \
      --no-scripts \
      --no-interaction \
      --prefer-dist \
      --ignore-platform-reqs

COPY . .

RUN mkdir -p bootstrap/cache \
    && composer dump-autoload --optimize --classmap-authoritative --no-scripts \
    && php artisan package:discover --ansi || true

FROM php:8.3-fpm-alpine AS runtime

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN apk add --no-cache nginx \
  && install-php-extensions \
      pdo_mysql \
      mbstring \
      bcmath \
      intl \
      zip \
      pcntl \
      opcache \
      gd \
  && rm -rf /var/cache/apk/*

COPY docker/php/opcache.ini    /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/fpm-pool.conf  /usr/local/etc/php-fpm.d/zz-app.conf
COPY docker/php/php.ini        /usr/local/etc/php/conf.d/app.ini
COPY docker/nginx/nginx.conf   /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

RUN addgroup -g 1000 appgroup \
  && adduser -u 1000 -G appgroup -s /bin/sh -D appuser

WORKDIR /var/www/html

COPY --from=deps --chown=appuser:appgroup /app .

RUN mkdir -p \
      storage/app/public \
      storage/app/private \
      storage/framework/cache/data \
      storage/framework/sessions \
      storage/framework/views \
      storage/logs \
      bootstrap/cache \
      /tmp/nginx_client_body \
      /tmp/nginx_proxy \
      /tmp/nginx_fastcgi \
      /tmp/nginx_uwsgi \
      /tmp/nginx_scgi \
  && chown -R appuser:appgroup \
      storage bootstrap/cache \
      /tmp/nginx_client_body /tmp/nginx_proxy /tmp/nginx_fastcgi \
      /tmp/nginx_uwsgi /tmp/nginx_scgi \
      /var/lib/nginx /var/log/nginx \
  && chmod -R 775 storage bootstrap/cache

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD php artisan --version > /dev/null 2>&1 || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]
