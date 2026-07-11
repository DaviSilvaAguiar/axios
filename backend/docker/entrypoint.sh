#!/bin/sh
set -eu

php artisan migrate --force
php artisan tenants:migrate --force
php artisan db:seed --force
php artisan tenants:seed --force

php artisan config:cache
php artisan route:cache
php artisan event:cache

[ ! -L "public/storage" ] && php artisan storage:link --quiet

nginx &

exec "$@"
