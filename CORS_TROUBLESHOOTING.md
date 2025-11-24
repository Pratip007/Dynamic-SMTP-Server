# CORS Troubleshooting Guide

## Issue: Cannot send POST requests from external URLs

If you're getting CORS errors when trying to send form submissions from your landing pages, follow these steps:

## Step 1: Verify Your Server is Running

Check that your server is accessible:
```bash
curl https://dynamic-smtp-server.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "SMTP Server is running",
  "database": { "mongodb": "connected" }
}
```

## Step 2: Test the API Endpoint Directly

Test if the API endpoint responds correctly:
```bash
curl -X POST https://dynamic-smtp-server.onrender.com/api/send-inquiry \
  -H "Content-Type: application/json" \
  -H "Origin: https://lp-sooth.vercel.app" \
  -d '{
    "landingPageId": "emergency_dentist",
    "formData": {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "1234567890",
      "message": "Test message"
    }
  }'
```

## Step 3: Verify Landing Page Configuration

### In Your Landing Page Code

Make sure your landing page has:
1. **Correct API URL:**
   ```javascript
   const API_URL = 'https://dynamic-smtp-server.onrender.com/api/send-inquiry';
   ```

2. **Correct Landing Page ID:**
   ```javascript
   const LANDING_PAGE_ID = 'emergency_dentist'; // Must match what's in admin dashboard
   ```

3. **Proper Form Submission:**
   ```javascript
   const response = await fetch(API_URL, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       landingPageId: LANDING_PAGE_ID,
       formData: {
         name: document.getElementById('name').value.trim(),
         email: document.getElementById('email').value.trim(),
         phone: document.getElementById('phone').value.trim(),
         message: document.getElementById('message').value.trim(),
       },
     }),
   });
   ```

## Step 4: Configure Landing Page in Admin Dashboard

1. Go to `https://dynamic-smtp-server.onrender.com/admin`
2. Click on **"Landing Pages"** tab
3. Click **"Add Landing Page"**
4. Fill in:
   - **Name**: Emergency Dentist (or any descriptive name)
   - **Identifier**: `emergency_dentist` (MUST match `LANDING_PAGE_ID` in your HTML)
   - **Is Active**: ✅ Checked

5. Click **"Configure"** on the landing page you just created
6. Fill in:
   - **From Email**: The email address to send FROM (e.g., `noreply@yourdomain.com`)
   - **To Email**: The email address to send TO (e.g., `info@yourdomain.com`)
   - **Reply To Email**: Optional (defaults to form submitter's email)
   - **Subject Template**: Optional (e.g., `New Inquiry from {{landingPageName}}`)
   - **SMTP Config**: Select your active SMTP configuration

7. Click **"Save Configuration"**

## Step 5: Verify SMTP Configuration

1. Go to **"SMTP Configs"** tab in admin dashboard
2. Make sure you have at least one SMTP config marked as **Active**
3. Test the connection if needed

## Step 6: Test CORS from Browser Console

Open your landing page (`https://lp-sooth.vercel.app/emergency_dentist.html`) and open browser console (F12), then run:

```javascript
fetch('https://dynamic-smtp-server.onrender.com/api/send-inquiry', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    landingPageId: 'emergency_dentist',
    formData: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      message: 'Test message'
    }
  })
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Inquiry email sent successfully",
  "messageId": "abc123@mail.gmail.com"
}
```

**Common Errors:**

1. **`"Landing page not found or not active"`**
   - Solution: Make sure the landing page with identifier `emergency_dentist` exists and is active in the admin dashboard

2. **`"Landing page not configured or SMTP config is not active"`**
   - Solution: Click "Configure" on your landing page and set up the email configuration

3. **CORS Error in Browser Console**
   - Solution: The server should allow all origins by default. If you still see CORS errors, check the server logs on Render

## Step 7: Check Server Logs on Render

1. Go to your Render dashboard
2. Click on your service
3. Check the **"Logs"** tab for any errors

Look for:
- MongoDB connection issues
- SMTP authentication errors
- Missing environment variables

## Step 8: Verify Environment Variables on Render

Make sure these are set in Render:
- `MONGODB_URI` - Your MongoDB connection string
- `ENCRYPTION_KEY` - 32-character encryption key for SMTP passwords
- `PORT` - Usually set automatically by Render (defaults to 3000)

## Common Issues and Solutions

### Issue: Form shows "Sending..." forever
- **Cause**: Request is being blocked by CORS or network error
- **Solution**: Check browser console for errors, verify API URL is correct

### Issue: "Failed to fetch" error
- **Cause**: Server is down or URL is incorrect
- **Solution**: Verify server health endpoint responds, check API URL spelling

### Issue: "Validation failed" error
- **Cause**: Missing required fields in form data
- **Solution**: Ensure `landingPageId` and `formData` are included in request body

### Issue: "Landing page not found"
- **Cause**: Landing page identifier doesn't match
- **Solution**: Verify the `LANDING_PAGE_ID` in your HTML matches the identifier in admin dashboard (case-sensitive!)

## Need More Help?

1. Check the browser console for detailed error messages
2. Check Render logs for server-side errors
3. Test with curl to isolate if it's a CORS issue or server issue
4. Verify all configurations in the admin dashboard match your landing page code

