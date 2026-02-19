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

# Point Apache DocumentRoot to Composer project's web/ directory
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/web|g' \
    /etc/apache2/sites-available/000-default.conf

# Set working directory
WORKDIR /var/www/html

# Expose Apache port
EXPOSE 80
