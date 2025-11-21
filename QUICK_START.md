# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
ENCRYPTION_KEY=
```

**Generate Encryption Key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `ENCRYPTION_KEY` in `.env`

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Start Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 5. Open Admin Dashboard
```
http://localhost:3000/admin
```

## 📝 Quick Setup Steps

### Step 1: Add SMTP Account
1. Go to **SMTP Configs** tab
2. Click **+ Add SMTP Config**
3. Select provider (Gmail, SendGrid, etc.) or Custom
4. Fill in SMTP details
5. Click **Test Connection**
6. Click **Save**

### Step 2: Create Landing Page
1. Go to **Landing Pages** tab
2. Click **+ Add Landing Page**
3. Enter name and identifier (e.g., "product-page-1")
4. Click **Save**

### Step 3: Configure Landing Page
1. Click **Configure** on your landing page
2. Select SMTP config
3. Set "From" email and name
4. Set recipient email (where inquiries go)
5. Click **Save Configuration**

### Step 4: Test
Send a POST request to `/api/send-inquiry`:

```javascript
fetch('http://localhost:3000/api/send-inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    landingPageId: 'product-page-1',
    formData: {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello!'
    }
  })
})
```

## 🎯 What You Get

✅ **Multiple SMTP Accounts** - Manage unlimited SMTP configs
✅ **Dynamic Routing** - Each landing page uses different SMTP
✅ **Custom "From" Fields** - Set per landing page
✅ **Admin Dashboard** - Beautiful web interface
✅ **Email Logs** - Track all sent emails
✅ **SMTP Testing** - Test connections before using

## 📚 Full Documentation

- **README.md** - Complete documentation
- **SETUP.md** - Detailed setup instructions
- **SMTP_SERVER_ARCHITECTURE.md** - Architecture overview
- **example-integration.html** - Example landing page integration

## 🆘 Troubleshooting

**Server won't start?**
- Check if port 3000 is available
- Verify `.env` file exists
- Run `npm install` again

**Database errors?**
- Run `npm run init-db`
- Check `.env` database settings

**SMTP connection fails?**
- Verify credentials are correct
- For Gmail: Use App Password, not regular password
- Check firewall settings

## 🔐 Gmail Quick Setup

1. Enable 2-Step Verification on Google Account
2. Generate App Password (Google Account → Security → App Passwords)
3. Use these settings:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Secure: Unchecked (TLS)
   - Username: Your Gmail address
   - Password: App Password (16 characters)

## 🎉 You're All Set!

Your dynamic SMTP server is ready to use. Start managing your SMTP accounts and landing pages from the admin dashboard!

