#!/bin/sh
set -e

# Remove classmap-authoritative para que controllers adicionados via bind mount sejam encontrados
sed -i 's/setClassMapAuthoritative(true)/setClassMapAuthoritative(false)/' \
    /var/www/html/vendor/composer/autoload_real.php

exec /entrypoint.sh php-fpm
