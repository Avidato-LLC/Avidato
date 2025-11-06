# Email Testing with Resend - Development Guide

## Current Limitation

Resend restricts outbound emails in development/testing until a domain is verified. You can only send to:
- **Your verified email**: avidato.app@gmail.com
- **Domain verified emails**: Once you verify avidato.com

## Solutions

### Option 1: Use Your Verified Email (Easiest for Testing)

Update `.env` to send test emails to yourself:

```env
# For testing - sends to your verified email
RESEND_TEST_EMAIL=avidato.app@gmail.com
```

Then modify `src/app/actions/verification.ts` to redirect test emails:

```typescript
// In requestPasswordReset and requestEmailVerification:
const testEmail = process.env.RESEND_TEST_EMAIL
const emailToUse = process.env.NODE_ENV === 'development' ? (testEmail || email) : email

const result = await requestPasswordReset(emailToUse)
```

### Option 2: Verify Your Domain (Best Long-term)

Complete the domain verification steps in **DOMAIN_NEXT_STEPS.md**:
1. Add DNS records to your domain registrar
2. Verify domain in Resend
3. Then emails will work to any recipient

### Option 3: Use Resend's Testing Email in Development

If you set `RESEND_FROM_EMAIL=onboarding@resend.dev`, you can:
- Send test emails to: onboarding@resend.dev
- View them in Resend dashboard: https://resend.com/emails
- No real emails sent

## Recommended Approach for Development

1. **Keep domain verification going** (add those DNS records)
2. **While waiting**, use your verified email for testing:
   - Update `.env`: `RESEND_FROM_EMAIL=noreply@avidato.com`
   - Test emails will go to: avidato.app@gmail.com
   - Check your Gmail inbox

3. **After domain verified**:
   - DNS records propagated
   - Domain shows ✅ in Resend
   - Then emails work to any recipient

## Current Status

- ✅ Resend package installed
- ✅ Email templates created
- ❌ Domain not verified yet (DNS records not added)
- ❌ Can only send to avidato.app@gmail.com until domain verified

## Next Steps

**Immediate** (to test now):
1. Update `.env` to use `RESEND_FROM_EMAIL=noreply@avidato.com`
2. Test password reset - emails go to avidato.app@gmail.com
3. Check your Gmail inbox

**Soon** (for production):
1. Add DNS records to domain registrar (see DOMAIN_NEXT_STEPS.md)
2. Verify domain in Resend
3. Then emails work to any recipient

## Testing Flow

```
User enters email: test@example.com
    ↓
System generates token
    ↓
Email service tries to send
    ↓
In Development (domain not verified):
  → Email redirected to avidato.app@gmail.com
  → Check your Gmail for the reset link
    ↓
In Production (domain verified):
  → Email sent to test@example.com
  → User receives reset link
```

---

See: DOMAIN_NEXT_STEPS.md for complete domain verification instructions
