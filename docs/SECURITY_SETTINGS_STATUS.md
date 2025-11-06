# Security Settings Status Report

Generated: November 6, 2025

---

## Current Settings Page Functionality ✅

### What's Working

#### 1. Profile Tab
- ✅ Display name editing
- ✅ Email display (read-only - by design)
- ✅ Username with real-time availability checking
- ✅ Bio editing
- ✅ Profile picture display
- ✅ Form validation with error messages
- ✅ Server-side validation with Zod schemas

#### 2. Security Tab
- ✅ Security overview panel
- ✅ Password status indicator (shows if password is set)
- ✅ Email verification status display
- ✅ Connected accounts display (linked OAuth providers)
- ✅ Change password form (for users with passwords)
- ✅ Password strength requirements
- ✅ Current password verification before change
- ✅ Prevents setting new password same as current
- ✅ Security tips section
- ✅ Form error handling

#### 3. Account Linking Tab
- ✅ Visual layout for available providers (Google, GitHub, Microsoft)
- ✅ Shows which accounts are connected
- ✅ Status indicators (connected vs not connected)
- ✅ Current status summary
- ✅ Security information tips

---

## Issues Found & Needed Fixes ⚠️

### Critical Issues

#### Issue #1: Email Verification Status Shows but Can't Verify
**Current Behavior:**
- Settings page shows: "Email address not verified" (red indicator)
- No button to send verification email
- User is stuck - can't verify

**Why It Happens:**
- Email verification flow doesn't exist yet
- No `requestEmailVerification()` action

**Fix Required:**
- Implement full email verification flow (see EMAIL_SETUP_QUICK_START.md)
- Add "Send Verification Email" button in Security tab
- Handle expired/resent emails

---

### Medium Issues

#### Issue #2: Google OAuth Users Email Status Confusion
**Current Behavior:**
- User signs up with Google
- Email shows as "not verified" even though Google verified it
- Confuses users who don't have a password

**Why It Happens:**
- `emailVerified` field not auto-set for Google OAuth users
- Auth callback doesn't mark Google emails as verified

**Fix Required:**
Add to `/src/lib/auth.ts` in `signIn` callback:

```typescript
async signIn({ user, account, profile }: any): Promise<boolean> {
  if (account?.provider === "google" && profile) {
    // Google already verified the email
    await prisma.user.update({
      where: { email: profile.email },
      data: { emailVerified: new Date() }
    }).catch(() => {}) // Ignore if user doesn't exist yet
  }
  return true
}
```

#### Issue #3: Account Linking - Unlink Not Implemented
**Current Behavior:**
- "Disconnect" button shows but gives error
- User can't unlink accounts
- TODO comment in code

**Why It Happens:**
- `unlinkAccount()` server action not implemented

**Fix Required:**
Add to `/src/app/actions/settings.ts`:

```typescript
export async function unlinkAccount(provider: string) {
  try {
    const session = await getServerSession(authOptions) as AuthSession
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, accounts: true, password: true }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Prevent unlinking if it's the only auth method
    const remainingMethods = user.accounts.filter(a => a.provider !== provider).length
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
    return { success: true, message: `${provider} account disconnected` }
  } catch (error) {
    console.error('Unlink account error:', error)
    return { success: false, error: 'Failed to disconnect account' }
  }
}
```

Then update the AccountLinkingTab in settings page:

```typescript
const handleUnlinkAccount = async (providerId: string) => {
  setIsLoading(true)
  setMessage(null)

  try {
    const result = await unlinkAccount(providerId)
    
    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: result.message 
      })
      // Reload security info
      const securityResult = await getSecurityInfo()
      if (securityResult.success && securityResult.data) {
        setSecurityInfo(securityResult.data)
      }
    } else {
      setMessage({ 
        type: 'error', 
        text: result.error 
      })
    }
  } catch {
    setMessage({ type: 'error', text: 'Failed to unlink account' })
  } finally {
    setIsLoading(false)
  }
}
```

---

### Low Priority Issues

#### Issue #4: Password Setup for OAuth-Only Users
**Current Behavior:**
- User with only Google login can't change password (form says "This account uses social login")
- They might want password for backup login method

**Why It Happens:**
- System correctly prevents changing non-existent password
- But no option to CREATE password for OAuth accounts

**Fix Required:**
- Add new server action: `setPasswordForOAuthUser(currentPassword, newPassword)`
- Show "Set Password" button instead of "Change Password" for OAuth-only users
- Require email verification or other verification method

---

#### Issue #5: Rate Limiting Not Implemented
**Current Behavior:**
- Users can spam "Change Password" attempts
- Users can spam "Send Verification Email" requests
- Could be abuse vector

**Why It Happens:**
- No rate limiting middleware added yet

**Fix Required (Optional, can add later):**
Use `Ratelimit` from `@upstash/ratelimit`:

```typescript
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 requests per hour
})

// In changePassword action:
const { success, pending, reset } = await ratelimit.limit(`password-change:${userId}`)
if (!success) {
  return { success: false, error: 'Too many attempts. Try again later.' }
}
```

---

## Functional Matrix - Current State

| Feature | Status | Notes |
|---------|--------|-------|
| Profile Updates | ✅ Working | Name, username, bio |
| Email Display | ✅ Working | Read-only (by design) |
| Password Change | ✅ Working | For users with passwords |
| Email Verification | ❌ Not Implemented | No verification email sending |
| Password Reset | ❌ Not Implemented | No forgot password flow |
| Account Linking Display | ✅ Working | Shows connected accounts |
| Account Unlinking | ❌ Not Implemented | UI exists but backend missing |
| OAuth Email Handling | ⚠️ Partial | Shows unverified for Google users |
| Password Setup (OAuth) | ❌ Not Implemented | No option to add password to OAuth accounts |
| Rate Limiting | ❌ Not Implemented | Not urgent |

