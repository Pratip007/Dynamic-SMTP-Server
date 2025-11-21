# Quick Reference Guide - Dynamic SMTP Server

## What You're Building

**A centralized email server that:**
- Receives form submissions from multiple landing pages
- Routes emails through different SMTP accounts dynamically
- Allows admin to change SMTP credentials via dashboard
- Allows admin to change "From" field (name & email) per landing page

---

## Core Components (Simplified)

```
┌─────────────────┐
│  Landing Pages  │  →  Form submissions
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Server    │  →  Processes & routes
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────┐  ┌────────┐
│  DB  │  │  SMTP  │
└──────┘  └────────┘

┌─────────────────┐
│ Admin Dashboard │  →  Manage everything
└─────────────────┘
```

---

## What Gets Stored in Database

### 1. SMTP Accounts
- Host, port, username, password
- Provider name (Gmail, SendGrid, etc.)
- Active/inactive status

### 2. Landing Pages
- Name and unique identifier
- Active status

### 3. Mappings
- Which landing page → Which SMTP account
- "From" email address
- "From" name

---

## How It Works (Step by Step)

### Setup Phase (Admin):
1. Add SMTP account → Stored in database
2. Create landing page entry → Stored in database
3. Map landing page to SMTP → Configure "From" field
4. Done! Ready to receive form submissions

### Runtime Phase (User):
1. User fills form on Landing Page 1
2. Form submits to your API: `POST /api/send-inquiry`
3. API looks up: "Landing Page 1" → finds SMTP config → finds "From" field
4. API sends email using that SMTP with custom "From" field
5. Response sent back to landing page

---

## Technology Choices

### Backend Options:

**Node.js (Recommended for beginners)**
- Easy async handling
- Rich ecosystem (Nodemailer for SMTP)
- Good for real-time features

**Python**
- Great for data processing
- Simple syntax
- Flask/FastAPI frameworks

### Database Options:

**PostgreSQL (Recommended)**
- Relational (perfect for this use case)
- Robust and reliable
- Good for structured data

**MySQL**
- Alternative to PostgreSQL
- Widely used
- Good performance

**MongoDB**
- NoSQL option
- Flexible schema
- Good if you prefer document storage

---

## API Endpoints You Need

### Public (for landing pages):
```
POST /api/send-inquiry
- Receives form data
- Routes to appropriate SMTP
```

### Admin (for dashboard):
```
GET    /admin/smtp-configs       - List all SMTP accounts
POST   /admin/smtp-configs       - Add new SMTP account
PUT    /admin/smtp-configs/:id   - Update SMTP account
DELETE /admin/smtp-configs/:id   - Delete SMTP account
POST   /admin/smtp-configs/:id/test - Test connection

GET    /admin/landing-pages      - List all landing pages
POST   /admin/landing-pages      - Create landing page
PUT    /admin/landing-pages/:id/config - Set SMTP mapping & "From" field
```

---

## Security Checklist

- [ ] Encrypt SMTP passwords in database
- [ ] Use API keys for landing page authentication
- [ ] Implement rate limiting
- [ ] Validate all input data
- [ ] Use HTTPS only
- [ ] Implement CORS properly
- [ ] Secure admin dashboard with authentication

---

## Database Tables (Simplified)

### smtp_configs
```
id, name, host, port, username, password(encrypted), is_active
```

### landing_pages
```
id, name, identifier, is_active
```

### landing_page_configs
```
id, landing_page_id, smtp_config_id, from_email, from_name
```

### email_logs (optional)
```
id, landing_page_id, status, sent_at, error_message
```

---

## Development Phases

### Phase 1: Basic Setup
- API server with database
- Basic SMTP sending (hardcoded config first)
- Test email sending works

### Phase 2: Admin Dashboard
- CRUD for SMTP configs
- Test SMTP connections
- Manage landing pages

### Phase 3: Dynamic Routing
- Link landing pages to SMTP configs
- Set "From" field per landing page
- Make API route dynamically

### Phase 4: Polish
- Error handling
- Logging
- Queue system (optional)
- Rate limiting

---

## Example Request Flow

### Request from Landing Page:
```json
POST /api/send-inquiry
{
  "landingPageId": "product-page-1",
  "formData": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I'm interested in..."
  }
}
```

### What Happens:
1. API receives request
2. Queries database: `landingPageId = "product-page-1"`
3. Gets: `smtp_config_id = 2`, `from_email = "sales@company.com"`, `from_name = "Sales Team"`
4. Loads SMTP config ID 2 from database
5. Sends email using SMTP config 2 with "From: Sales Team <sales@company.com>"
6. Returns success response

---

## Key Features

✅ **Multiple SMTP Accounts** - Store unlimited SMTP configs
✅ **Dynamic Routing** - Each landing page can use different SMTP
✅ **Custom "From" Field** - Set per landing page
✅ **Admin Dashboard** - Manage everything easily
✅ **Email Logging** - Track sent emails
✅ **Test Connections** - Verify SMTP works before using

---

## Questions to Consider

1. **How many landing pages?** (affects database design)
2. **How many emails per day?** (affects need for queue system)
3. **Need email templates?** (can add later)
4. **Need email tracking?** (open rates, clicks)
5. **Admin authentication?** (JWT, sessions)
6. **Deployment?** (AWS, Heroku, DigitalOcean)

---

## Next Steps

1. ✅ Choose technology stack (Node.js vs Python)
2. ✅ Design database schema
3. ✅ Create API endpoints
4. ✅ Build admin dashboard
5. ✅ Implement SMTP routing
6. ✅ Add security features
7. ✅ Deploy and test

