# VPS Deployment Guide - Taufiq Store Backend

## Prerequisites

1. **Install PM2 globally**
   ```bash
   npm install -g pm2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure .env**
   - Copy `.env.example` to `.env`
   - Set `NODE_ENV=production`
   - Configure database credentials

## Deployment Steps

### 1. Start Application
```bash
# Linux/Mac
bash start-production.sh

# Windows
start-production.bat

# Or manually:
pm2 start ecosystem.config.js --env production
```

### 2. Monitor Application
```bash
pm2 monit          # Real-time monitoring
pm2 logs           # View logs
pm2 status         # Check status
pm2 list           # List all processes
```

### 3. Auto-start on Reboot
```bash
pm2 startup        # Generate startup script (follow instructions)
pm2 save           # Save current process list
```

### 4. Useful Commands
```bash
pm2 restart all    # Restart all instances
pm2 reload all     # Zero-downtime reload
pm2 stop all       # Stop all instances
pm2 delete all     # Delete all instances
pm2 flush          # Clear logs
pm2 logs --err     # View error logs only
```

## Troubleshooting

### Backend Crashes
- Check logs: `pm2 logs --err`
- Check memory: `pm2 monit`
- Restart: `pm2 restart all`

### High Memory Usage
- PM2 akan auto-restart jika memory > 512MB
- Check: `pm2 list` untuk melihat restart count
- Reduce PM2 instances: edit `ecosystem.config.js` dan ubah `instances: 1`

### Database Connection Errors
- Check `.env` database credentials
- Test connection: `node -e "require('./src/config/database').getConnection().then(c => {console.log('OK'); c.release()})"`
- Check MySQL max_connections: `SHOW VARIABLES LIKE 'max_connections';`

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or find and kill manually
lsof -ti:3000 | xargs kill -9
```

## Performance Tips

1. **Enable gzip compression** in nginx
2. **Use PM2 cluster mode** (sudah enabled dengan 2 instances)
3. **Monitor logs** regularly with `pm2 logs`
4. **Set up nginx reverse proxy** untuk production
5. **Enable SSL** dengan Let's Encrypt

## Configuration Overview

- **Cluster Mode**: 2 instances (load balancing)
- **Memory Limit**: 512MB per instance
- **Database Pool**: 50 connections
- **Concurrent Requests**: Max 10 per IP
- **Request Timeout**: 30 seconds
- **Auto-restart**: Enabled

## Security Checklist

- [ ] Change default admin credentials
- [ ] Configure firewall (allow only necessary ports)
- [ ] Set up SSL certificate
- [ ] Use environment variables for sensitive data
- [ ] Enable rate limiting (sudah aktif)
- [ ] Regular database backups
- [ ] Keep dependencies updated

## Monitoring

```bash
# Real-time dashboard
pm2 monit

# Detailed info
pm2 show taufiq-store-backend

# Memory and CPU usage
pm2 list

# Logs (last 100 lines)
pm2 logs --lines 100
```

## Updating Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Restart with zero-downtime
pm2 reload all
```

## Backup and Recovery

```bash
# Backup database
mysqldump -u user -p database_name > backup.sql

# Restore database
mysql -u user -p database_name < backup.sql
```

## Need Help?

- PM2 Documentation: https://pm2.keymetrics.io/docs/
- Check logs: `pm2 logs --err`
- Test endpoints: Use Postman or curl
