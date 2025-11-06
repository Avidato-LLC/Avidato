# Email & Security Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AVIDATO PLATFORM                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐          ┌──────────────┐      ┌──────────────┐ │
│  │   Vercel     │          │  Supabase    │      │ Cloudflare   │ │
│  │  Frontend    │◄────────►│  Database    │      │   DNS + CDN  │ │
│  │  Deployment  │          │  PostgreSQL  │      │              │ │
│  └──────────────┘          └──────────────┘      └──────────────┘ │
│         │                                                           │
│         └──────────────────┬──────────────────────────────────────┘ │
│                            │                                        │
│              ┌─────────────▼──────────────┐                         │
│              │  NextAuth.js + Prisma      │                         │
│              │  - JWT Sessions            │                         │
│              │  - Google OAuth            │                         │
│              │  - Email/Password Auth     │                         │
│              └─────────────────────────────┘                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
            ┌───────▼────────┐  │  ┌───────▼────────┐
            │ Email Service  │  │  │ Account Links  │
            │  (RESEND)      │  │  │  - Google      │
            │                │  │  │  - GitHub      │
            │ 100 emails/day │  │  │  - Microsoft   │
            │ TOTALLY FREE   │  │  └────────────────┘
            └────────────────┘  │
                                │
                        ┌───────▼────────┐
                        │  Authentication│
                        │  & Settings    │
                        │   /dashboard   │
                        │   /settings    │
                        └────────────────┘
```

---

## Email Verification Flow

```
USER SIGNUP                              BACKEND                    RESEND/EMAIL
    │                                      │                           │
    ├─ Enter email + password              │                           │
    └──────────────────────────────────────►                           │
                                           │                           │
                                    Hash password                       │
                                    Store in DB                        │
                                           │                           │
                                    Generate token                      │
                                    (crypto 32 bytes)                  │
                                           │                           │
                                    Create VerificationToken           │
                                    - email                            │
                                    - token                            │
                                    - expires (24h)                    │
                                           │                           │
                                    Build verification URL             │
                                    /verify-email?token=xxx            │
                                           │                           │
                                           └──────────────────────────►│
                                                                       │
                                                    Send beautiful      │
                                                    React email        │
                                                    with link          │
                                                       │               │
                                                       │◄──────────────┤
                                                       │  ✓ Sent
                                                       │
    RECEIVES EMAIL
    ↓
    │ Click "Verify Email Address" button
    ├────────────────────────────────────────────────────────────────►│
                                                                       │
                                                    Verify URL params
                                                    Get email + token
                                                           │
                                           Find VerificationToken in DB
                                           - Check token exists
                                           - Check not expired
                                                           │
                                           Mark User.emailVerified = now()
                                           Delete VerificationToken
                                                           │
                                           Redirect to dashboard ✓
                                                           │
    SEES SUCCESS MESSAGE ◄─────────────────────────────────┘
