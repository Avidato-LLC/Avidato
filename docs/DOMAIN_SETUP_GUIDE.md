# Domain Setup Guide for Resend Email Service

## What Does Connecting Your Domain Do?

Connecting `avidato.com` to Resend enables you to send emails **from your own domain** instead of from Resend's shared infrastructure. This is crucial for production use.

---

## Key Benefits

### 1. **Professional Email Address**
- **Without domain**: Emails come from `onboarding@resend.dev` (development/testing)
- **With domain**: Emails come from `noreply@avidato.com` (professional, branded)
- Your users see YOUR domain, not a third-party service

### 2. **Email Deliverability** ⭐ Most Important
- Emails sent from your domain have **higher inbox delivery rates**
- ISPs (Gmail, Outlook, Yahoo) trust domain-verified emails more
- Prevents emails ending up in spam folder
- Critical for production - without this, users won't receive emails!

### 3. **Trust & Branding**
- Users recognize your brand in the sender address
- Builds confidence that emails are legitimate
- Professional appearance

### 4. **Compliance & Security**
- **DKIM (DomainKeys Identified Mail)**: Cryptographically signs emails to prove they're from your domain
- **SPF (Sender Policy Framework)**: Authorizes Resend servers to send on your behalf
- **DMARC (Domain-based Message Authentication)**: Authentication policy for your domain
- Protects against phishing and spoofing

---

## DNS Records Explained

The records shown in your Resend dashboard configure the authentication:

### Domain Verification (DKIM)
```
Type: TXT
Name: resend._domainkey
Content: p=MIGfMA0GCSq... (public cryptographic key)
```
**Purpose**: Allows receivers to verify emails are genuinely from avidato.com

### Enable Sending (SPF & DMARC)

**SPF Record:**
```
Type: TXT
Name: send
Content: v=spf1 include:amazonses.com ~all
```
**Purpose**: Tells the world "Amazon SES (Resend's email service) is authorized to send emails for avidato.com"

**DMARC Record (Optional but Recommended):**
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none;
```
**Purpose**: Sets policy for authentication failures (currently set to "none" = report but don't reject)

### Enable Receiving (MX)
```
Type: MX
Name: @
Content: inbound-smtp.eu-west-1.amazonaws.com
Priority: 10
```
**Purpose**: Routes incoming emails to Resend/AWS for processing (if you want inbound email)

---

## Current Setup Status

Your domain `avidato.com` is:
- ✅ **Created** in Resend (28 minutes ago)
- ✅ **Region**: eu-west-1 (Ireland) - Good for EU users
- ⏳ **DNS Records**: Need to be added to your domain registrar

---

## What You Need to Do

### Step 1: Access Your Domain Registrar
Go to where you registered `avidato.com` (GoDaddy, Namecheap, Route53, Cloudflare, etc.)

### Step 2: Add DNS Records
Add these TXT and MX records to your domain DNS:

#### Record 1: DKIM (Domain Verification)
```
Type:    TXT
Name:    resend._domainkey.avidato.com
Value:   p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmHLtHY6pMWvGZUGDYC0jXPjmItXl/gyxCCglHpBneRvuh1iHB/W2Wrk5KVaqpvPoanTmRRBT14tgJhjK69BTi7b8neCX2ptlbcy0o9iwgQ94PxP+MFSid47h7gTrdYFF0sEsUwm1YDqIz3fgl8FM5cOQIO2WhS1cWPf5fbYF+wwIDAQAB
TTL:     Auto (or 3600)
```

#### Record 2: SPF (Authorization)
```
Type:    TXT
Name:    send.avidato.com
Value:   v=spf1 include:amazonses.com ~all
TTL:     Auto (or 3600)
```

#### Record 3: DMARC (Policy - Optional but Recommended)
```
Type:    TXT
Name:    _dmarc.avidato.com
Value:   v=DMARC1; p=none;
TTL:     Auto (or 3600)
```

#### Record 4: MX (For Inbound Emails - Optional)
```
Type:    MX
Name:    avidato.com
Value:   inbound-smtp.eu-west-1.amazonaws.com
Priority: 10
TTL:     Auto (or 3600)
```

### Step 3: Verify in Resend
After adding DNS records:
1. Go back to Resend dashboard
2. Click "Verify Domain"
3. Wait for DNS propagation (usually 5-30 minutes)
4. Status should change to ✅ Verified

---

## Environment Variables Update

Once domain is verified, update your `.env.local`:

```env
# Before (development/testing)
RESEND_FROM_EMAIL=onboarding@resend.dev

