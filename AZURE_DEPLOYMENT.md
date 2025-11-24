# Azure VM Deployment Guide

This guide will help you deploy the Dynamic SMTP Server to an Azure Virtual Machine using Docker.

## Prerequisites

- Azure account with active subscription
- SSH client (Windows: PowerShell/OpenSSH, Mac/Linux: Terminal)
- Basic knowledge of Azure Portal and Linux commands

## Step 1: Create Azure Virtual Machine

### 1.1 Create VM in Azure Portal

1. Log in to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** → Search for **"Virtual Machine"**
3. Select **"Virtual Machine"** → Click **"Create"**

### 1.2 Configure VM Settings

**Basics Tab:**
- **Subscription**: Select your subscription
- **Resource Group**: Create new or select existing
- **Virtual machine name**: `smtp-server-vm` (or your preferred name)
- **Region**: Choose closest region (e.g., East US, West Europe)
- **Image**: **Ubuntu Server 22.04 LTS** (or latest LTS)
- **Size**: **Standard_B1s** (1 vCPU, 1GB RAM) - minimum recommended
  - For production: Consider **Standard_B2s** (2 vCPU, 4GB RAM) or higher
- **Authentication type**: **SSH public key** (recommended) or Password
- **Username**: `azureuser` (or your preferred username)
- **SSH public key**: Paste your public key or generate new

**Networking Tab:**
- **Virtual network**: Create new or use existing
- **Subnet**: Default
- **Public IP**: **Yes**
- **NIC network security group**: **Advanced**
- **Configure network security group**: **Create new**
  - Add inbound rules:
    - **SSH (22)**: Allow from your IP or Any
    - **HTTP (80)**: Allow from Any (if using reverse proxy)
    - **Custom (3000)**: Allow from Any (for direct access)

**Review + Create:**
- Review settings
- Click **"Create"**
- Wait for deployment (2-3 minutes)

### 1.3 Get VM Public IP

1. Go to your VM resource
2. Copy the **Public IP address**

## Step 2: Connect to Azure VM

### 2.1 SSH into VM

**Windows (PowerShell):**
```powershell
ssh azureuser@<PUBLIC_IP_ADDRESS>
```

**Mac/Linux:**
```bash
ssh azureuser@<PUBLIC_IP_ADDRESS>
```

Replace `<PUBLIC_IP_ADDRESS>` with your VM's public IP.

## Step 3: Install Docker on Azure VM

### 3.1 Update System

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 3.2 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3.3 Logout and Login Again

```bash
exit
```

Then SSH back in to apply docker group changes.

## Step 4: Deploy Application

### 4.1 Clone Your Repository

```bash
# Install Git if not already installed
sudo apt-get install git -y

# Clone your repository
git clone https://github.com/YOUR_USERNAME/Dynamic-SMTP-Server.git
cd Dynamic-SMTP-Server
```

**OR** upload files using SCP:

**From your local machine:**
```bash
scp -r . azureuser@<PUBLIC_IP>:/home/azureuser/smtp-server
```

### 4.2 Create Environment File

```bash
# Create .env file
nano .env
```

Add the following content (adjust as needed):

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
# For SQLite (default):
DB_DIALECT=sqlite
DB_STORAGE=/app/data/database.sqlite

# For PostgreSQL (if using):
# DB_DIALECT=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=smtp_db
# DB_USER=smtp_user
# DB_PASSWORD=your_secure_password

# Security - Encryption Key (REQUIRED)
# Generate a new key:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_generated_encryption_key_here

# Optional: JWT Secret (if using authentication)
# JWT_SECRET=your-jwt-secret-key
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### 4.3 Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and update `ENCRYPTION_KEY` in your `.env` file.

### 4.4 Build and Run with Docker

**Option A: Using Docker Compose (Recommended)**

```bash
# Create data directory for database
mkdir -p data

# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f
```

**Option B: Using Docker directly**

```bash
# Build image
docker build -t dynamic-smtp-server .

# Create data directory
mkdir -p data

# Run container
docker run -d \
  --name smtp-server \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  dynamic-smtp-server
```

### 4.5 Verify Deployment

