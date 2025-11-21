# Dynamic SMTP Server Architecture

## Overview
A centralized SMTP server that handles email sending for multiple landing pages with dynamically configurable SMTP accounts and "From" field settings managed through an admin dashboard.

---

## System Components

### 1. **API Server** (Node.js/Express or Python/Flask)
   - Receives form submissions from landing pages
   - Validates and processes requests
   - Routes to appropriate SMTP configuration
   - Handles email sending logic

### 2. **Admin Dashboard** (React/Vue or Server-side)
   - Manage SMTP accounts (add/edit/delete)
   - Configure "From" field details per landing page
   - Map landing pages to SMTP configurations
   - View logs and email history
   - Test SMTP connections

### 3. **Database** (PostgreSQL/MySQL/MongoDB)
   - Store SMTP configurations
   - Store landing page mappings
   - Store "From" field configurations
   - Store email logs

### 4. **Email Service Layer**
   - SMTP client (Nodemailer for Node.js or smtplib for Python)
   - Connection pooling
   - Retry logic
   - Queue system (optional, for reliability)

---

## Data Flow Diagram (DFD)

```
┌─────────────────┐
│ Landing Page 1  │
│ (Contact Form)  │
└────────┬────────┘
         │
         │ POST /api/send-email
         │ { landingPageId, formData }
         │
         ▼
┌─────────────────────────────────────────┐
│         API Server                      │
│  ┌──────────────────────────────────┐  │
│  │  Request Handler                 │  │
│  │  - Validate landing page ID      │  │
│  │  - Extract form data             │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │  Configuration Resolver           │  │
│  │  - Query DB for landing page     │  │
│  │  - Get SMTP config ID            │  │
│  │  - Get "From" field settings     │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │  SMTP Service                    │  │
│  │  - Load SMTP credentials         │  │
│  │  - Build email template          │  │
│  │  - Send via SMTP                 │  │
│  └──────────┬───────────────────────┘  │
└─────────────┼───────────────────────────┘
              │
              ▼
         ┌─────────┐
         │   SMTP  │
         │ Provider│
         │  (Gmail │
         │  / SES /│
         │  etc.)  │
         └─────────┘

┌─────────────────────────────────────────┐
│      Admin Dashboard                    │
│  ┌──────────────────────────────────┐  │
│  │  SMTP Management                 │  │
│  │  - Add/Edit SMTP accounts        │  │
│  │  - Test connections              │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────────────┐  │
│  │  Landing Page Mapping            │  │
│  │  - Map page → SMTP config        │  │
│  │  - Set "From" field              │  │
│  └──────────┬───────────────────────┘  │
└─────────────┼───────────────────────────┘
              │
              ▼
         ┌─────────┐
         │Database │
         │(Configs)│
         └─────────┘
```

---

## Database Schema Design

### Table 1: `smtp_configs`
```sql
- id (primary key)
- name (e.g., "Gmail Account 1")
- host (smtp.gmail.com)
- port (587)
- secure (true/false)
- username
- password (encrypted)
- provider (gmail, sendgrid, ses, custom)
- is_active (boolean)
- created_at
- updated_at
```

### Table 2: `landing_pages`
```sql
- id (primary key)
- name (e.g., "Product Page 1")
- identifier (unique slug: "product-page-1")
- is_active (boolean)
- created_at
```

### Table 3: `landing_page_configs`
```sql
- id (primary key)
- landing_page_id (foreign key → landing_pages)
- smtp_config_id (foreign key → smtp_configs)
- from_email (e.g., "sales@company.com")
- from_name (e.g., "Sales Team")
- reply_to_email (optional)
- created_at
- updated_at
```

### Table 4: `email_logs` (Optional, for tracking)
```sql
- id (primary key)
- landing_page_id
- smtp_config_id
- recipient
- subject
- status (sent, failed, pending)
- error_message (if failed)
- sent_at
```

---

## API Endpoints

### Public Endpoints (for landing pages)
```
POST /api/send-inquiry
Body: {
  landingPageId: "product-page-1",
  formData: {
    name: "John Doe",
    email: "john@example.com",
    message: "I'm interested..."
  }
}
```

### Admin Endpoints
```
GET    /admin/smtp-configs          - List all SMTP configs
POST   /admin/smtp-configs          - Create new SMTP config
PUT    /admin/smtp-configs/:id      - Update SMTP config
DELETE /admin/smtp-configs/:id      - Delete SMTP config
POST   /admin/smtp-configs/:id/test - Test SMTP connection

GET    /admin/landing-pages         - List all landing pages
POST   /admin/landing-pages         - Create landing page
PUT    /admin/landing-pages/:id/config - Update landing page config
```

---

## Implementation Steps

### Phase 1: Core Infrastructure
1. Set up API server framework
2. Set up database and create schema
3. Create basic SMTP sending service

### Phase 2: Admin Dashboard
1. Build admin UI for SMTP management
2. Implement CRUD operations for SMTP configs
3. Add SMTP connection testing feature

### Phase 3: Landing Page Integration
1. Create landing page mapping system
2. Implement "From" field configuration
3. Build API endpoint for form submissions

### Phase 4: Email Service
1. Implement dynamic SMTP routing
2. Create email templates
3. Add error handling and retry logic

### Phase 5: Advanced Features
1. Email queue system (Redis/Bull for reliability)
2. Email logging and tracking
3. Rate limiting
4. API authentication/API keys for landing pages

---

## Technology Stack Recommendations

### Backend Options:

**Option 1: Node.js/Express**
- `nodemailer` - SMTP client
- `sequelize` or `prisma` - ORM
- `bull` or `agenda` - Job queue (optional)
- `express-validator` - Request validation

**Option 2: Python/Flask/FastAPI**
- `smtplib` or `aiosmtplib` - SMTP client
- `SQLAlchemy` - ORM
- `celery` - Task queue (optional)
- `pydantic` - Validation

### Frontend (Admin Dashboard):
- React + Material-UI / Ant Design
- Vue + Vuetify
- Or server-side rendered (Next.js, Nuxt)

### Database:
- PostgreSQL (recommended for relational data)
- MySQL
- MongoDB (if you prefer NoSQL)

### Additional Tools:
- Redis (for caching and queue)
- JWT for admin authentication
- API keys for landing page authentication

---

## Security Considerations

1. **Encrypt SMTP passwords** in database (use encryption library)
2. **API Authentication** - Use API keys for landing pages
3. **Rate Limiting** - Prevent abuse
4. **Input Validation** - Sanitize form data
5. **HTTPS** - Always use encrypted connections
6. **CORS** - Configure properly for landing page domains

---

## Example Workflow

1. **Setup Phase:**
   - Admin adds SMTP account (e.g., Gmail) via dashboard
   - Admin creates landing page entry
   - Admin maps landing page to SMTP config
   - Admin sets "From" field: name="Sales", email="sales@company.com"

2. **Runtime Phase:**
   - User fills form on Landing Page 1
   - Form submits to: `POST /api/send-inquiry` with `landingPageId: "lp-1"`
   - API server:
     - Queries database for landing page config
     - Gets associated SMTP config ID
     - Retrieves "From" field settings
     - Loads SMTP credentials
     - Sends email using those credentials with custom "From" field

---

## Next Steps

1. **Choose technology stack** (Node.js vs Python)
2. **Design database schema** in detail
3. **Create API specifications** (detailed request/response formats)
4. **Design admin dashboard UI** (wireframes/mockups)
5. **Plan deployment** (cloud hosting, containerization)

Would you like me to:
- Create detailed API specifications?
- Design the database schema in more detail?
- Create a basic project structure?
- Provide code examples for specific components?

