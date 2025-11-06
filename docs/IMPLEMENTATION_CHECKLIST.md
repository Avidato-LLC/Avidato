# Implementation Checklist & Quick Start

## Decision: Should I Implement This Now?

Before we start, answer these:

1. **Are you ready to go production?**
   - YES → Implement everything
   - NO → Do quick fixes first, implement later

2. **Do you have 2 hours?**
   - YES → Full implementation
   - NO → Just do quick fixes (30 min)

3. **How important is email verification?**
   - Critical → Implement now
   - Nice to have → Can wait
   - Optional → Skip for now

---

## Quick Wins (30 minutes) - Do These NOW

These fixes work with or without email implementation.

### Fix #1: Auto-Verify Google OAuth Emails (5 min)

**File:** `/src/lib/auth.ts`

Find this section:
```typescript
async signIn({ user, account, profile }: any): Promise<boolean> {
  if (account?.provider === "google" && profile) {
    // Prevent account switching by using profile data
    user.email = profile.email
    user.name = profile.name
    user.image = profile.picture || user.image
  }
  return true
},
```

Replace with:
```typescript
async signIn({ user, account, profile }: any): Promise<boolean> {
  if (account?.provider === "google" && profile) {
    // Prevent account switching by using profile data
    user.email = profile.email
    user.name = profile.name
    user.image = profile.picture || user.image
    
    // Google already verified the email, so mark it as verified
    try {
      await prisma.user.update({
        where: { email: profile.email },
        data: { emailVerified: new Date() }
      }).catch(() => {}) // Ignore if user doesn't exist yet (new signup)
    } catch (error) {
      console.error('Failed to mark Google email as verified:', error)
    }
  }
  return true
},
```

### Fix #2: Implement Account Unlinking (15 min)

**File:** `/src/app/actions/settings.ts`

Add this new function at the end:

```typescript
/**
 * Unlink a provider from user's account
 * Prevents unlinking the only authentication method
 */
export async function unlinkAccount(provider: string) {
  try {
    const session = await getServerSession(authOptions) as AuthSession
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        accounts: true, 
        password: true 
      }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Check if this is the only auth method
    const remainingMethods = user.accounts.filter(
      a => a.provider !== provider
    ).length
    
    // If no other accounts AND no password, can't unlink
    if (remainingMethods === 0 && !user.password) {
      return {
        success: false,
        error: 'Cannot unlink your only authentication method. Set a password first.'
      }
    }

    // Delete the account link
    await prisma.account.deleteMany({
      where: {
        userId: user.id,
        provider: provider
      }
    })

    revalidatePath('/dashboard/settings')
    return { 
      success: true, 
      message: `${provider} account disconnected` 
    }
  } catch (error) {
    console.error('Unlink account error:', error)
    return { success: false, error: 'Failed to disconnect account' }
  }
}
```

**File:** `/src/app/dashboard/settings/page.tsx`

Update the `handleUnlinkAccount` function in `AccountLinkingTab`:

Find this:
```typescript
const handleUnlinkAccount = async (providerId: string) => {
  setIsLoading(true)
  setMessage(null)

  try {
    // TODO: Implement account unlinking
    // This would require a server action to remove the account record
    setMessage({ 
      type: 'error', 
      text: 'Account unlinking feature coming soon. Please contact support for assistance.' 
    })
  } catch {
    setMessage({ type: 'error', text: 'Failed to unlink account' })
  } finally {
    setIsLoading(false)
  }
}
```

Replace with:
```typescript
const handleUnlinkAccount = async (providerId: string) => {
  setIsLoading(true)
  setMessage(null)

  try {
    const result = await unlinkAccount(providerId)
    
    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: result.message || 'Account disconnected' 
      })
      
      // Reload security info to update UI
      const securityResult = await getSecurityInfo()
      if (securityResult.success && securityResult.data) {
        setSecurityInfo(securityResult.data)
      }
    } else {
      setMessage({ 
        type: 'error', 
        text: result.error || 'Failed to disconnect account' 
      })
    }
  } catch (error) {
    console.error('Unlink error:', error)
    setMessage({ type: 'error', text: 'Failed to disconnect account' })
  } finally {
    setIsLoading(false)
  }
}
```

