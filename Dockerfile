# Dockerfile
FROM drupal:10-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libzip-dev \
    zip \
    default-mysql-client \
    && docker-php-ext-install zip bcmath \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set Composer environment variables
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_HOME=/var/cache/composer

# Install Drush Launcher (calls project-level Drush)
RUN curl -fsSL https://github.com/drush-ops/drush-launcher/releases/latest/download/drush.phar \
    -o /usr/local/bin/drush \
    && chmod +x /usr/local/bin/drush

# Allow .htaccess overrides for Drupal (AllowOverride None blocks Drupal routing)
RUN sed -i 's|AllowOverride None|AllowOverride All|g' /etc/apache2/apache2.conf

# Multisite: virtual hosts for budhound.app and rareimagery.net
COPY apache/budhound.app.conf    /etc/apache2/sites-available/budhound.app.conf
COPY apache/rareimagery.net.conf /etc/apache2/sites-available/rareimagery.net.conf
RUN a2ensite budhound.app.conf rareimagery.net.conf \
    && a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Expose Apache port
EXPOSE 80
