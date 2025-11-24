# Quick Fix: Install Docker Compose

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

