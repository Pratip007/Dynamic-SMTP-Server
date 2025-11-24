# Docker Quick Start Guide

Quick reference for deploying with Docker.

## Prerequisites

- Docker installed
- Docker Compose installed
- `.env` file configured

## Quick Deployment

### 1. Configure Environment

```bash
# Copy template
cp env.template .env

# Edit .env and set ENCRYPTION_KEY
nano .env
```

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Deploy

**Option A: Using deployment script (Linux/Mac)**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Option B: Using Docker Compose**
```bash
# Create data directory
mkdir -p data

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f
```

**Option C: Using Docker directly**
```bash
# Build image
docker build -t dynamic-smtp-server .

# Run container
docker run -d \
  --name smtp-server \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  dynamic-smtp-server
```

## Common Commands

### View Logs
```bash
docker-compose logs -f
# or
docker logs -f smtp-server
```

### Stop Server
```bash
docker-compose down
# or
docker stop smtp-server
```

### Restart Server
```bash
docker-compose restart
# or
docker restart smtp-server
```

### Update Application
```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Check Status
```bash
docker ps
docker-compose ps
```

### Access Container Shell
```bash
docker exec -it smtp-server sh
```

### Backup Database
```bash
# SQLite
cp data/database.sqlite data/backup-$(date +%Y%m%d).sqlite

# PostgreSQL (if using)
docker exec smtp-postgres pg_dump -U smtp_user smtp_db > backup.sql
```

## Environment Variables

Required in `.env`:
- `ENCRYPTION_KEY` - Must be set (generate with Node.js command above)
- `DB_DIALECT` - `sqlite` or `postgres`
- `PORT` - Server port (default: 3000)

For SQLite:
- `DB_STORAGE=/app/data/database.sqlite`

For PostgreSQL:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

## Troubleshooting

### Container won't start
```bash
docker logs smtp-server
```

### Port already in use
```bash
# Find process using port 3000
sudo lsof -i :3000
# or
sudo netstat -tulpn | grep 3000
```

### Permission errors
```bash
sudo chown -R $USER:$USER data/
chmod -R 755 data/
```

### Database issues
- Check `.env` file has correct database configuration
- Verify data directory exists and is writable
- Check container logs for database errors

## Health Check

Test if server is running:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "SMTP Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Production Tips

1. **Use PostgreSQL** for production (more reliable than SQLite)
2. **Set up reverse proxy** (Nginx) with SSL
3. **Configure firewall** rules
4. **Set up backups** (automate database backups)
5. **Monitor logs** regularly
6. **Use strong encryption keys** (generate new for production)

## Next Steps

For detailed Azure VM deployment, see [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)