---

## What Happens for Different User Types

### User Type 1: Email/Password Signup
```
1. Sign up with email + password ✅
2. Password hashed with bcrypt ✅
3. Email status shows "not verified" ⚠️ (no way to verify)
4. Can change password ✅
5. Can request password reset ❌ (not implemented)
6. Can link Google/GitHub ✅
7. Can unlink accounts ❌ (not implemented)
```

### User Type 2: Google OAuth Only
```
1. Sign up with Google ✅
2. Email auto-filled from Google ✅
3. Email shows as "not verified" ⚠️ (but Google verified it!)
4. Can't change password ✅ (correct - no password set)
5. NO option to set password ❌ (missing)
6. Can link GitHub/Microsoft ✅
7. Can't unlink Google (only method) ✅ (correct)
```

### User Type 3: Email/Password + Google
```
1. Sign up with email/password ✅
2. Link Google account ✅
3. Can change password ✅
4. Email shows as "not verified" ⚠️ (no way to verify)
5. Can login with either method ✅
6. Can unlink Google ✅ (has password as backup)
7. Can't unlink password (only password + email) ⚠️ (need to link another OAuth first)
```

---

## Action Items Priority

### Immediate (Blocking User Experience)
1. **Implement email verification flow** (see EMAIL_SETUP_QUICK_START.md)
   - Create `/auth/verify-email` page
   - Create `requestEmailVerification()` action
   - Create token management
   - Add "Send Verification Email" button to settings

2. **Fix Google OAuth email status**
   - Auto-mark Google emails as verified
   - Update auth callback
   - Show different message for OAuth vs password users

3. **Implement account unlinking**
   - Create `unlinkAccount()` action
   - Prevent unlinking last auth method
   - Update AccountLinkingTab component

### Short Term (Improve UX)
4. **Password reset flow** (see EMAIL_SETUP_QUICK_START.md)
   - Create `/auth/forgot-password` page
   - Create `/auth/reset-password` page
   - Create token management
   - Add "Forgot Password?" link to login page

5. **OAuth password setup**
   - Add `setPasswordForOAuthUser()` action
   - Show "Set Password" button for OAuth-only accounts
   - Require email verification before allowing

### Nice to Have
6. **Rate limiting** (add when you get spam)
7. **Two-factor authentication** (future enhancement)
8. **Session invalidation** (when password changes, logout other devices)

---

## Implementation Order

```
✅ Step 1: Fix Google OAuth email auto-verification (5 min)
   └─ Update auth.ts signIn callback

✅ Step 2: Implement email verification (30 min)
   ├─ Extend Prisma schema
   ├─ Add Resend integration
   ├─ Create /auth/verify-email page
   └─ Add settings UI button

✅ Step 3: Implement password reset (20 min)
   ├─ Create /auth/forgot-password page
   ├─ Create /auth/reset-password page
   ├─ Add "Forgot Password" link to login

✅ Step 4: Implement account unlinking (15 min)
   ├─ Create unlinkAccount() action
   └─ Update AccountLinkingTab

✅ Step 5: OAuth password setup (20 min)
   ├─ Create setPasswordForOAuthUser() action
   └─ Add "Set Password" button for OAuth users
```

**Total estimated time: 90 minutes for full implementation**

---

## Testing Checklist

### Before Implementation
- [ ] Current code compiles without errors ✅
- [ ] Settings page loads
- [ ] All tabs are clickable
- [ ] Profile updates work
- [ ] Password change works (for users with password)

### After Email Verification Implementation
- [ ] Email verification link works
- [ ] Token expires correctly
- [ ] Email shows as verified after clicking link
- [ ] Used tokens can't be reused
- [ ] Settings page shows verified status

### After Password Reset Implementation
- [ ] Forgot password page accessible
- [ ] Email sent correctly
- [ ] Reset link works
- [ ] Can login with new password
- [ ] Old password no longer works

### After Account Unlinking
- [ ] Can disconnect Google account
- [ ] Can disconnect GitHub account
- [ ] Can't disconnect last auth method
- [ ] Can reconnect after disconnecting

### After OAuth Email Fix
- [ ] Google users show email as verified
- [ ] Email/password users show unverified
- [ ] Verification email button works for email/password users

---

## Database Schema Status

### Current User Model
```prisma
model User {
  id                   String    @id @default(cuid())
  username             String?
  name                 String?
  email                String    @unique
  emailVerified        DateTime?  ✅ Ready to use!
  image                String?
  password             String?
  dailyGenerationCount Int       @default(0)
  lastGenerationDate   DateTime?
  dailyLimit           Int       @default(20)
  bio                  String?
  accounts             Account[]  ✅ For OAuth providers
  sessions             Session[]
  students             Student[]
}
```

### Missing Models (For Email Verification)
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

---

## Quick Links

- **Implementation Guide:** `/docs/EMAIL_VERIFICATION_PASSWORD_RESET_IMPLEMENTATION.md`
- **Quick Start:** `/docs/EMAIL_SETUP_QUICK_START.md`
- **Current Settings Page:** `/src/app/dashboard/settings/page.tsx`
- **Settings Actions:** `/src/app/actions/settings.ts`
- **Auth Config:** `/src/lib/auth.ts`
- **Prisma Schema:** `/prisma/schema.prisma`

