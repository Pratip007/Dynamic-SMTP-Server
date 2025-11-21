# Setup Instructions

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express - Web framework
- sequelize - ORM for database
- sqlite3 - Database (or use PostgreSQL)
- nodemailer - SMTP client
- bcryptjs - Password encryption
- dotenv - Environment variables
- And more...

### 2. Create Environment File

Create a `.env` file in the root directory:

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**Linux/Mac:**
```bash
touch .env
```

Add the following content:

```env
PORT=3000
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
ENCRYPTION_KEY=
```

### 3. Generate Encryption Key

Generate a secure encryption key:

**Windows (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Linux/Mac:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as the `ENCRYPTION_KEY` value in your `.env` file.

Example:
```env
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### 4. Initialize Database

```bash
npm run init-db
```

This will create all necessary database tables.

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

### 6. Access Admin Dashboard

Open your browser and go to:
```
http://localhost:3000/admin
```

## First Steps

### 1. Add Your First SMTP Account

1. In the admin dashboard, click on **SMTP Configs** tab
2. Click **+ Add SMTP Config**
3. Fill in the details:
   - **Name:** Give it a descriptive name (e.g., "My Gmail Account")
   - **Provider:** Select from dropdown (Gmail, SendGrid, etc.) or Custom
   - **Host:** SMTP server host (e.g., smtp.gmail.com)
   - **Port:** SMTP port (usually 587 for TLS, 465 for SSL)
   - **Secure:** Check if using SSL (port 465)
   - **Username/Email:** Your SMTP username
   - **Password:** Your SMTP password
4. Click **Test Connection** to verify it works
5. Click **Save**

### 2. Create a Landing Page

1. Click on **Landing Pages** tab
2. Click **+ Add Landing Page**
3. Fill in:
   - **Name:** Display name (e.g., "Product Page 1")
   - **Identifier:** Unique identifier used in API calls (e.g., "product-page-1")
4. Click **Save**

### 3. Configure Landing Page

1. Find your landing page in the list
2. Click **Configure** button
3. Fill in:
   - **SMTP Config:** Select the SMTP account to use
   - **From Email:** Email address to show as sender (e.g., sales@company.com)
   - **From Name:** Name to show as sender (e.g., "Sales Team")
   - **Reply-To Email:** Optional reply-to address
   - **To Email:** Where inquiries should be sent (e.g., inquiries@company.com)
   - **Subject Template:** Email subject (optional, can use {{landingPageName}})
4. Click **Save Configuration**

### 4. Test Email Sending

You can test by sending a POST request to the API:

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/send-inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "landingPageId": "product-page-1",
    "formData": {
      "name": "Test User",
      "email": "test@example.com",
      "message": "This is a test inquiry"
    }
  }'
```

**Using JavaScript (from your landing page):**
```javascript
fetch('http://localhost:3000/api/send-inquiry', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    landingPageId: 'product-page-1',
    formData: {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'I am interested in your product...',
    },
  }),
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Gmail Setup Example

To use Gmail as your SMTP provider:

1. **Enable 2-Step Verification:**
   - Go to your Google Account → Security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to Google Account → Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password

3. **Add SMTP Config:**
   - Provider: Gmail
   - Host: smtp.gmail.com (auto-filled)
   - Port: 587 (auto-filled)
   - Secure: Unchecked (TLS)
   - Username: Your Gmail address (e.g., yourname@gmail.com)
   - Password: The 16-character app password you generated

4. **Test Connection:**
   - Click "Test Connection" to verify it works

## Production Deployment

### Using PostgreSQL

1. Install PostgreSQL and create a database

2. Update `.env`:
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smtp_server
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

3. Update `config/database.js` to uncomment PostgreSQL configuration

4. Run `npm run init-db` to create tables

### Security Checklist

- [ ] Change default `ENCRYPTION_KEY` to a strong random key
- [ ] Use PostgreSQL instead of SQLite for production
- [ ] Set up HTTPS/SSL
- [ ] Use environment variables for all sensitive data
- [ ] Never commit `.env` file
- [ ] Set up rate limiting
- [ ] Enable CORS only for your domains
- [ ] Set up monitoring and logging
- [ ] Regular backups of database

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Database connection errors
- Check `.env` file exists
- Verify database credentials
- For SQLite: Check file permissions

### SMTP connection fails
- Verify credentials are correct
- Check firewall settings
- For Gmail: Use App Password, not regular password
- Check if your IP is blocked

### Port already in use
Change `PORT` in `.env` file to a different port (e.g., 3001)

### Module not found
Make sure all dependencies are installed:
```bash
npm install
```

