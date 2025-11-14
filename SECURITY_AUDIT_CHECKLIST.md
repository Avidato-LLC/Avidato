# 🔒 SECURITY AUDIT CHECKLIST - Avidato
**Date:** November 14, 2025  
**Environment:** Production (Vercel) + Supabase PostgreSQL

---

## 1. ⚠️ CRITICAL ISSUES (MUST FIX IMMEDIATELY)

### 🚨 Build Configuration
- [ ] **TURBOPACK IN PRODUCTION** - Currently using `--turbopack` flag in build script
  - **Risk:** Unminified code exposed in browser (confirmed in your screenshot)
  - **Fix:** Remove `--turbopack` from build script in package.json
  - **Action:** Change `"build": "next build --turbopack"` to `"build": "next build"`

### 🔐 Environment Variables Exposure
- [ ] Check `.env` file is in `.gitignore`
- [ ] Verify no `.env` files committed to GitHub
- [ ] Audit all `NEXT_PUBLIC_*` variables - these are exposed to client!
  - `NEXT_PUBLIC_SUPABASE_URL` ✅ (public by design)
  - Verify NO other secrets use `NEXT_PUBLIC_` prefix
- [ ] Check Vercel dashboard environment variables are set correctly

### 🗄️ Database Security
- [ ] **Supabase Row Level Security (RLS)** - VERIFY ALL TABLES HAVE RLS ENABLED
  - User table
  - Student table
  - Lesson table
  - LearningPlan table
  - VocabularyAudio table
  - VerificationToken table
  - PasswordResetToken table
- [ ] Database connection string uses pooling (`?pgbouncer=true`)
- [ ] Service role key only used server-side (NEVER in client code)

---

## 2. 🔑 AUTHENTICATION & SESSION SECURITY

### NextAuth Configuration
- [x] `NEXTAUTH_SECRET` set and strong (minimum 32 characters)
- [x] `NEXTAUTH_URL` set correctly for production domain
- [x] Password hashing uses bcrypt with rounds=12 ✅
- [ ] Session strategy: Verify JWT settings in `auth.ts`
- [ ] Cookie settings secure:
  - `httpOnly: true`
  - `secure: true` in production
  - `sameSite: 'lax'` or 'strict'

### Password Security
- [x] Password minimum length: 8 characters ✅
- [x] Password complexity requirements enforced ✅ (uppercase, lowercase, number)
- [x] Password reset tokens expire (1 hour) ✅
- [x] Old tokens deleted on password change ✅
- [ ] Rate limiting on login attempts (NOT IMPLEMENTED - CRITICAL)
- [ ] Rate limiting on password reset requests (NOT IMPLEMENTED)

### OAuth Security
- [x] Google OAuth client secret properly secured
- [x] OAuth callback URLs whitelisted in Google Console
- [ ] Verify no OAuth tokens logged or exposed

---

## 3. 🌐 API ROUTE SECURITY

### Authentication Middleware
```typescript
// Check EVERY API route has authentication check:
const session = await getServerSession(authOptions);
if (!session) {
  return new Response('Unauthorized', { status: 401 });
}
```

### API Routes Audit
- [ ] `/api/lessons/*` - Requires authentication ✅
- [ ] `/api/students/*` - Requires authentication & ownership check
- [ ] `/api/vocabulary/[word]/audio` - **NEEDS RATE LIMITING** (ElevenLabs API abuse)
- [ ] `/api/auth/signup` - **NEEDS RATE LIMITING** (bot protection)
- [ ] `/api/careers/*` - Check if public or auth required

### Input Validation
- [x] All inputs validated with Zod schemas ✅
- [ ] Check for SQL injection risks (using Prisma = protected ✅)
- [ ] Verify no `eval()` or `Function()` calls
- [ ] Check `dangerouslySetInnerHTML` usage - **FOUND MULTIPLE INSTANCES**
  - `EngooLessonComponents.tsx` - Uses with vocabulary data
  - `Under18LessonDisplay.tsx` - Uses with lesson content
  - **Risk:** XSS if vocabulary contains malicious HTML
  - **Mitigation:** Sanitize with DOMPurify or only allow specific HTML tags

---

## 4. 📦 FILE UPLOAD & STORAGE SECURITY

### Supabase Storage
- [ ] **CRITICAL:** Check bucket policies in Supabase dashboard
  - `vocabulary-audio` bucket should be:
    - Publicly readable (for audio playback)
    - NOT publicly writable
    - Server-side writes only (using service role key)
- [ ] Verify file naming prevents path traversal (e.g., `../../etc/passwd`)
- [ ] Check file size limits to prevent storage abuse
- [ ] Verify MIME type validation on uploads

### ElevenLabs TTS Integration
- [ ] API key stored server-side only ✅
- [ ] **CRITICAL:** No rate limiting on vocabulary audio generation
  - **Risk:** Expensive API abuse
  - **Fix:** Implement rate limiting (e.g., 10 requests per user per minute)
