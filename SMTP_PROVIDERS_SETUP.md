# SMTP Provider Setup Guide

Your Dynamic SMTP Server needs a working SMTP provider to send emails. The current configuration is timing out because Gmail/regular email providers block cloud server IPs.

## ✅ Recommended: SendGrid (Best for Cloud Deployments)

### Why SendGrid?
- ✅ Free tier: 100 emails/day
- ✅ Works reliably with Render
- ✅ Easy setup
- ✅ No credit card required
- ✅ Designed for transactional emails

### Setup Steps:

1. **Sign Up:**
   - Go to https://sendgrid.com/
   - Click "Start for Free"
   - Complete registration and verify your email

2. **Create API Key:**
   - Log in to SendGrid dashboard
   - Go to **Settings** → **API Keys** (left sidebar)
   - Click **Create API Key**
   - Name: `SMTP-Server-Key`
   - Permission: Select **Full Access**
   - Click **Create & View**
   - ⚠️ **COPY THE KEY NOW** - you won't see it again!

3. **Add to Your Admin Dashboard:**
   - Go to: `https://dynamic-smtp-server.onrender.com/admin`
   - Click **"SMTP Configs"** tab
   - Click **"Add New SMTP Config"**
   - Fill in:
     ```
     Name: SendGrid
     Host: smtp.sendgrid.net
     Port: 587
     Secure: No (uncheck)
     Username: apikey
     Password: [paste your API key from step 2]
     Provider: SendGrid
     Active: Yes (check)
     ```
   - Click **Save**

4. **Verify Sender Email (Required for SendGrid):**
   - In SendGrid dashboard, go to **Settings** → **Sender Authentication**
   - Click **Verify a Single Sender**
   - Fill in your details (use your real email)
   - Check your email and click the verification link
   - **Use this verified email** as the "From" email in your landing page configs

---

## 🔄 Alternative: Brevo (formerly Sendinblue)

### Why Brevo?
- ✅ Free tier: 300 emails/day (more than SendGrid!)
- ✅ Works with Render
- ✅ Easy setup
- ✅ No credit card required

### Setup Steps:

1. **Sign Up:**
   - Go to https://www.brevo.com/
   - Sign up for free account
   - Verify your email

2. **Get SMTP Credentials:**
   - Log in to Brevo dashboard
   - Click on your name (top right) → **SMTP & API**
   - Under **SMTP**, you'll see your credentials
   - Click **Generate a new SMTP key** (or use existing one)
   - Copy the key

3. **Add to Your Admin Dashboard:**
   - Go to: `https://dynamic-smtp-server.onrender.com/admin`
   - Click **"SMTP Configs"** tab
   - Click **"Add New SMTP Config"**
   - Fill in:
     ```
     Name: Brevo
     Host: smtp-relay.brevo.com
     Port: 587
     Secure: No (uncheck)
     Username: [your login email]
     Password: [your SMTP key from step 2]
     Provider: Brevo
     Active: Yes (check)
     ```
   - Click **Save**

---

## ⚠️ Gmail (Not Recommended for Production)

### Why Not Gmail?
- ❌ Often blocked by cloud providers
- ❌ Daily send limits (500-2000/day)
- ❌ May mark emails as spam
- ❌ Requires App Password setup

### If You Still Want to Use Gmail:

1. **Enable 2-Step Verification:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select **Mail** and **Other (Custom name)**
   - Enter "SMTP Server"
   - Click **Generate**
   - Copy the 16-character password (no spaces)

3. **Add to Your Admin Dashboard:**
   - Go to: `https://dynamic-smtp-server.onrender.com/admin`
   - Click **"SMTP Configs"** tab
   - Click **"Add New SMTP Config"**
   - Fill in:
     ```
     Name: Gmail
     Host: smtp.gmail.com
     Port: 587
     Secure: No (uncheck)
     Username: your.email@gmail.com
     Password: [16-character app password]
     Provider: Gmail
     Active: Yes (check)
     ```
   - Click **Save**

---

## 🧪 After Adding SMTP Config

### Create a Landing Page:

1. Go to: `https://dynamic-smtp-server.onrender.com/admin`
2. Click **"Landing Pages"** tab
3. Click **"Add New Landing Page"**
4. Fill in:
   ```
   Landing Page ID: example-landing-page
   Page Name: Test Page
   SMTP Config: [Select the SMTP you just added]
   From Email: [For SendGrid, use your verified email]
   From Name: Your Name
   To Email: [Your email to receive inquiries]
   Subject Template: New Inquiry from {name}
   Status: Active (check)
   ```
5. Click **Save**

### Test in Postman:

**POST** `https://dynamic-smtp-server.onrender.com/api/send-inquiry`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "landingPageId": "example-landing-page",
  "formData": {
    "name": "John Doe",
    "email": "test@example.com",
    "phone": "123-456-7890",
    "message": "This is a test inquiry from Postman"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Inquiry email sent successfully",
  "messageId": "<some-message-id@sendgrid.net>"
}
```

---

## 🚀 Test from Your Landing Page

Once SMTP is working, update your landing page HTML to use your Render URL:

```javascript
const API_URL = 'https://dynamic-smtp-server.onrender.com/api/send-inquiry';
const LANDING_PAGE_ID = 'example-landing-page';
```

Test the form submission from:
- `https://lp-sooth.vercel.app/emergency_dentist.html`

---

## 🔍 Troubleshooting

### SMTP Connection Timeout
- ✅ Use SendGrid or Brevo (most reliable)
- ❌ Avoid Gmail for production

### "Landing page not found"
- Make sure Landing Page ID matches exactly
- Check that landing page is set to "Active"

### "SMTP configuration not found"
- Make sure SMTP config is set to "Active"
- Check that landing page has SMTP config assigned

### Emails Not Arriving
- Check spam/junk folder
- For SendGrid: Verify your sender email
- Check Render logs for errors

---

## 📝 Summary

1. ✅ **Sign up for SendGrid** (recommended) or Brevo
2. ✅ **Get SMTP credentials** (API key or SMTP key)
3. ✅ **Add to admin dashboard** (`/admin` → SMTP Configs)
4. ✅ **Create landing page** with the SMTP config
5. ✅ **Test in Postman**
6. ✅ **Test from your website**

**Current Issue:** Your SMTP is timing out because Gmail/regular providers block Render. Use SendGrid instead!


