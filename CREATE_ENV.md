# Create .env File

The `.env` file is protected, so you need to create it manually.

## Quick Method (Windows PowerShell)

Run this command in the project root:

```powershell
Copy-Item env.template .env
```

Or manually create `.env` file and copy the contents from `env.template`.

## Quick Method (Linux/Mac)

```bash
cp env.template .env
```

## Manual Method

1. Create a new file named `.env` in the root directory
2. Copy the contents from `env.template` file
3. Save it as `.env`

## What's in the .env file?

- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Environment (development/production)
- **DB_DIALECT**: Database type (sqlite/postgres)
- **DB_STORAGE**: SQLite database file location
- **ENCRYPTION_KEY**: Key for encrypting SMTP passwords (already generated)

## ⚠️ Important

- Never commit `.env` file to version control
- Keep `ENCRYPTION_KEY` secret
- Generate a new `ENCRYPTION_KEY` for production

## Generate New Encryption Key

If you want to generate a new encryption key:

**Windows PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Linux/Mac:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and replace `ENCRYPTION_KEY` value in your `.env` file.

