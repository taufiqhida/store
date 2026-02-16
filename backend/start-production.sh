#!/bin/bash
echo "🚀 Starting Taufiq Store Backend in Production Mode..."

# Create logs directory if not exists
mkdir -p logs

# Stop existing instances
pm2 stop ecosystem.config.js 2>/dev/null || true

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 to start on system reboot
pm2 startup

echo "✅ Backend started successfully!"
echo "📊 Run 'pm2 monit' to monitor the application"
echo "📝 Run 'pm2 logs' to view logs"