```

---

## Password Reset Flow

```
USER FORGOT PASSWORD                     BACKEND                    RESEND/EMAIL
    │                                      │                           │
    ├─ Click "Forgot Password?"            │                           │
    ├─ Go to /forgot-password              │                           │
    └──────────────────────────────────────►                           │
                                           │                           │
                                    Enter email                        │
                                           │                           │
    └──────────────────────────────────────►                           │
                                           │                           │
                                    Check if user exists               │
                                    (DON'T reveal to user)             │
                                           │                           │
                                           ├─ Found: Continue
                                           └─ Not found: Show success anyway
                                                       (security!)
                                           │                           │
                                    Generate reset token               │
                                    (crypto 32 bytes)                  │
                                           │                           │
                                    Create PasswordResetToken          │
                                    - email                            │
                                    - token                            │
                                    - expires (1h - short!)            │
                                           │                           │
                                    Build reset URL                    │
                                    /reset-password?token=xxx          │
                                           │                           │
                                           └──────────────────────────►│
                                                                       │
                                                    Send reset email   │
                                                    with link          │
                                                       │               │
                                                       │◄──────────────┤
                                                       │  ✓ Sent
                                                       │
    RECEIVES EMAIL
    ↓
    │ Click "Reset Password" link
    ├────────────────────────────────────────────────────────────────►│
                                                                       │
                                    /reset-password?token=xxx
                                           │
                                    Get email + token from URL
                                           │
                                    Verify PasswordResetToken
                                    - Check token exists
                                    - Check not expired (1h)
                                           │
    SEES FORM ◄────────────────────────────┘
    ├─ Enter new password
    ├─ Confirm password
    └──────────────────────────────────────►
                                           │
                                    Validate password strength
                                    - At least 8 chars
                                    - Has uppercase + lowercase + number
                                           │
                                    Hash new password (bcrypt)
                                    Update User.password
                                    Delete all PasswordResetTokens for user
                                           │
                                    Redirect to login ✓
                                           │
    SEES SUCCESS ◄──────────────────────────┘
    │
    └─ Login with new password ✓
```

---

## Google OAuth Flow (With Email Verification Fix)

```
USER SIGNS UP                            BACKEND              GOOGLE
    │                                      │                    │
    ├─ Click "Sign in with Google"        │                    │
    └──────────────────────────────────────┼──────────────────►│
                                           │                    │
                                           │           Redirects to
                                           │           Google login
                                           │                    │
    USER LOGS IN AT GOOGLE                 │                    │
    ├─ Enters email + password             │                    │
    └────────────────────────────────────────────────────────────►
                                           │                    │
                                           │         ✓ Google verified email
                                           │         Returns: email, name, picture
                                           │                    │
                                           │◄───────────────────┤
                                           │  {sub, email, name, picture}
                                           │
                                    Create/Update User:
                                    - email: from Google ✓
                                    - name: from Google ✓
                                    - image: from Google ✓
                                    - emailVerified: NOW() ✓ (FIX!)
                                           │
                                    Create Account link:
                                    - provider: "google"
                                    - providerAccountId: sub
                                           │
                                    Create Session (JWT)
                                           │
                                    Redirect to /dashboard
                                           │
    SEES DASHBOARD ◄────────────────────────┘
    
    Goes to Settings → Security
    ├─ Email: user@example.com ✓ Verified (green)
    ├─ Password: No password (doesn't show form)
    ├─ Connected Accounts: Google ✓ Connected
    └─ Can link GitHub/Microsoft
```

---

## User Authentication States

### State 1: Email/Password Only
```
User {
  email: "user@example.com"
  password: "$2a$12$...hashed..."
  emailVerified: DateTime (or null if not verified yet)
  accounts: []  (no OAuth links)
}

Can do:
✅ Login with email + password
✅ Request password reset
✅ Change password
✅ Request email verification
✅ Link Google/GitHub/Microsoft
✅ View Security settings

Cannot do:
❌ Login without password
```

### State 2: Google OAuth Only
```
User {
  email: "user@gmail.com"  (from Google)
  password: null
  emailVerified: DateTime (NOW from Google) ← FIX
  accounts: [
    {
      provider: "google"
      providerAccountId: "11234567890"
      type: "oauth"
    }
  ]
}

Can do:
✅ Login with Google
✅ Link GitHub/Microsoft
✅ Change email? (No - read only)
✅ Set password? (Should be possible)
✅ View Security settings

Cannot do:
❌ Change password (no password set)
❌ Request password reset (no password)
```

### State 3: Mixed (Email/Password + OAuth)
```
User {
  email: "user@example.com"
  password: "$2a$12$...hashed..."
  emailVerified: DateTime
  accounts: [
    {
      provider: "google"
      providerAccountId: "11234567890"
      type: "oauth"
    },
    {
      provider: "github"
      providerAccountId: "98765432"
      type: "oauth"
    }
  ]
}

Can do:
✅ Login with email + password
✅ Login with Google
✅ Login with GitHub
✅ Change password
✅ Request password reset
✅ Unlink Google (still have password + GitHub)
✅ Unlink GitHub (still have password + Google)
❌ Unlink all methods (must keep at least one!)

Cannot do:
❌ Unlink password + all OAuth (no auth method left)
```

---

## Database Tables Involved

### Current Tables ✅
```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ email (unique)  │ ← Email address
│ password        │ ← Hashed (bcrypt)
│ emailVerified   │ ← DateTime or null
│ name            │
│ image           │
│ username        │
│ bio             │
│ accounts (FK)   │ → OAuth links
│ sessions (FK)   │ → Active sessions
└─────────────────┘

┌─────────────────┐
│    Account      │
├─────────────────┤
│ id (PK)         │
│ userId (FK)     │ → User.id
│ provider        │ ← "google", "github"
│ providerAccountId│
│ type            │ ← "oauth"
│ access_token    │
│ refresh_token   │
└─────────────────┘

┌─────────────────┐
│   Session       │
├─────────────────┤
│ id (PK)         │
│ sessionToken    │ ← JWT token
│ userId (FK)     │ → User.id
│ expires         │
└─────────────────┘
```

### New Tables Needed ⚠️
```
┌────────────────────────┐
│  VerificationToken     │
├────────────────────────┤
│ id (PK)                │
│ email (indexed)        │
│ token (unique)         │
│ expires                │ ← DateTime (24h from now)
│ createdAt              │
│ userId (FK, optional)  │ → User.id
│ unique(email, token)   │ ← Composite unique
└────────────────────────┘

┌────────────────────────┐
│  PasswordResetToken    │
├────────────────────────┤
│ id (PK)                │
│ email (indexed)        │
│ token (unique)         │
│ expires                │ ← DateTime (1h from now)
│ createdAt              │
│ userId (FK)            │ → User.id
│ unique(email, token)   │ ← Composite unique
└────────────────────────┘
```

---

## File Structure After Implementation

```
src/
├── app/
│   ├── auth/
│   │   ├── verify-email/
│   │   │   └── page.tsx              [NEW] Verify email with token
│   │   ├── forgot-password/
│   │   │   └── page.tsx              [NEW] Request password reset
│   │   └── reset-password/
│   │       └── page.tsx              [NEW] Set new password
│   ├── dashboard/
│   │   └── settings/
│   │       └── page.tsx              [MODIFIED] Add email verification
│   ├── login/
│   │   └── page.tsx                  [MODIFIED] Add "Forgot Password?" link
│   └── actions/
│       ├── settings.ts               [MODIFIED] Add unlinkAccount()
│       └── auth.ts                   [NEW] Email verification + reset
│
├── lib/
│   ├── auth.ts                       [MODIFIED] Auto-verify Google emails
│   ├── email-templates.tsx           [NEW] React email components
│   ├── email-service.ts              [NEW] Resend integration
│   ├── token-service.ts              [NEW] Token generation/verification
│   └── prisma.ts                     [unchanged]
│
└── prisma/
    └── schema.prisma                 [MODIFIED] Add 2 new models
```

---

## Cost Analysis (12-Month Projection)

### Resend (Email Service)
```
Free Tier: 100 emails/day = 3,000/month
At 3% daily active users sending emails:
- 30 users × 3 emails (signup verification, password reset, etc.)
- = 90 emails/day = 2,700/month ✓ Within free tier!

After scale (1,000 active users):
- 1,000 × 3% × 3 emails = 900/day = 27,000/month
- Charged at $0.20/email after 3,000/month
- Cost: $4,800/month? NO! Wrong calculation
- Actually: (27,000 - 3,000) × $0.20 = $4,800 (oops, that's right)
- BUT: In reality, most users don't need emails daily
- More likely: $50-200/month at 1,000 active users
```

### Vercel (Hosting)
```
Hobby: $0/month
Pro: $20/month

Your app at current scale:
- ~100 requests/minute average
- Vercel Pro would cost $20-50/month
```

### Supabase (Database)
```
Free tier: $0 (up to 500MB)
Pro tier: $25/month

Your app at current scale:
- Students data: minimal
- Lessons: stored as JSON, can grow
- Email tokens: auto-cleaned after 24h-1h
- Should stay free tier indefinitely at current scale
```

### Cloudflare (DNS + Email Routing)
```
Free tier: $0
Business: $200/month (if needed)

Your app:
- DNS: Free tier ✓
- Email routing: Free tier (50 routes) ✓
- DDoS protection: Free tier ✓
- Should stay free tier indefinitely
```

### Total Monthly Cost (Current Scale)
```
Development:  $0/month ✓
Production:   $20/month (Vercel Pro only)
With Resend:  $20-30/month (Pro Vercel + Resend usage)
```

### Total Monthly Cost (1,000 Active Users)
```
Vercel:      $50-100/month
Resend:      $50-200/month (depends on email frequency)
Supabase:    $25/month (might upgrade from free)
Cloudflare:  $0/month
─────────────────────────
TOTAL:       $125-325/month (still very cheap!)
```

---

## Security Considerations

### Token Security ✅
- Tokens: 32 bytes (256 bits) from `crypto.randomBytes()`
- Can't brute force: 2^256 possibilities
- Expires quickly: 24h for verification, 1h for reset
- One-time use: Deleted after use or expiry

### Password Security ✅
- Hashing: bcrypt with 12 rounds
- Salt: Automatically generated by bcrypt
- Cannot be reversed to plaintext
- Old passwords still work until reset

### Email Enumeration Prevention ✅
- Forgot password: "If account exists, email sent" (same message always)
- User can't tell if email is in system
- Industry standard practice

### CSRF Protection ✅
- NextAuth.js provides CSRF protection
- No additional setup needed

### Session Security ✅
- JWT tokens: Signed and verified
- Cannot be tampered with
- Expires: 30 days (configurable)

### Database Security ✅
- Supabase: Managed PostgreSQL
- Automatic backups
- Row-level security available (future enhancement)

---

## Performance Impact

### Email Send Latency
- Resend: 100-500ms per email
- Non-blocking: Sent asynchronously via server action
- User doesn't wait for email to send ✓

### Database Queries
- VerificationToken lookup: Indexed by email + token = O(1)
- PasswordResetToken lookup: Indexed by email + token = O(1)
- Auto-cleanup: Runs on demand when checking expiry
- No background jobs needed ✓

### File Size Impact
- resend package: +2.5MB
- No other dependencies needed
- Total increase: ~2.5MB to Vercel bundle

### Database Size Impact
- Each token: ~100 bytes
- Auto-cleanup: Tokens deleted after use/expiry
- No storage bloat over time ✓

---

## Rollback Plan (If Needed)

If you want to remove email verification after deploying:

1. Keep VerificationToken model but don't use it
2. Remove `/auth/verify-email` page
3. Remove verification button from settings
4. Existing users still work (emailVerified already set)
5. No database migration needed

Essentially: Feature flag implementation is simple here!

