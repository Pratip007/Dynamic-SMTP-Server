# SendGrid Quick Setup (5 Minutes)

SendGrid is the easiest and most reliable option for Render deployments.

## Step 1: Sign Up (2 minutes)

1. Go to https://sendgrid.com/
2. Click "Start for Free"
3. Fill in your details
4. Verify your email

## Step 2: Create API Key (1 minute)

1. Log in to SendGrid
2. Go to **Settings** → **API Keys** (left sidebar)
3. Click **"Create API Key"** (blue button)
4. Name: `SMTP-Server`
5. Permission: **Full Access**
6. Click **"Create & View"**
7. **COPY THE KEY NOW** - you won't see it again!
   - It looks like: `SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyy`

## Step 3: Verify Sender Email (1 minute)

1. In SendGrid, go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in your email and details
4. Check your inbox and click the verification link
5. **Remember this email** - you'll use it as "From Email"

## Step 4: Add to Admin Dashboard (1 minute)

1. Go to: `https://dynamic-smtp-server.onrender.com/admin`
2. Click **"SMTP Configs"** tab
3. Click **"Add New SMTP Config"**
4. Fill in **EXACTLY**:
   ```
   Name: SendGrid
   Host: smtp.sendgrid.net
   Port: 587
   Secure: No (UNCHECK)
   Username: apikey
   Password: [paste your API key from Step 2]
   Provider: SendGrid
   Active: Yes (CHECK)
   ```
5. Click **Save**
6. Click **"Test"** to verify it works

## Step 5: Create Landing Page

1. Click **"Landing Pages"** tab
2. Click **"Add New Landing Page"**
3. Fill in:
   ```
   Landing Page ID: example-landing-page
   Page Name: Test Page
   SMTP Config: SendGrid (select from dropdown)
   From Email: [your verified email from Step 3]
   From Name: Your Name
   To Email: [email where you want to receive inquiries]
   Subject Template: New Inquiry from {name}
   Status: Active (CHECK)
   ```
4. Click **Save**

## Step 6: Test in Postman

**POST** `https://dynamic-smtp-server.onrender.com/api/send-inquiry`

**Body (JSON):**
```json
{
  "landingPageId": "example-landing-page",
  "formData": {
    "name": "John Doe",
    "email": "test@example.com",
    "phone": "123-456-7890",
    "message": "Test from Postman"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Inquiry email sent successfully",
  "messageId": "<xxxxxxxxx@sendgrid.net>"
}
```

✅ **Check your inbox!** You should receive the email.

---

## Troubleshooting

### "The from address does not match a verified Sender Identity"
- Go back to SendGrid → Settings → Sender Authentication
- Make sure your email is verified
- Use the exact verified email in "From Email" field

### Still getting timeout errors
- Make sure Port is `587` (not 465)
- Make sure Secure is `No` (unchecked)
- Username must be exactly: `apikey` (not your email)

### "SMTP config not found"
- Make sure the SMTP config is set to "Active"
- Make sure you selected it in the landing page configuration

---

## Why SendGrid Over Mailgun?

✅ No need to authorize recipients (sandbox domain issue)  
✅ Simpler authentication (just API key)  
✅ Better documentation  
✅ More reliable with cloud providers  
✅ Easier troubleshooting  

Free tier: 100 emails/day (perfect for testing and small sites)