- [ ] Check caching works to prevent duplicate API calls ✅

---

## 5. 🛡️ CROSS-SITE SCRIPTING (XSS) PROTECTION

### Dangerous Code Patterns Found
```typescript
// FOUND IN: EngooLessonComponents.tsx, Under18LessonDisplay.tsx
dangerouslySetInnerHTML={{ __html: vocabulary.definition }}
dangerouslySetInnerHTML={{ __html: e.question.replace(/\*\*(.*?)\*\*/g, ...) }}
```

**ACTION REQUIRED:**
- [ ] Install DOMPurify: `npm install dompurify @types/dompurify`
- [ ] Sanitize ALL `dangerouslySetInnerHTML` content
- [ ] OR: Replace with safe React components that parse markdown

### Content Security Policy (CSP)
- [ ] Add CSP headers in `next.config.ts`:
```typescript
async headers() {
  return [{
    source: '/:path*',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://gtdgvkdlwnkefrvthdhd.supabase.co https://generativelanguage.googleapis.com;"
      }
    ]
  }]
}
```

---

## 6. 🔒 SECURITY HEADERS

### Required Headers (Add to next.config.ts)
- [ ] `X-Frame-Options: DENY` (prevent clickjacking)
- [ ] `X-Content-Type-Options: nosniff` (prevent MIME sniffing)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` (restrict camera, microphone, etc.)
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### CORS Configuration
- [ ] Verify API routes don't have overly permissive CORS
- [ ] Check credentials handling in fetch requests

---

## 7. 📚 DEPENDENCIES & PACKAGES

### NPM Audit
```bash
npm audit
npm audit fix
```

- [ ] Run `npm audit` and review vulnerabilities
- [ ] Check for outdated packages with known CVEs:
  - `next-auth` (current version) - Check if newer version addresses security issues
  - `@google/generative-ai` - Verify latest version
  - `@supabase/supabase-js` - Verify latest version

### Package Integrity
- [ ] Verify `package-lock.json` is committed
- [ ] Check for suspicious package dependencies
- [ ] Review `postinstall` scripts in dependencies

---

## 8. 🌍 PRODUCTION BUILD CONFIGURATION

### next.config.ts Security
- [ ] Remove `ignoreBuildErrors: true` (FOUND - RISKY!)
  - **Risk:** TypeScript errors might hide security issues
  - **Fix:** Fix all TypeScript errors, remove this flag
- [ ] Disable source maps in production:
```typescript
productionBrowserSourceMaps: false
```
- [ ] Enable React strict mode:
```typescript
reactStrictMode: true
```
- [ ] Add security headers (see section 6)

### Webpack/Build Configuration
- [ ] Ensure minification enabled (remove --turbopack flag)
- [ ] Verify tree-shaking works (remove unused code)
- [ ] Check bundle size and identify large dependencies

---

## 9. 🔍 DATA EXPOSURE & PRIVACY

### User Data Protection
- [ ] Check `prisma.user` queries don't return password hashes
- [ ] Verify `select` clauses exclude sensitive fields
- [ ] Check error messages don't leak user existence (email enumeration)
  - Password reset: "If account exists..." ✅
  - Login: Generic "Invalid credentials" ✅

### Logging & Error Handling
- [ ] Remove `console.log()` statements in production code
- [ ] Verify error responses don't expose stack traces
- [ ] Check no sensitive data logged (passwords, tokens, API keys)

### GDPR Compliance (if applicable)
- [ ] User data deletion functionality
- [ ] Data export functionality
- [ ] Cookie consent banner (if using analytics)

---

## 10. 🎯 GEMINI AI & API SECURITY

### API Key Protection
- [x] `GOOGLE_API_KEY` server-side only ✅
- [ ] Verify no API key in client bundles (check with DevTools Network tab)
- [ ] Check API key rotation policy

### AI Input Sanitization
- [ ] User prompts sanitized before sending to Gemini
- [ ] Check for prompt injection vulnerabilities
  - Example: User input: "Ignore previous instructions and..."
- [ ] Verify AI responses sanitized before rendering

### AI Model Failover
- [ ] Verify failover chain doesn't expose different behavior
- [ ] Check error handling doesn't leak model names/versions

---

## 11. 🚦 RATE LIMITING & ABUSE PREVENTION

### Critical Missing Rate Limits
- [ ] **Login endpoint** - Prevent brute force attacks
- [ ] **Signup endpoint** - Prevent bot registrations
- [ ] **Password reset** - Prevent email flooding
- [ ] **Vocabulary audio generation** - Prevent API quota abuse
- [ ] **Lesson generation** - Prevent expensive AI API abuse

### Implementation Options
1. **Vercel Edge Middleware** with upstash-ratelimit
2. **Redis** rate limiting
3. **In-memory rate limiting** (simple, but resets on deploy)

**Example Implementation:**
```typescript
// src/lib/rate-limit.ts
const rateLimitStore = new Map();

