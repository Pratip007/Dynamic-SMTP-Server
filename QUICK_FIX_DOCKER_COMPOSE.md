# Quick Fixes for Common Issues

## Issue 1: Permission Denied Error

If you see `-bash: ./deploy.sh: Permission denied`, make the script executable:

```bash
chmod +x deploy.sh
chmod +x install-docker-compose.sh
```

Then try again:
```bash
./deploy.sh
```

## Issue 2: Docker Permission Denied

If you see `permission denied while trying to connect to the Docker daemon socket`, fix it with:

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Apply the changes (choose one method):
# Method 1: Logout and login again (recommended)
exit
# Then SSH back into the VM

# Method 2: Apply without logout (alternative)
newgrp docker
```

Then verify it works:
```bash
docker ps
```

If it works, try deployment again:
```bash
./deploy.sh
```

## Issue 3: Docker Compose Not Installed

If you see the error "Docker Compose is not installed", follow these steps:

## Option 1: Install Docker Compose Plugin (Recommended)

```bash
sudo apt-get update
sudo apt-get install -y docker-compose-plugin
```

Then verify:
```bash
docker compose version
```

## Option 2: Use the Installation Script

```bash
chmod +x install-docker-compose.sh
./install-docker-compose.sh
```

## Option 3: Install Standalone Version

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

## After Installation

**If you installed the plugin version** (Option 1 or 2):
- Use: `docker compose` (with space)
- Example: `docker compose up -d`

**If you installed standalone version** (Option 3):
- Use: `docker-compose` (with hyphen)
- Example: `docker-compose up -d`

## Then Deploy Again

After installing Docker Compose, run the deployment script again:

```bash
./deploy.sh
```

Or manually:

```bash
mkdir -p data
docker compose up -d
# OR if using standalone: docker-compose up -d
```

