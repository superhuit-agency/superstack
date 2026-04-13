#====================================
# README
# This file is for dev purpose only!
#====================================

FROM wordpress:6.9-php8.3-apache

# Add sudo in order to run wp-cli as the www-data user
RUN apt-get -qq update && apt-get -qq install -y \
	sudo \
	less \
	nano \
	git \
	zip \
	unzip \
	mariadb-client

#-------------
# PHP configurations & extensions
#-------------

## PHP custom configurations
COPY ./server/custom.ini /usr/local/etc/php/conf.d/custom.ini

## Enable Xdebug
RUN pecl install xdebug && docker-php-ext-enable xdebug
RUN echo "xdebug.mode=develop,debug\nxdebug.start_with_request=yes\nxdebug.client_port=9003\nxdebug.client_host=host.docker.internal\nxdebug.log_level=0" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# PHP extensions -> uncomment if needed
# RUN apt-get -qq install -y libxml2-dev
# RUN docker-php-ext-install soap
# RUN docker-php-ext-install pdo_mysql

#-------------
# Add WP-CLI
#-------------
RUN curl -o /bin/wp-cli.phar https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
COPY ./server/wp-su.sh /bin/wp
RUN chmod +x /bin/wp-cli.phar /bin/wp
## Create directory for wp-cli packages
RUN mkdir -p /var/www/.wp-cli/packages
RUN chmod -R 777 /var/www/.wp-cli

#-------------
# Install Composer
#-------------
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Cleanup
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
