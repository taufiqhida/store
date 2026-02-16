@echo off
echo Starting Taufiq Store Backend in Production Mode...

if not exist logs mkdir logs

pm2 stop ecosystem.config.js 2>nul

pm2 start ecosystem.config.js --env production

pm2 save

echo Backend started successfully!
echo Run 'pm2 monit' to monitor the application
echo Run 'pm2 logs' to view logs
pause
