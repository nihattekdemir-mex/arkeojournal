# Deployment Guide - ArkeoJournal

This guide covers different deployment options for ArkeoJournal.

## Table of Contents

1. [Vercel (Recommended)](#vercel-recommended)
2. [Railway](#railway)
3. [Docker Self-Hosted](#docker-self-hosted)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [SSL/HTTPS](#sslhttps)
7. [Monitoring & Logging](#monitoring--logging)

## Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Steps:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `nextjs_space` directory as root

3. **Configure Environment Variables**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   NEXTAUTH_SECRET=your_secret_key_here
   NEXTAUTH_URL=https://your-domain.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

5. **Database Migration**
   ```bash
   # After deployment, run migrations
   npx prisma migrate deploy
   ```

### Cost: ~$20/month + Database fees

---

## Railway

Railway provides a simple deployment platform with integrated PostgreSQL.

### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL**
   - Click "Add Service"
   - Select "PostgreSQL"
   - Railway will create database automatically

4. **Configure Environment**
   ```
   NODE_ENV=production
   NEXTAUTH_SECRET=your_secret_key
   ```

5. **Deploy**
   - Railway automatically deploys on push to main

### Cost: $5 minimum + usage

---

## Docker Self-Hosted

For deployment on your own VPS (AWS, DigitalOcean, Linode, etc.).

### Prerequisites:

- VPS with Docker and Docker Compose installed
- Domain name pointing to your VPS
- SSL certificate (or let's-encrypt)

### Steps:

1. **Prepare Environment**
   ```bash
   ssh user@your-vps.com
   mkdir -p /opt/arkeojournal
   cd /opt/arkeojournal
   ```

2. **Copy Files**
   ```bash
   git clone https://github.com/nihattekdemir-mex/arkeojournal.git
   cd arkeojournal/nextjs_space
   ```

3. **Create .env**
   ```bash
   cat > .env << EOF
   DATABASE_URL="postgresql://arkeojournal_user:PASSWORD@localhost:5432/arkeojournal"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="https://your-domain.com"
   POSTGRES_PASSWORD="PASSWORD"
   EOF
   ```

4. **Create nginx.conf**
   ```nginx
   worker_processes auto;
   error_log /var/log/nginx/error.log warn;
   pid /var/run/nginx.pid;

   events {
     worker_connections 1024;
   }

   http {
     include /etc/nginx/mime.types;
     default_type application/octet-stream;
     
     log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                     '$status $body_bytes_sent "$http_referer" '
                     '"$http_user_agent" "$http_x_forwarded_for"';
     
     access_log /var/log/nginx/access.log main;
     
     sendfile on;
     tcp_nopush on;
     tcp_nodelay on;
     keepalive_timeout 65;
     types_hash_max_size 2048;
     client_max_body_size 20M;
     
     gzip on;
     gzip_vary on;
     gzip_proxied any;
     gzip_comp_level 6;
     gzip_types text/plain text/css text/xml text/javascript 
                application/json application/javascript application/xml+rss;

     upstream app {
       server app:3000;
     }

     server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location / {
         proxy_pass http://app;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
         proxy_cache_bypass $http_upgrade;
       }
     }
   }
   ```

5. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

6. **Run Migrations**
   ```bash
   docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
   docker-compose -f docker-compose.prod.yml exec app npm run seed
   ```

### Setup SSL with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Update nginx.conf with SSL
# Then restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Monitoring

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check health
curl http://your-domain.com/api/auth/session

# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U arkeojournal_user arkeojournal > backup.sql
```

---

## Environment Variables

### Required

```env
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-random-secret-key-here-min-32-chars
NEXTAUTH_URL=https://your-domain.com
```

### Optional

```env
NODE_ENV=production
LOG_LEVEL=info
DATABASE_POOL_MIN=1
DATABASE_POOL_MAX=10
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Database Setup

### Prisma Migrations

```bash
# Run pending migrations
npx prisma migrate deploy

# Create migration from schema changes
npx prisma migrate dev --name description_of_changes

# Reset database (development only)
npx prisma migrate reset
```

### Database Backup

```bash
# Full backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20260707.sql
```

---

## SSL/HTTPS

### Using Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly \
  --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  -n \
  --agree-tos \
  --email admin@your-domain.com
```

### Using Cloudflare

1. Point your domain to Cloudflare
2. Cloudflare provides free SSL/TLS
3. Set SSL mode to "Full" or "Full (Strict)"

---

## Monitoring & Logging

### Application Logs

```bash
# Docker logs
docker-compose -f docker-compose.prod.yml logs -f app

# Full logs with timestamps
docker-compose -f docker-compose.prod.yml logs --timestamps -f
```

### Database Logs

```bash
# PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Health Checks

```bash
# Check app health
curl -X GET https://your-domain.com/api/health

# Check database
npx prisma db execute --stdin < check.sql
```

### Performance Monitoring

```bash
# Docker stats
docker stats

# Database connections
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U arkeojournal_user -d arkeojournal \
  -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

---

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple App Instances**: Run multiple container replicas
3. **Database**: Use managed PostgreSQL service (RDS, Railway, Heroku)
4. **Cache**: Add Redis for session management
5. **CDN**: Use Cloudflare or AWS CloudFront

### Vertical Scaling

1. Increase VPS resources
2. Increase database resources
3. Optimize Prisma queries
4. Enable database indexes

---

## Troubleshooting

### Container won't start
```bash
docker-compose -f docker-compose.prod.yml logs app
docker-compose -f docker-compose.prod.yml ps
```

### Database connection failed
```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U arkeojournal_user
```

### Out of disk space
```bash
docker system prune -a
docker volume prune
```

### Memory issues
```bash
docker-compose -f docker-compose.prod.yml stats
# Increase Docker memory limit in daemon.json
```

---

## Support

For deployment issues, check:
- GitHub Issues: https://github.com/nihattekdemir-mex/arkeojournal/issues
- Vercel Docs: https://vercel.com/docs
- Docker Docs: https://docs.docker.com/
- Railway Docs: https://docs.railway.app/