Add import at top of file:
```typescript
import { unlinkAccount } from '@/app/actions/settings'
```

### Fix #3: Test Quick Wins (10 min)

```bash
# Rebuild to check for errors
npm run build

# If errors, fix them

# If successful, test locally
npm run dev

# Go to: http://localhost:3000/dashboard/settings
# Try: 
# 1. Connect Google if not connected
# 2. Try to disconnect Google (should work if you have password)
# 3. Signup with Google in new incognito window
# 4. Check if email shows as verified
```

---

## Full Implementation (2 hours) - When Ready

### Step 1: Setup Resend (10 min)

1. Go to https://resend.com
2. Sign up (free, no credit card needed)
3. Verify your email
4. Go to API Keys
5. Create new API key
6. Copy the key (starts with `re_`)

### Step 2: Update Environment (5 min)

Add to `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Install package:
```bash
npm install resend
```

### Step 3: Update Database (10 min)

**File:** `/prisma/schema.prisma`

Find the `User` model and add these relations at the end:

```prisma
model User {
  // ... existing fields ...
  verificationTokens   VerificationToken[]
  passwordResetTokens  PasswordResetToken[]
}
```

Add these two new models at the end of the file:

```prisma
model VerificationToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String?

  @@unique([email, token])
  @@index([email])
  @@index([token])
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String

  @@unique([email, token])
  @@index([email])
  @@index([token])
}
```

Run migration:
```bash
npx prisma migrate dev --name add_email_tokens
```

### Step 4: Create Core Services (30 min)

Use the complete code from `/docs/EMAIL_VERIFICATION_PASSWORD_RESET_IMPLEMENTATION.md`:

1. Create `/src/lib/email-templates.tsx`
2. Create `/src/lib/email-service.ts`
3. Create `/src/lib/token-service.ts`

### Step 5: Create Server Actions (15 min)

Create `/src/app/actions/auth.ts` using code from implementation guide.

### Step 6: Create UI Pages (20 min)

Create these three pages using code from implementation guide:

1. `/src/app/auth/verify-email/page.tsx`
2. `/src/app/auth/forgot-password/page.tsx`
3. `/src/app/auth/reset-password/page.tsx`

### Step 7: Update Existing Pages (10 min)

**File:** `/src/app/login/page.tsx`

Add "Forgot Password?" link to login form. Look for the submit button area and add:

```typescript
<div className="space-y-4 mt-4">
  <a 
    href="/auth/forgot-password" 
    className="text-sm text-primary hover:underline"
  >
    Forgot Password?
  </a>
</div>
```

**File:** `/src/app/dashboard/settings/page.tsx`

In the `SecurityTab` component, add email verification section. Find where it displays "Email Verification Status" and add a button to request verification (see implementation guide for exact code).

### Step 8: Test Everything (15 min)

```bash
# Build to check for errors
npm run build

# Run dev server
npm run dev

# Test Signup → Email Verification
# - Go to /signup
# - Create account
# - Check console for verification link
# - Click link
# - Should redirect to dashboard

# Test Password Reset
# - Go to /login → "Forgot Password?"
# - Enter email
# - Check console for reset link
# - Click link
# - Set new password
# - Login with new password

# Test Google OAuth
# - Try signing up with Google in incognito
# - Check settings → security
# - Email should show as verified
```

### Step 9: Deploy (5 min)

```bash
git add .
git commit -m "feat: Add email verification and password reset"
git push
```

Vercel auto-deploys!

### Step 10: Configure Production Domain (10 min)

When ready for production with your domain:

1. In Resend dashboard → Your Domain
2. Get DNS records
3. Add to Cloudflare DNS
4. Verify domain in Resend
5. Update `.env.local`:

```
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

## Minimal Implementation (45 min) - Just Email Verification

If you only want email verification (not password reset):

1. Quick fixes: 30 min (do these)
2. Install Resend: 5 min
3. Update Prisma: 5 min
4. Create services: 20 min
5. Create verify page: 10 min
6. Update settings: 5 min

