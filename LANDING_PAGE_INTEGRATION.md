# Landing Page Integration Guide

This guide explains how to integrate the Dynamic SMTP Server with any external landing page or website.

## Quick Start

### 1. Basic HTML Form Integration

Add this JavaScript code to your landing page form:

```html
<script>
const API_URL = 'https://your-smtp-server.com/api/send-inquiry'; // Your server URL
const LANDING_PAGE_ID = 'your-landing-page-identifier'; // From admin dashboard

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        message: document.getElementById('message').value.trim(),
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                landingPageId: LANDING_PAGE_ID,
                formData: formData,
            }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Message sent successfully!');
            // Reset form or redirect
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send message. Please try again.');
    }
});
</script>
```

### 2. Setup Steps

1. **Create Landing Page in Admin Dashboard**
   - Go to `http://your-server.com/admin`
   - Navigate to "Landing Pages" tab
   - Click "+ Add Landing Page"
   - Enter a name and unique identifier (e.g., `my-website-contact`)
   - Click "Save"

2. **Configure Landing Page**
   - Click "Configure" on your landing page
   - Select an SMTP configuration
   - Fill in:
     - **From Email:** The email address that will send emails
     - **From Name:** Display name (e.g., "Contact Form")
     - **To Email:** Where inquiries will be sent
     - **Reply-To:** Email for replies (optional)
     - **Subject Template:** Email subject (can use `{{landingPageName}}`)
   - Click "Save Configuration"

3. **Update Your Form**
   - Set `API_URL` to your SMTP server URL
   - Set `LANDING_PAGE_ID` to match the identifier you created

## API Endpoint

**Endpoint:** `POST /api/send-inquiry`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "landingPageId": "your-landing-page-identifier",
  "formData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "Hello, I'm interested in..."
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Inquiry email sent successfully",
  "messageId": "<message-id>"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Only present for validation errors
}
```

## Common Issues & Solutions

### CORS Errors

If you see CORS errors in the browser console:

1. **Check Server CORS Configuration**
   - The server is configured to allow all origins (`*`)
   - If still having issues, verify the server is running

2. **Test from a Web Server**
   - Don't test from `file://` protocol
   - Use a local server (e.g., `http://localhost:8000`) or deploy to a real domain

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Check the Network tab for failed requests
   - Look for error messages in the Console tab

### "Landing page not found" Error

1. **Verify Landing Page ID**
   - Check that `LANDING_PAGE_ID` matches exactly (case-sensitive)
   - Go to admin dashboard and verify the identifier

2. **Check Landing Page Status**
   - Ensure the landing page is marked as "Active"
   - Make sure it's configured with SMTP settings

### Email Not Received

1. **Check SMTP Configuration**
   - Verify SMTP settings are correct in admin dashboard
   - Test SMTP connection using "Test" button

2. **Check Spam Folder**
   - Emails might be filtered as spam

3. **Check Email Logs**
   - Go to admin dashboard → "Email Logs"
   - Check if email was sent successfully
   - Look for error messages

### Form Submission Fails Silently

1. **Enable Error Logging**
   ```javascript
   try {
       const response = await fetch(API_URL, {...});
       const data = await response.json();
       console.log('Response:', data);
   } catch (error) {
       console.error('Error details:', error);
   }
   ```

2. **Check Network Tab**
   - Open Developer Tools → Network tab
   - Submit the form
   - Check if request is sent
   - Look at response status and body

## Framework-Specific Examples

### React

```jsx
import { useState } from 'react';

const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      message: e.target.message.value,
    };

    try {
      const response = await fetch('https://your-server.com/api/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landingPageId: 'your-landing-page-id',
          formData: formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Message sent successfully!');
        e.target.reset();
      } else {
        setMessage('Error: ' + data.message);
      }
    } catch (error) {
      setMessage('Failed to send message. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required placeholder="Name" />
      <input name="email" type="email" required placeholder="Email" />
      <input name="phone" placeholder="Phone" />
      <textarea name="message" required placeholder="Message" />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};
```

### Vue.js

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="form.name" required placeholder="Name" />
    <input v-model="form.email" type="email" required placeholder="Email" />
    <input v-model="form.phone" placeholder="Phone" />
    <textarea v-model="form.message" required placeholder="Message" />
    <button type="submit" :disabled="loading">
      {{ loading ? 'Sending...' : 'Send' }}
    </button>
    <p v-if="message">{{ message }}</p>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        message: '',
      },
      loading: false,
      message: '',
    };
  },
  methods: {
    async submitForm() {
      this.loading = true;
      this.message = '';

      try {
        const response = await fetch('https://your-server.com/api/send-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            landingPageId: 'your-landing-page-id',
            formData: this.form,
          }),
        });

        const data = await response.json();

        if (data.success) {
          this.message = 'Message sent successfully!';
          this.form = { name: '', email: '', phone: '', message: '' };
        } else {
          this.message = 'Error: ' + data.message;
        }
      } catch (error) {
        this.message = 'Failed to send message. Please try again.';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
```

### WordPress

Add this to your theme's `functions.php`:

```php
function submit_contact_form() {
    check_ajax_referer('contact_form_nonce', 'nonce');
    
    $form_data = array(
        'name' => sanitize_text_field($_POST['name']),
        'email' => sanitize_email($_POST['email']),
        'phone' => sanitize_text_field($_POST['phone']),
        'message' => sanitize_textarea_field($_POST['message']),
    );
    
    $response = wp_remote_post('https://your-server.com/api/send-inquiry', array(
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode(array(
            'landingPageId' => 'your-landing-page-id',
            'formData' => $form_data,
        )),
    ));
    
    if (is_wp_error($response)) {
        wp_send_json_error('Failed to send message');
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    wp_send_json($body);
}
add_action('wp_ajax_contact_form', 'submit_contact_form');
add_action('wp_ajax_nopriv_contact_form', 'submit_contact_form');
```

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent spam
2. **CAPTCHA**: Add reCAPTCHA or similar bot protection
3. **Input Validation**: Always validate and sanitize input on both client and server
4. **HTTPS**: Always use HTTPS in production
5. **Error Messages**: Don't expose sensitive error details to clients

## Testing Checklist

- [ ] Landing page created in admin dashboard
- [ ] Landing page configured with SMTP settings
- [ ] `LANDING_PAGE_ID` matches exactly
- [ ] `API_URL` points to correct server
- [ ] Form submission works without errors
- [ ] Success message displays correctly
- [ ] Email received at configured "To Email"
- [ ] Email shows correct "From" name and email
- [ ] Reply-to email works correctly
- [ ] Error handling works (test with invalid data)

## Need Help?

- Check the admin dashboard email logs for detailed error messages
- Review server logs for backend errors
- Use browser Developer Tools to debug network requests
- Verify all configuration steps were completed correctly

