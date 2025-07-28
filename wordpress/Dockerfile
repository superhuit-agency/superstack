#====================================
# README
# This file is for dev purpose only!
#====================================

FROM wordpress:6.8-php8.2-apache

# Add sudo in order to run wp-cli as the www-data user
RUN apt-get -qq update && apt-get -qq install -y \
	sudo \
	less \
	nano \
	git \
	zip \
	unzip \
	mariadb-client

## Enable Xdebug
RUN pecl install xdebug && docker-php-ext-enable xdebug
RUN echo 'xdebug.mode=develop,debug\n\
xdebug.start_with_request=yes\n\
xdebug.client_port=9003\n\
xdebug.client_host=host.docker.internal\n\
xdebug.log_level=0' >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# PHP extensions -> uncomment if needed
# RUN apt-get -qq install -y libxml2-dev
# RUN docker-php-ext-install soap
# RUN docker-php-ext-install pdo_mysql

# PHP config
## Show php logs in stderr
RUN touch /usr/local/etc/php/conf.d/php_error.ini
RUN echo "log_errors = on" >> /usr/local/etc/php/conf.d/php_error.ini
RUN echo "error_log = /dev/stderr" >> /usr/local/etc/php/conf.d/php_error.ini

## Add custom PHP configurations
RUN echo 'file_uploads = On\n\
memory_limit = 1024M\n\
upload_max_filesize = 512M\n\
post_max_size = 512M\n\
max_execution_time = 6000' > /usr/local/etc/php/conf.d/custom.ini

#-------------
# Add WP-CLI
#-------------
RUN curl -o /bin/wp-cli.phar https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
COPY ./wp-su.sh /bin/wp
RUN chmod +x /bin/wp-cli.phar /bin/wp
## Create directory for wp-cli packages
RUN mkdir -p /var/www/.wp-cli/packages
RUN chmod -R 777 /var/www/.wp-cli

#-------------
# Install Composer
#-------------
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

#-------------
# Copy website files
#-------------

# Cleanup
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
