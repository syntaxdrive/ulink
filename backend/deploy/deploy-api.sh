#!/bin/bash
set -e

APP_DIR="/var/www/unilink-api"

echo "=================================================="
echo "         Deploying UniLink NestJS Backend         "
echo "=================================================="

# Check if directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "Cloning repository into $APP_DIR..."
    sudo mkdir -p /var/www
    sudo chown -R $USER:$USER /var/www
    git clone https://github.com/syntaxdrive/ulink.git "$APP_DIR"
else
    echo "Pulling latest code from origin main..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
fi

cd "$APP_DIR/backend"

# Ensure .env exists
if [ ! -f ".env" ]; then
    echo "WARNING: .env not found in $APP_DIR/backend!"
    echo "Please copy your .env file into $APP_DIR/backend/.env before starting PM2."
    exit 1
fi

echo "Installing backend dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Compiling NestJS TypeScript..."
npm run build

echo "Starting/Reloading PM2 process..."
pm2 start dist/main.js --name "unilink-api" || pm2 reload "unilink-api"
pm2 save

echo "Configuring PM2 startup on system boot..."
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME || true

echo "=================================================="
echo "  UniLink Backend is LIVE and managed by PM2!    "
echo "  Check status anytime with: pm2 status          "
echo "  View real-time logs with:  pm2 logs            "
echo "=================================================="
