# Detailed Data Flow Diagrams (DFD)

## DFD Level 0 (Context Diagram)

```
                    ┌─────────────┐
                    │   Landing   │
                    │    Pages    │
                    │  (Multiple) │
                    └──────┬──────┘
                           │
                           │ Form Submissions
                           │
                    ┌──────▼──────────────────────┐
                    │                             │
                    │   Dynamic SMTP Server       │
                    │   (Central Hub)             │
                    │                             │
                    └──────┬──────────────────────┘
                           │
                    ┌──────▼──────┐
                    │             │
                    │   SMTP      │
                    │  Providers  │
                    │ (Gmail/SES) │
                    │             │
                    └─────────────┘

         ┌──────────┐     │     ┌──────────┐
         │  Admin   │─────┘─────│Database  │
         │Dashboard │           │ (Config) │
         └──────────┘           └──────────┘
```

---

## DFD Level 1 (Main Processes)

```
┌─────────────────────────────────────────────────────────────────┐
│                      SYSTEM BOUNDARY                             │
│                                                                   │
│  ┌─────────────────┐                                             │
│  │ Landing Page 1  │                                             │
│  └────────┬────────┘                                             │
│           │                                                      │
│  ┌────────▼──────────────────────────────────────────────────┐  │
│  │  Process 1.0: Receive Form Submission                     │  │
│  │  - Validate landing page ID                               │  │
│  │  - Extract form data                                      │  │
│  │  - Authenticate API key (if used)                         │  │
│  └────────┬──────────────────────────────────────────────────┘  │
│           │                                                      │
│  ┌────────▼──────────────────────────────────────────────────┐  │
│  │  Process 2.0: Resolve Configuration                       │  │
│  │  - Query database for landing page                        │  │
│  │  - Get SMTP config ID                                     │  │
│  │  - Get "From" field settings                              │  │
│  └────────┬──────────────────────────────────────────────────┘  │
│           │                                                      │
│  ┌────────▼──────────────────────────────────────────────────┐  │
│  │  Process 3.0: Send Email                                  │  │
│  │  - Load SMTP credentials                                  │  │
│  │  - Build email message                                    │  │
│  │  - Connect to SMTP server                                 │  │
│  │  - Send email                                             │  │
│  │  - Log result                                             │  │
│  └────────┬──────────────────────────────────────────────────┘  │
│           │                                                      │
│  ┌────────▼──────────────────────────────────────────────────┐  │
│  │  Process 4.0: Admin Management                            │  │
│  │  - Manage SMTP configs                                    │  │
│  │  - Manage landing pages                                   │  │
│  │  - Set mappings                                           │  │
│  │  - Test SMTP connections                                  │  │
│  └────────┬──────────────────────────────────────────────────┘  │
│           │                                                      │
└───────────┼──────────────────────────────────────────────────────┘
            │
    ┌───────┴───────┐
    │   Database    │
    │ (Config Store)│
    └───────────────┘
```

---

## DFD Level 2 (Process 3.0 - Email Sending Detail)

```
┌─────────────────────────────────────────────────────────────┐
│           Process 3.0: Send Email (Detail)                   │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  3.1: Load SMTP Configuration                         │  │
│  │  - Query DB for SMTP config                           │  │
│  │  - Decrypt password                                   │  │
│  │  - Validate config                                    │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼───────────────────────────────────────┐  │
│  │  3.2: Build Email Message                             │  │
│  │  - Set "From" field (from config)                     │  │
│  │  - Set "To" field (admin email)                       │  │
│  │  - Set subject                                        │  │
│  │  - Build HTML/text body from form data                │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼───────────────────────────────────────┐  │
│  │  3.3: Connect to SMTP                                 │  │
│  │  - Create SMTP connection                             │  │
│  │  - Authenticate                                       │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼───────────────────────────────────────┐  │
│  │  3.4: Send & Log                                      │  │
│  │  - Send email                                         │  │
│  │  - Record in email_logs table                         │  │
│  │  - Handle errors                                      │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │                                           │
└──────────────────┼───────────────────────────────────────────┘
                   │
           ┌───────┴───────┐
           │  SMTP Server  │
           │   (External)  │
           └───────────────┘
```

---

## Sequence Diagram (Complete Flow)