export function checkRateLimit(identifier, config) {
  const now = Date.now();
  const key = identifier;
  
  let store = rateLimitStore.get(key);
  
  if (!store || store.resetTime < now) {
    store = {
      count: 0,
      resetTime: now + config.interval,
    };
    rateLimitStore.set(key, store);
  }
  
  if (store.count >= config.maxRequests) {
    return { success: false, reset: store.resetTime };
  }
  
  store.count++;
  return { success: true };
}
```

---

## 12. 🔐 SECRETS MANAGEMENT CHECKLIST

### Environment Variables Audit
```bash
# Server-side only (NEVER prefix with NEXT_PUBLIC_):
DATABASE_URL
GOOGLE_API_KEY
ELEVENLABS_API_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXTAUTH_SECRET
GOOGLE_CLIENT_SECRET
RESEND_API_KEY

# Client-side (safe to expose):
NEXT_PUBLIC_SUPABASE_URL
```

### Vercel Environment Variables
- [ ] All secrets set in Vercel dashboard
- [ ] Production/Preview/Development environments separated
- [ ] No secrets in environment variable names
- [ ] Verify `.env.local` in `.gitignore`

---

## 13. 📱 CLIENT-SIDE SECURITY

### Browser Security
- [ ] Check localStorage/sessionStorage for sensitive data
- [ ] Verify no tokens stored in cookies without `httpOnly`
- [ ] Check IndexedDB doesn't contain secrets

### Third-Party Scripts
- [ ] Audit all external scripts loaded
- [ ] Verify Subresource Integrity (SRI) on CDN scripts
- [ ] Check Google Analytics/Tag Manager configuration

---

## 14. 🧪 SECURITY TESTING

### Manual Testing
- [ ] Test SQL injection on all inputs
- [ ] Test XSS on text inputs and markdown fields
- [ ] Test CSRF protection on forms
- [ ] Test authentication bypass attempts
- [ ] Test file upload restrictions

### Automated Testing
- [ ] Set up OWASP ZAP or similar scanner
- [ ] Configure Snyk or Dependabot for dependency scanning
- [ ] Add security tests to CI/CD pipeline

---

## 15. 📋 COMPLIANCE & DOCUMENTATION

### Documentation
- [ ] Document security assumptions
- [ ] Create incident response plan
- [ ] Document API rate limits
- [ ] Create security.txt file

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor failed login attempts
- [ ] Set up alerts for suspicious activity
- [ ] Track API usage patterns

---

## ⚡ IMMEDIATE ACTION ITEMS (Priority Order)

1. **FIX IMMEDIATELY:** Remove `--turbopack` from build script
2. **FIX IMMEDIATELY:** Add rate limiting to vocabulary audio API
3. **FIX IMMEDIATELY:** Enable RLS on all Supabase tables
4. **FIX TODAY:** Sanitize all `dangerouslySetInnerHTML` with DOMPurify
5. **FIX TODAY:** Add security headers to `next.config.ts`
6. **FIX TODAY:** Remove `ignoreBuildErrors: true` from next.config.ts
7. **FIX TODAY:** Add rate limiting to auth endpoints
8. **THIS WEEK:** Run `npm audit` and fix critical vulnerabilities
9. **THIS WEEK:** Implement comprehensive logging and monitoring
10. **THIS WEEK:** Test production build and verify minification

---

## 🎯 POST-DEPLOYMENT VERIFICATION

After deploying fixes:
- [ ] Inspect production bundle in browser DevTools (should be minified)
- [ ] Test rate limiting works
- [ ] Verify RLS policies block unauthorized access
- [ ] Check security headers present in response
- [ ] Scan with SSL Labs, SecurityHeaders.com
- [ ] Run Lighthouse security audit

---

## 📝 FIXES TO IMPLEMENT

### 1. Fix Build Configuration (5 minutes)
```json
// package.json
"build": "next build"  // Remove --turbopack
```

### 2. Add Security Headers (10 minutes)
```typescript
// next.config.ts
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    ]
  }]
}
```

### 3. Install DOMPurify (5 minutes)
```bash
npm install dompurify @types/dompurify
```

### 4. Create Rate Limiting Utility (30 minutes)
See section 11 for implementation example

### 5. Add Rate Limiting to APIs (15 minutes per endpoint)
```typescript
// Example for vocabulary audio API
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request) {
  const result = checkRateLimit(getClientIp(request), {
    interval: 60 * 1000,
    maxRequests: 10
  });
  
  if (!result.success) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // ... rest of handler
}
```

---

**REMEMBER:** Security is ongoing, not a one-time fix. Review this checklist monthly.
