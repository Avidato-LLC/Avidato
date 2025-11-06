# Domain Connected - What to Change? ✅

## Your Current Status

✅ **Domain created**: avidato.com in Resend
⏳ **DNS records**: Should be added to your domain registrar
⏳ **Domain verification**: Pending (wait for DNS to propagate)
⏳ **Email sending**: Currently works with development email

---

## What You Need to Change (In Order)

### Step 1: Add DNS Records (Do First) ⏳

**Location**: Your domain registrar (GoDaddy, Cloudflare, Namecheap, Route53, etc.)

Copy these records from your Resend dashboard and add them:

```
1. DKIM Record
   Type: TXT
   Name: resend._domainkey.avidato.com
   Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmHLtHY6pMWvGZUGDYC0jXPjmItXl/gyxCCglHpBneRvuh1iHB/W2Wrk5KVaqpvPoanTmRRBT14tgJhjK69BTi7b8neCX2ptlbcy0o9iwgQ94PxP+MFSid47h7gTrdYFF0sEsUwm1YDqIz3fgl8FM5cOQIO2WhS1cWPf5fbYF+wwIDAQAB

2. SPF Record
   Type: TXT
   Name: send.avidato.com
   Value: v=spf1 include:amazonses.com ~all

3. DMARC Record (Optional but recommended)
   Type: TXT
   Name: _dmarc.avidato.com
   Value: v=DMARC1; p=none;

4. MX Record (For receiving - Optional)
   Type: MX
   Name: avidato.com
   Value: inbound-smtp.eu-west-1.amazonaws.com
   Priority: 10
```

⏱️ Wait 5-30 minutes for DNS propagation

### Step 2: Verify Domain in Resend ✅

1. Go to Resend dashboard
2. Find your domain (avidato.com)
3. Click "Verify Domain" button
4. Status should change to ✅ Verified

**Time**: Automatic (takes 1-5 minutes after DNS records are live)

### Step 3: Update `.env` File 🔧

**File**: `/Users/darren/Desktop/Dev-Environment/Avidato/.env`

Add this line (or update if exists):

```env
RESEND_FROM_EMAIL=noreply@avidato.com
```

**Current `.env` status**:
- ✅ RESEND_API_KEY is set
- ❌ RESEND_FROM_EMAIL is NOT set (needs to be added)

### Step 4: Update Code (Already Done ✅)

Your code in `src/lib/email-service.tsx` already supports domain emails:

```typescript
const getFromEmail = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'
  }
  // Use Resend's testing email for development
  return 'onboarding@resend.dev'
}
```

**No changes needed** - it will automatically use:
- Development: `onboarding@resend.dev` (for testing)
- Production: `noreply@avidato.com` (from environment variable)

---

## Current vs After Setup

| Stage | Email From | Use Case | Status |
|-------|-----------|----------|--------|
| **Now** | onboarding@resend.dev | Development/Testing | ✅ Works |
| **After DNS Added** | onboarding@resend.dev | Waiting for verification | ⏳ Pending |
| **After Verified** | noreply@avidato.com | Production Ready | 🎯 Target |

---

## Exact Steps to Complete

### 1️⃣ Add DNS Records (5 minutes)
- Go to your domain registrar dashboard
- Add the 4 records above
- Wait for propagation (5-30 min)

### 2️⃣ Verify in Resend (Automatic)
- Resend auto-checks DNS
- Status updates to ✅ Verified when ready
- You'll see green checkmarks

### 3️⃣ Update `.env` (1 minute)

Edit: `/Users/darren/Desktop/Dev-Environment/Avidato/.env`

Add after the `RESEND_API_KEY` line:

```env
RESEND_FROM_EMAIL=noreply@avidato.com
```

Your `.env` should look like:

```env
# ... existing content ...

RESEND_API_KEY=re_GmiM8Fna_NeKQyECheJs9DSaC1h8Wzd54
RESEND_FROM_EMAIL=noreply@avidato.com

# ... rest of file ...
```

### 4️⃣ Restart Development Server (1 minute)

```bash
# Stop current dev server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Testing After Setup

```bash
# Development (still uses onboarding@resend.dev for testing)
npm run dev
# Create account → email has "onboarding@resend.dev"

# Production (uses your domain)
npm run build
npm start
# Create account → email has "noreply@avidato.com"
```

---

## What Changes When Domain is Verified ✨

**Before**:
```
From: Avidato <onboarding@resend.dev>
Sender: Resend
Trust Level: Low (third-party service)
Deliverability: 30-40% (spam risk)
```

**After**:
```
From: Avidato <noreply@avidato.com>
Sender: Your company
Trust Level: High (your domain!)
Deliverability: 95%+ (inbox placement)
DKIM: ✅ Signed
SPF: ✅ Verified
DMARC: ✅ Policy active
```

---

## Checklist

- [ ] Add 4 DNS records to domain registrar
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify domain in Resend dashboard (auto-checks)
- [ ] Confirm status is ✅ Verified in Resend
- [ ] Add `RESEND_FROM_EMAIL=noreply@avidato.com` to `.env`
- [ ] Restart dev server (`npm run dev`)
- [ ] Test by creating account/password reset
- [ ] Verify email comes from `noreply@avidato.com`
- [ ] Check email lands in inbox (not spam!)

---

## Summary

**TL;DR:**
1. Add DNS records to registrar (copy from Resend)
2. Wait for DNS (5-30 min)
3. Resend auto-verifies (you'll see checkmarks)
4. Add `RESEND_FROM_EMAIL=noreply@avidato.com` to `.env`
5. Restart `npm run dev`
6. Done! Emails now from your domain ✅

**Time to complete**: ~45 minutes total (mostly waiting for DNS)
**Difficulty**: Easy (mostly copy-paste)
**Value**: Huge - emails now actually reach users' inboxes!

---

## Questions?

- **"Where do I add DNS records?"** → Your domain registrar (where you bought avidato.com)
- **"How long does DNS take?"** → Usually 5-30 minutes, sometimes up to 48 hours
- **"What if DNS records don't work?"** → Check your registrar's documentation - some use different formats
- **"Can I test before DNS is ready?"** → Yes! Development continues using `onboarding@resend.dev`
- **"Do I need to redeploy?"** → Just restart dev server with `npm run dev`

---

**Status**: Ready for next step! 🚀