```bash
# Check if container is running
docker ps

# Check logs
docker logs smtp-server

# Test health endpoint
curl http://localhost:3000/health
```

## Step 5: Configure Firewall and Networking

### 5.1 Azure Network Security Group

1. Go to Azure Portal → Your VM → **Networking**
2. Click on **Network security group**
3. Add inbound rule:
   - **Name**: `smtp-server-http`
   - **Priority**: 1000
   - **Source**: Any
   - **Destination port ranges**: 3000
   - **Protocol**: TCP
   - **Action**: Allow

### 5.2 Configure UFW Firewall (Optional)

```bash
# Install UFW
sudo apt-get install ufw -y

# Allow SSH
sudo ufw allow 22/tcp

# Allow application port
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 6: Set Up Reverse Proxy (Optional but Recommended)

Using Nginx as reverse proxy for better security and SSL support.

### 6.1 Install Nginx

```bash
sudo apt-get install nginx -y
```

### 6.2 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/smtp-server
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3000;
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
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/smtp-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6.3 Set Up SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Step 7: Set Up Auto-Start on Boot

Docker containers with `--restart unless-stopped` will automatically start on boot. Verify:

```bash
# Reboot VM
sudo reboot

# After reboot, SSH back in and check
docker ps
```

## Step 8: Access Your Application

### 8.1 Access Admin Dashboard

Open browser and navigate to:
- **Direct access**: `http://<PUBLIC_IP>:3000/admin`
- **With Nginx**: `http://your-domain.com/admin`

### 8.2 Access API

- **API endpoint**: `http://<PUBLIC_IP>:3000/api/send-inquiry`
- **Health check**: `http://<PUBLIC_IP>:3000/health`

## Step 9: Maintenance and Updates

### 9.1 Update Application

```bash
cd /home/azureuser/Dynamic-SMTP-Server

# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 9.2 View Logs

```bash
# Docker Compose
docker-compose logs -f

# Docker
docker logs -f smtp-server
```

### 9.3 Backup Database

**For SQLite:**
```bash
# Backup SQLite database
cp data/database.sqlite data/database.sqlite.backup-$(date +%Y%m%d)
```

**For PostgreSQL:**
```bash
docker exec smtp-postgres pg_dump -U smtp_user smtp_db > backup.sql
```

### 9.4 Monitor Resources

```bash
# Check container stats
docker stats

# Check disk usage
df -h

# Check memory
free -h
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs smtp-server

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Restart container
docker restart smtp-server
```

### Database connection issues

- Verify `.env` file has correct database credentials
- Check database container is running (if using PostgreSQL)
- Verify database file permissions (if using SQLite)

### Can't access from browser

- Check Azure Network Security Group rules
- Verify firewall settings
- Check if container is running: `docker ps`
- Test locally on VM: `curl http://localhost:3000/health`

### Permission denied errors

```bash
# Fix data directory permissions
sudo chown -R $USER:$USER data/
chmod -R 755 data/
```

## Security Best Practices

1. **Change default SSH port** (optional but recommended)
2. **Use SSH keys** instead of passwords
3. **Keep system updated**: `sudo apt-get update && sudo apt-get upgrade`
4. **Use firewall**: Configure UFW or Azure NSG
5. **Use HTTPS**: Set up SSL certificate with Let's Encrypt
6. **Regular backups**: Automate database backups
7. **Monitor logs**: Set up log monitoring
8. **Use strong passwords**: For database and encryption keys

## Cost Optimization

- Use **Standard_B1s** for development/testing
- Use **Reserved Instances** for production (save up to 72%)
- Enable **Auto-shutdown** for non-production VMs
- Monitor usage in Azure Cost Management

## Additional Resources

- [Azure VM Documentation](https://docs.microsoft.com/azure/virtual-machines/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Support

If you encounter issues:
1. Check application logs: `docker logs smtp-server`
2. Check system logs: `journalctl -u docker`
3. Verify all environment variables are set correctly
4. Ensure ports are open in Azure NSG

---

**Deployment Complete!** 🎉

Your SMTP server should now be running on Azure VM. Access it at `http://<PUBLIC_IP>:3000/admin`