**Skip:** Password reset pages, forgot password, forgot password link

---

## Files Provided (Copy & Paste Ready)

All files are ready to use. Check:

```
/docs/
├── EMAIL_VERIFICATION_PASSWORD_RESET_IMPLEMENTATION.md
│   └─ All code snippets ready to copy
├── EMAIL_SETUP_QUICK_START.md
│   └─ Detailed setup instructions
├── SECURITY_SETTINGS_STATUS.md
│   └─ What's working, what's broken
├── EMAIL_ARCHITECTURE_DIAGRAMS.md
│   └─ Visual flows and architecture
└── EMAIL_AND_AUTH_SUMMARY.md
    └─ Executive summary
```

---

## Troubleshooting

### Build Fails
```
Error: Cannot find module 'resend'
→ Run: npm install resend

Error: Prisma schema validation failed
→ Check syntax in schema.prisma
→ Run: npx prisma format

Error: TypeScript errors
→ Check imports are correct
→ Make sure all files are in right directories
```

### Email Not Sending
```
Resend API key wrong
→ Check RESEND_API_KEY in .env.local
→ Copy key again from Resend dashboard

Using testing email in production
→ Get real API key from Resend
→ Add domain to Resend
→ Update RESEND_FROM_EMAIL

Email going to spam
→ Add Resend DNS records to Cloudflare
→ Verify domain in Resend
→ Wait 5-10 min for DNS propagation
```

### Tokens Not Working
```
Token always invalid
→ Check token generation uses crypto.randomBytes
→ Check expires time is in future
→ Check database migration ran

Token expired immediately
→ Check expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
→ Make sure 24 * 60 * 60 * 1000 is correct (24 hours in ms)
```

---

## Deployment Checklist

Before going to production:

- [ ] Test signup → verification email works
- [ ] Test password reset → email works
- [ ] Test Google OAuth → emails show verified
- [ ] Test account unlinking → can disconnect
- [ ] Check email template renders correctly
- [ ] Verify dark mode works in emails
- [ ] Test on mobile (email links work)
- [ ] Add Resend DNS records to Cloudflare
- [ ] Verify domain in Resend
- [ ] Test with real domain email
- [ ] Check email headers look professional
- [ ] Monitor Resend dashboard for delivery
- [ ] Setup error alerts (optional)

---

## Quick Command Reference

```bash
# Installation
npm install resend

# Database
npx prisma migrate dev --name add_email_tokens
npx prisma studio  # View data

# Building
npm run build      # Check for errors
npm run dev        # Local testing

# Git
git status         # Check changes
git add .          # Stage everything
git commit -m "..."  # Commit
git push           # Deploy to Vercel

# Troubleshooting
npm run lint       # Check code quality
npm run type-check # Check TypeScript
npx prisma db push # Update database
```

---

## Getting Help

If you get stuck:

1. **Check the error message** - Usually tells you what's wrong
2. **Look in implementation guide** - Has similar examples
3. **Check TypeScript errors** - Usually hints at the fix
4. **Check Resend logs** - Dashboard shows if email sent
5. **Ask me** - I'm here to help!

---

## Success Criteria

You'll know it's working when:

✅ Can signup with email and verify
✅ Can reset password via email link
✅ Google users show email as verified
✅ Can disconnect OAuth accounts
✅ Settings page shows all statuses correctly
✅ No error messages in console
✅ Emails look good in inbox
✅ Can login with new password after reset

---

## Next Steps

Pick one:

**Option A: I Do It**
- Let me implement everything
- I'll create all files and test
- You review and deploy
- Time: ~2 hours

**Option B: You Do It**
- Follow this checklist
- Use implementation guide
- Ask if stuck
- Time: ~2 hours

**Option C: Do Quick Fixes Only**
- Implement fixes #1 and #2 above
- Email verification later
- Time: 30 minutes

**Option D: Wait**
- Check docs later when ready
- Everything is documented
- No rush!

---

## You've Got This! 🚀

Everything is ready. Just need to:
1. Pick an option above
2. Have fun building
3. Deploy with confidence

The infrastructure is there, the code is ready, and the users are waiting!

