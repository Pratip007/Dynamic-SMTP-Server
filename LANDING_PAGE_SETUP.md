# Example Landing Page Setup Guide

## Overview

This is a complete example landing page that demonstrates how to integrate with your Dynamic SMTP Server.

## Files

- **example-landing-page.html** - Complete standalone landing page with contact form

## Quick Setup

### Step 1: Update Configuration

Open `example-landing-page.html` and update these two values in the JavaScript section:

```javascript
// Change these values:
const API_URL = 'http://localhost:3000/api/send-inquiry';  // Your SMTP server URL
const LANDING_PAGE_ID = 'example-landing-page';  // Your landing page identifier
```

### Step 2: Create Landing Page in Admin Dashboard

1. Open your admin dashboard: `http://localhost:4200` (Angular) or `http://localhost:3000/admin` (HTML)
2. Go to **Landing Pages** tab
3. Click **+ Add Landing Page**
4. Enter:
   - **Name:** Example Landing Page
   - **Identifier:** `example-landing-page` (must match `LANDING_PAGE_ID` in HTML)
5. Click **Save**

### Step 3: Configure Landing Page

1. Find your landing page in the list
2. Click **Configure**
3. Select an SMTP config (create one if needed)
4. Set **From Email:** sales@yourcompany.com
5. Set **From Name:** Sales Team
6. Set **To Email:** inquiries@yourcompany.com (where inquiries will be sent)
7. Optionally set **Reply-To** and **Subject Template**
8. Click **Save Configuration**

### Step 4: Test the Landing Page

1. Make sure your SMTP server is running:
   ```bash
   npm start
   ```

2. Open `example-landing-page.html` in your browser:
   - Double-click the file, or
   - Serve it via a local server

3. Fill out the form and submit

4. Check the email at the **To Email** address you configured

## Integration Code

Here's the minimal code needed to integrate with your SMTP server:

### HTML Form

```html
<form id="contactForm">
    <input type="text" id="name" name="name" required>
    <input type="email" id="email" name="email" required>
    <textarea id="message" name="message" required></textarea>
    <button type="submit">Send</button>
</form>
```

### JavaScript

```javascript
const API_URL = 'http://localhost:3000/api/send-inquiry';
const LANDING_PAGE_ID = 'your-landing-page-id';

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                landingPageId: LANDING_PAGE_ID,
                formData: formData,
            }),
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Message sent successfully!');
            // Reset form or show success message
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send message');
    }
});
```

## API Request Format

```json
POST /api/send-inquiry
Content-Type: application/json

{
  "landingPageId": "example-landing-page",
  "formData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "I'm interested in your product..."
  }
}
```

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Inquiry email sent successfully",
  "messageId": "abc123@mail.gmail.com"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Landing page not found or not configured"
}
```

## Customization

### Styling

The example landing page uses inline CSS for easy customization. You can:
- Change colors in the `<style>` section
- Modify the gradient background
- Adjust spacing and typography
- Add your logo or branding

### Form Fields

Add or remove fields as needed:
- Company name
- Subject/Title
- Preferred contact method
- Additional fields

Just make sure to include them in the `formData` object when submitting.

### Error Handling

The example includes basic error handling. You can enhance it with:
- Field validation
- Better error messages
- Retry logic
- Analytics tracking

## Testing Checklist

- [ ] SMTP server is running
- [ ] Landing page is created in admin dashboard
- [ ] Landing page is configured with SMTP settings
- [ ] `LANDING_PAGE_ID` matches the identifier in dashboard
- [ ] `API_URL` points to your SMTP server
- [ ] Form submission works
- [ ] Email is received at configured "To Email"
- [ ] Email shows correct "From" name and email

## Troubleshooting

### Form doesn't submit

- Check browser console for errors
- Verify `API_URL` is correct
- Make sure SMTP server is running

### "Landing page not found" error

- Verify `LANDING_PAGE_ID` matches exactly (case-sensitive)
- Check that landing page exists in admin dashboard
- Ensure landing page is configured with SMTP settings

### Email not received

- Check SMTP server logs
- Verify SMTP configuration is correct
- Check spam folder
- Test SMTP connection in admin dashboard

### CORS errors

- Make sure CORS is enabled in your SMTP server
- If testing from `file://` protocol, use a local server instead

## Production Deployment

When deploying to production:

1. **Update API URL:**
   ```javascript
   const API_URL = 'https://your-domain.com/api/send-inquiry';
   ```

2. **Enable HTTPS** - Always use HTTPS in production

3. **Add Rate Limiting** - Prevent spam/abuse

4. **Add CAPTCHA** - Protect against bots

5. **Validate Input** - Sanitize all user input

6. **Add Analytics** - Track form submissions

## Example Variations

### React Component

```jsx
const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landingPageId: 'example-landing-page',
          formData: {
            name: e.target.name.value,
            email: e.target.email.value,
            message: e.target.message.value,
          },
        }),
      });
      
      const data = await response.json();
      setMessage(data.success ? 'Success!' : data.message);
    } catch (error) {
      setMessage('Error sending message');
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Vue.js Component

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="form.name" required>
    <input v-model="form.email" type="email" required>
    <textarea v-model="form.message" required></textarea>
    <button :disabled="loading">{{ loading ? 'Sending...' : 'Send' }}</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      form: { name: '', email: '', message: '' }
    };
  },
  methods: {
    async submitForm() {
      this.loading = true;
      try {
        const res = await fetch('http://localhost:3000/api/send-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            landingPageId: 'example-landing-page',
            formData: this.form
          })
        });
        const data = await res.json();
        alert(data.success ? 'Success!' : data.message);
      } catch (error) {
        alert('Error');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## Next Steps

1. Customize the design to match your brand
2. Add validation for form fields
3. Integrate with your existing website
4. Set up multiple landing pages for different purposes
5. Configure email templates for different types of inquiries

