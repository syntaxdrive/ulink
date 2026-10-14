#!/bin/bash
set -e

echo "🚀 Deploying UniLink Backend on Azure VM (Spain Central)..."

# 1. Pull latest code from GitHub
cd /var/www/unilink-api
git pull origin main

# 2. Build NestJS backend
cd backend
npm install
npm run build

# 3. Ensure persistent uploads folder exists with proper permissions
mkdir -p /var/www/unilink-api/uploads/posts
mkdir -p /var/www/unilink-api/uploads/avatars
chmod -R 777 /var/www/unilink-api/uploads

# 4. Restart PM2 process
pm2 restart unilink-api || pm2 start dist/main.js --name unilink-api
pm2 save

# 5. Configure Nginx with SSL via certbot
sudo apt-get update -y
sudo apt-get install -y certbot python3-certbot-nginx

# Link Nginx config
sudo cp /var/www/unilink-api/backend/nginx_azure_unilink.conf /etc/nginx/sites-available/unilink
sudo ln -sf /etc/nginx/sites-available/unilink /etc/nginx/sites-enabled/unilink
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Issue Let's Encrypt SSL certificate
sudo certbot --nginx -d 158-158-120-244.sslip.io --non-interactive --agree-tos -m syntaxdrive@gmail.com --redirect || true

echo "✅ UniLink Azure deployment complete! Live at https://158-158-120-244.sslip.io"
