#!/bin/bash
set -e

echo "=================================================="
echo "   UniLink Azure B1s VM Initial Setup Script      "
echo "=================================================="

# 1. Setup 2GB Swap (Essential for 1GB RAM Azure B1s VM)
if [ ! -f /swapfile ]; then
    echo "Configuring 2GB Swap file for memory stability..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap enabled successfully."
fi

# 2. Update and install packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw build-essential

# 3. Install Node.js 20 & PM2
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "Installing PM2 process manager..."
sudo npm install -g pm2

# 4. Configure Firewall
echo "Configuring UFW firewall (allowing SSH, HTTP, HTTPS)..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 5. Configure Nginx Reverse Proxy for api.unilink.ng
echo "Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/unilink-api > /dev/null << 'EOF'
server {
    listen 80;
    server_name api.unilink.ng;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/unilink-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "=================================================="
echo "Azure B1s VM Environment is Ready!"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PM2 version: $(pm2 -v)"
echo "=================================================="
