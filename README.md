# Dynamic SMTP Server

A centralized SMTP server solution for managing multiple SMTP accounts and routing emails from multiple landing pages dynamically.

## Features

- ✅ **Multiple SMTP Accounts** - Manage unlimited SMTP configurations
- ✅ **Dynamic Routing** - Each landing page can use different SMTP accounts
- ✅ **Custom "From" Fields** - Set custom "From" name and email per landing page
- ✅ **Admin Dashboard** - Beautiful web interface for managing everything
- ✅ **Email Logging** - Track all sent emails with status
- ✅ **SMTP Testing** - Test SMTP connections before using
- ✅ **Secure** - Passwords are encrypted in database
- ✅ **RESTful API** - Easy integration with any landing page

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

Generate a random encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Initialize Database

```bash
npm run init-db
```

### 4. Start Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### 5. Access Admin Dashboard

Open your browser and navigate to:
```
http://localhost:3000/admin
```

## Usage

### Setting Up a Landing Page

1. **Add SMTP Configuration**
   - Go to Admin Dashboard → SMTP Configs
   - Click "+ Add SMTP Config"
   - Fill in SMTP details (Gmail, SendGrid, AWS SES, etc.)
   - Click "Test Connection" to verify
   - Save

2. **Create Landing Page**
   - Go to Admin Dashboard → Landing Pages
   - Click "+ Add Landing Page"
   - Enter name and identifier (e.g., "product-page-1")
   - Save

3. **Configure Landing Page**
   - Click "Configure" on your landing page
   - Select SMTP config to use
   - Set "From" email and name
   - Set recipient email (where inquiries will be sent)
   - Optionally set reply-to and subject template
   - Save

4. **Send Inquiry from Landing Page**

   Use the identifier you created in your form submission:

   ```javascript
   fetch('http://localhost:3000/api/send-inquiry', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       landingPageId: 'product-page-1', // Your landing page identifier
       formData: {
         name: 'John Doe',
         email: 'john@example.com',
         phone: '+1234567890', // optional
         message: 'I am interested in your product...',
       },
     }),
   })
   .then(res => res.json())
   .then(data => {
     console.log('Success:', data);
   })
   .catch(error => {
     console.error('Error:', error);
   });
   ```

## API Endpoints

### Public Endpoints

#### Send Inquiry
```
POST /api/send-inquiry
Content-Type: application/json

{
  "landingPageId": "product-page-1",
  "formData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "Your message here"
  }
}
```

### Admin API Endpoints

#### SMTP Configs
- `GET /admin/api/smtp-configs` - List all SMTP configs
- `GET /admin/api/smtp-configs/:id` - Get single SMTP config
- `POST /admin/api/smtp-configs` - Create SMTP config
- `PUT /admin/api/smtp-configs/:id` - Update SMTP config
- `DELETE /admin/api/smtp-configs/:id` - Delete SMTP config
- `POST /admin/api/smtp-configs/:id/test` - Test SMTP connection

#### Landing Pages
- `GET /admin/api/landing-pages` - List all landing pages
- `POST /admin/api/landing-pages` - Create landing page
- `PUT /admin/api/landing-pages/:id/config` - Configure landing page

#### Email Logs
- `GET /admin/api/email-logs` - Get email logs

## SMTP Providers Setup

### Gmail

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate a password for "Mail"
3. Use these settings:
   - **Host:** smtp.gmail.com
   - **Port:** 587
   - **Secure:** false (TLS)
   - **Username:** Your Gmail address
   - **Password:** The app password you generated

### SendGrid

1. Create a SendGrid account
2. Create an API key with "Mail Send" permissions
3. Use these settings:
   - **Host:** smtp.sendgrid.net
   - **Port:** 587
   - **Secure:** false
   - **Username:** apikey
   - **Password:** Your SendGrid API key

### AWS SES

1. Set up AWS SES and verify your domain/email
2. Create SMTP credentials in AWS SES console
3. Use these settings:
   - **Host:** email-smtp.[region].amazonaws.com (e.g., email-smtp.us-east-1.amazonaws.com)
   - **Port:** 587
   - **Secure:** false
   - **Username:** Your SMTP username from AWS
   - **Password:** Your SMTP password from AWS

## Project Structure

```
dynamic-smtp-server/
├── config/
│   └── database.js          # Database configuration
├── models/
│   ├── SmtpConfig.js        # SMTP configuration model
│   ├── LandingPage.js       # Landing page model
│   ├── LandingPageConfig.js # Landing page configuration model
│   ├── EmailLog.js          # Email log model
│   └── index.js             # Model exports and associations
├── routes/
│   ├── api.js               # Public API routes
│   └── admin.js             # Admin API routes
├── services/
│   └── smtpService.js       # SMTP service logic
├── utils/
│   └── encryption.js        # Password encryption utilities
├── public/
│   └── admin/
│       ├── index.html       # Admin dashboard
│       ├── styles.css       # Dashboard styles
│       └── script.js        # Dashboard JavaScript
├── scripts/
│   └── init-db.js           # Database initialization script
├── server.js                # Main server file
└── package.json             # Dependencies
```

## Security Features

- **Password Encryption** - SMTP passwords are encrypted using AES-256-CBC
- **Input Validation** - All inputs are validated using express-validator
- **CORS** - Cross-Origin Resource Sharing configured
- **SQL Injection Protection** - Using Sequelize ORM

## Production Deployment

### Recommended Setup

1. **Use PostgreSQL** instead of SQLite:
   ```env
   DB_DIALECT=postgres
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_NAME=smtp_server
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   ```

2. **Set Strong Keys:**
   ```env
   ENCRYPTION_KEY=<generate-strong-32-byte-key>
   JWT_SECRET=<generate-random-secret>
   ```

3. **Use Environment Variables** - Never commit `.env` file

4. **Enable HTTPS** - Use reverse proxy (nginx) with SSL certificate

5. **Add Rate Limiting** - Protect against abuse

6. **Set up Monitoring** - Monitor email logs and errors

## Troubleshooting

### SMTP Connection Fails

- Verify SMTP credentials are correct
- Check if your IP is blocked by SMTP provider
- For Gmail, ensure you're using App Password, not regular password
- Check firewall settings

### Emails Not Sending

- Check email logs in admin dashboard
- Verify landing page is configured correctly
- Ensure SMTP config is active
- Check server logs for errors

### Database Errors

- Run `npm run init-db` to recreate tables
- Check database file permissions (for SQLite)
- Verify database connection settings

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