```
Landing Page    API Server     DB          SMTP Service    SMTP Provider
     │              │           │               │                │
     │  POST /api/  │           │               │                │
     │  send-inquiry│           │               │                │
     ├─────────────>│           │               │                │
     │              │           │               │                │
     │              │  Query:   │               │                │
     │              │  landing  │               │                │
     │              │  page     │               │                │
     │              ├──────────>│               │                │
     │              │           │               │                │
     │              │  Return:  │               │                │
     │              │  config   │               │                │
     │              │<──────────┤               │                │
     │              │           │               │                │
     │              │  Query:   │               │                │
     │              │  SMTP     │               │                │
     │              │  config   │               │                │
     │              ├──────────>│               │                │
     │              │           │               │                │
     │              │  Return:  │               │                │
     │              │  SMTP     │               │                │
     │              │  creds    │               │                │
     │              │<──────────┤               │                │
     │              │           │               │                │
     │              │           │  Build        │                │
     │              │           │  Email        │                │
     │              │           ├──────────────>│                │
     │              │           │               │                │
     │              │           │               │  Connect &     │
     │              │           │               │  Authenticate  │
     │              │           │               ├───────────────>│
     │              │           │               │                │
     │              │           │               │  Send Email    │
     │              │           │               ├───────────────>│
     │              │           │               │                │
     │              │           │               │  Success       │
     │              │           │               │<───────────────┤
     │              │           │               │                │
     │              │  Log      │               │                │
     │              │  result   │               │                │
     │              ├──────────>│               │                │
     │              │           │               │                │
     │  200 OK      │           │               │                │
     │<─────────────┤           │               │                │
     │              │           │               │                │
```

---

## Sequence Diagram (Admin Configuration)

```
Admin Dashboard     API Server      DB          SMTP Service    SMTP Provider
      │                  │           │               │                │
      │  POST /admin/    │           │               │                │
      │  smtp-configs    │           │               │                │
      ├─────────────────>│           │               │                │
      │                  │           │               │                │
      │                  │  Encrypt  │               │                │
      │                  │  password │               │                │
      │                  │           │               │                │
      │                  │  Save to  │               │                │
      │                  │  DB       │               │                │
      │                  ├──────────>│               │                │
      │                  │           │               │                │
      │                  │  Success  │               │                │
      │                  │<──────────┤               │                │
      │                  │           │               │                │
      │  POST /admin/    │           │               │                │
      │  test-connection │           │               │                │
      ├─────────────────>│           │               │                │
      │                  │           │               │                │
      │                  │  Load     │               │                │
      │                  │  config   │               │                │
      │                  ├──────────>│               │                │
      │                  │           │               │                │
      │                  │  Return   │               │                │
      │                  │<──────────┤               │                │
      │                  │           │               │                │
      │                  │           │  Test         │                │
      │                  │           │  Connection   │                │
      │                  │           ├──────────────>│                │
      │                  │           │               │                │
      │                  │           │               │  Authenticate  │
      │                  │           │               ├───────────────>│
      │                  │           │               │                │
      │                  │           │               │  Result        │
      │                  │           │               │<───────────────┤
      │                  │           │               │                │
      │  Test Result     │           │               │                │
      │<─────────────────┤           │               │                │
      │                  │           │               │                │
```

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│   smtp_configs      │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ host                │
│ port                │
│ secure              │
│ username            │
│ password (encrypted)│
│ provider            │
│ is_active           │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
           │
┌──────────▼────────────────────┐
│  landing_page_configs         │
├───────────────────────────────┤
│ id (PK)                       │
│ landing_page_id (FK)          │
│ smtp_config_id (FK)           │
│ from_email                    │
│ from_name                     │
│ reply_to_email                │
│ created_at                    │
│ updated_at                    │
└──────────┬────────────────────┘
           │
           │ N:1
           │
┌──────────▼──────────┐
│   landing_pages     │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ identifier (unique) │
│ is_active           │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│   email_logs        │
├─────────────────────┤
│ id (PK)             │
│ landing_page_id (FK)│
│ smtp_config_id (FK) │
│ recipient           │
│ subject             │
│ status              │
│ error_message       │
│ sent_at             │
└─────────────────────┘
```

---

## Key Points

1. **Centralization**: One server handles all SMTP routing
2. **Dynamic Configuration**: All settings stored in database
3. **Admin Control**: Full control over SMTP and "From" fields via dashboard
4. **Scalability**: Can add unlimited SMTP accounts and landing pages
5. **Flexibility**: Each landing page can use different SMTP with custom "From" field
6. **Reliability**: Optional queue system prevents email loss
7. **Tracking**: Email logs for debugging and monitoring