# After (production)
RESEND_FROM_EMAIL=noreply@avidato.com
```

Then update the email sending code:

```typescript
// src/lib/email-service.tsx
const getFromEmail = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.RESEND_FROM_EMAIL || 'noreply@avidato.com'
  }
  return 'onboarding@resend.dev'
}
```

---

## Optional Configuration Features

### Click Tracking
- **What it does**: Tracks when users click links in your emails
- **How**: Resend inserts its own URL as a redirect
- **Trade-off**: Slightly increases email size, helps with analytics
- **Recommendation**: Enable for marketing emails, disable for critical notifications

### Open Tracking
- **What it does**: Tracks when users open your emails
- **How**: Adds a 1x1 invisible pixel image
- **Trade-off**: Can hurt deliverability, may be inaccurate
- **Recommendation**: Use with caution, impacts inbox placement

### TLS (Transport Layer Security)
- **Opportunistic TLS**: Tries to encrypt, falls back to plain if needed
- **Enforced TLS**: Requires encryption, fails if not possible
- **Recommendation**: Use "Opportunistic" for better reliability, "Enforced" for maximum security

---

## Current Implementation

Your code already supports domain sending! In `src/lib/email-service.tsx`:

```typescript
const getFromEmail = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'
  }
  return 'onboarding@resend.dev'
}
```

**Current flow:**
- 🔧 **Development** (`npm run dev`): Uses `onboarding@resend.dev` (testing)
- 📦 **Production** (`npm run build && npm start`): Uses `RESEND_FROM_EMAIL` from environment

---

## Timeline & Next Steps

### Before Domain Verification ⏳
- Emails work in development only
- Uses Resend's test email address
- No real deliverability
- **Current Status**: ← You are here

### After Domain Verification ✅
- Emails send from `noreply@avidato.com`
- Professional deliverability
- Production-ready
- Users receive emails reliably

### Testing After Setup
```bash
# Test in production:
1. Set RESEND_FROM_EMAIL=noreply@avidato.com in .env.local
2. npm run dev
3. Create account or request password reset
4. Verify email is received (not in spam!)
5. Check sender shows "avidato.com" not "resend.dev"
```

---

## Troubleshooting

### "Emails still not delivering?"
- ✓ Check DNS records are correctly added
- ✓ Wait for DNS propagation (up to 48 hours, usually 5-30 min)
- ✓ Verify domain status in Resend dashboard
- ✓ Check Resend email logs for delivery errors

### "Emails going to spam?"
- ✓ Verify all DNS records (DKIM, SPF, DMARC)
- ✓ Disable open tracking (hurts deliverability)
- ✓ Check email content for spam triggers
- ✓ Build sender reputation (send genuine emails)

### "DNS records not found?"
- ✓ Some registrars use different names (e.g., just `resend._domainkey` not the full name)
- ✓ Check your registrar's documentation
- ✓ Copy exact values from Resend dashboard

---

## Security Considerations

🔒 **Important**: 
- DNS records are public (DKIM key is meant to be public)
- Only authorized mail servers can USE the private key
- SPF/DMARC prevent others from sending as your domain
- Keep DMARC policy at "none" initially, move to "reject" after testing

---

## Summary

| Aspect | Before Domain | After Domain |
|--------|---------------|--------------|
| **Sender** | onboarding@resend.dev | noreply@avidato.com |
| **Deliverability** | Testing only | Production-ready |
| **Inbox Placement** | Low trust | High trust |
| **Branding** | Third-party | Your domain |
| **Authentication** | None | DKIM/SPF/DMARC |
| **Use Case** | Development | Production |

---

## Next Actions

1. ✅ Add DNS records to your domain registrar
2. ✅ Verify domain in Resend dashboard
3. ✅ Update `RESEND_FROM_EMAIL` in `.env` for production
4. ✅ Test email flows with your domain
5. ✅ Deploy to production with domain verified
6. ✅ Monitor email delivery via Resend dashboard

---

**Your domain is ready to use - just add those DNS records and verify!** 🚀
