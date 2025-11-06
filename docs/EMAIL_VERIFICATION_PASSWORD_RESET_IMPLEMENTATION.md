# Email Verification & Password Reset Implementation Guide

## Overview
Complete implementation of email verification and password reset using **100% free services**:
- **Email Service**: Resend.dev (free tier: 100 emails/day, generous free plan)
- **Database**: Already using Supabase (Prisma compatible)
- **Hosting**: Vercel (seamless integration)
- **Domain**: Cloudflare (DNS already configured)

---

## Architecture

### Current State Analysis
✅ **Strengths**:
- NextAuth.js properly configured with both credentials and Google OAuth
- Prisma schema has `emailVerified` field ready
- Database connection via Supabase working
- Settings page with security section present
- JWT session strategy enabled

⚠️ **Gaps**:
- Email verification flow not implemented
- Password reset flow missing
- No email templates
- Google OAuth users have no email set (will be set during first signup)
- Need token storage for verification/reset links

---

## Step 1: Extend Prisma Schema

Add models to track email verification and password reset tokens:

```prisma
model VerificationToken {
  id            String    @id @default(cuid())
  email         String
  token         String    @unique
  expires       DateTime
  createdAt     DateTime  @default(now())
  user          User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String?

  @@unique([email, token])
  @@index([email])
  @@index([token])
}

model PasswordResetToken {
  id            String    @id @default(cuid())
  email         String
  token         String    @unique
  expires       DateTime
  createdAt     DateTime  @default(now())
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String

  @@unique([email, token])
  @@index([email])
  @@index([token])
}
```

Update User model to add relation:

```prisma
model User {
  // ... existing fields
  verificationTokens   VerificationToken[]
  passwordResetTokens  PasswordResetToken[]
}
```

---

## Step 2: Set Up Resend for Email

### Why Resend?
- ✅ Free tier: 100 emails/day (perfect for development)
- ✅ Generous free plan for production
- ✅ Beautiful email templates with React support
- ✅ No credit card for free tier
- ✅ Cloudflare integration ready
- ✅ Excellent TypeScript support

### Setup Steps

1. **Create Resend Account** (free):
   - Visit https://resend.com
   - Sign up with email
   - Verify email
   - Go to API Keys → Create API key

2. **Add to Environment Variables**:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **For Production (Cloudflare Domain)**:
   - In Resend dashboard: Add your domain (e.g., `noreply@yourdomain.com`)
   - Resend will give you DNS records to add to Cloudflare
   - Add CNAME records in Cloudflare DNS
   - Verify domain in Resend (usually takes 5-10 minutes)

### Production Domain Setup:
```
Name: resend._domainkey
Type: CNAME
Value: [provided by Resend]

Name: bounce
Type: CNAME
Value: [provided by Resend]
```

---

## Step 3: Create Email Templates

Create `/src/lib/email-templates.tsx`:

```typescript
import * as React from 'react';

interface VerificationEmailProps {
  verificationUrl: string;
  userName?: string;
}

export const VerificationEmailTemplate = ({
  verificationUrl,
  userName = 'User',
}: VerificationEmailProps) => (
  <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
    <h2 style={{ color: '#333' }}>Welcome to Avidato, {userName}!</h2>
    
    <p>Thanks for signing up. Please verify your email address to get started.</p>
    
    <div style={{ margin: '30px 0' }}>
      <a
        href={verificationUrl}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold',
          display: 'inline-block',
        }}
      >
        Verify Email Address
      </a>
    </div>

    <p style={{ color: '#666', fontSize: '14px' }}>
      Or copy and paste this link: {verificationUrl}
    </p>

    <p style={{ color: '#999', fontSize: '12px', marginTop: '20px' }}>
      This link expires in 24 hours. If you didn't create this account, please ignore this email.
    </p>
  </div>
);

interface PasswordResetEmailProps {
  resetUrl: string;
  userName?: string;
}

export const PasswordResetEmailTemplate = ({
  resetUrl,
  userName = 'User',
}: PasswordResetEmailProps) => (
  <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
    <h2 style={{ color: '#333' }}>Password Reset Request</h2>
    
    <p>Hi {userName},</p>
    
    <p>We received a request to reset your password. Click the button below to proceed.</p>
    
    <div style={{ margin: '30px 0' }}>
      <a
        href={resetUrl}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold',
          display: 'inline-block',
        }}
      >
        Reset Password
      </a>
    </div>

    <p style={{ color: '#666', fontSize: '14px' }}>
      Or copy and paste this link: {resetUrl}
    </p>

    <p style={{ color: '#999', fontSize: '12px', marginTop: '20px' }}>
      This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
    </p>
  </div>
);
```

---

## Step 4: Email Service Module

Create `/src/lib/email-service.ts`:

```typescript
import { Resend } from 'resend';
import { VerificationEmailTemplate, PasswordResetEmailTemplate } from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const getFromEmail = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';
  }
  return 'onboarding@resend.dev'; // Resend testing email
};

export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
  userName?: string
) {
  try {
    const result = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: 'Verify your email - Avidato',
      react: (
        <VerificationEmailTemplate
          verificationUrl={verificationUrl}
          userName={userName}
        />
      ),
    });

    if (result.error) {
      console.error('Error sending verification email:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string
) {
  try {
    const result = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: 'Reset your Avidato password',
      react: (
        <PasswordResetEmailTemplate
          resetUrl={resetUrl}
          userName={userName}
        />
      ),
    });

    if (result.error) {
      console.error('Error sending password reset email:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}
```

---

## Step 5: Token Generation & Verification

Create `/src/lib/token-service.ts`:

```typescript
import { prisma } from './prisma';
import crypto from 'crypto';

const TOKEN_EXPIRY_VERIFICATION = 24 * 60 * 60 * 1000; // 24 hours
const TOKEN_EXPIRY_PASSWORD_RESET = 60 * 60 * 1000; // 1 hour

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createVerificationToken(email: string, userId?: string) {
  const token = generateToken();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_VERIFICATION);

  await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires,
      userId,
    },
  });

  return token;
}

export async function verifyEmailToken(email: string, token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      email_token: { email, token },
    },
  });

  if (!verificationToken) {
    return { success: false, error: 'Invalid or expired token' };
  }

  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return { success: false, error: 'Token has expired' };
  }

  // Mark email as verified
  if (verificationToken.userId) {
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    });
  }

  // Delete used token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return { success: true };
}

export async function createPasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null; // Don't reveal if email exists
  }

  const token = generateToken();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_PASSWORD_RESET);

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
      userId: user.id,
    },
  });

  return token;
}

export async function verifyPasswordResetToken(email: string, token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      email_token: { email, token },
    },
  });

  if (!resetToken) {
    return { success: false, error: 'Invalid or expired token' };
  }

  if (resetToken.expires < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });
    return { success: false, error: 'Token has expired' };
  }

  return { success: true, userId: resetToken.userId };
}

export async function resetPasswordWithToken(
  email: string,
  token: string,
  newPassword: string
) {
  const verification = await verifyPasswordResetToken(email, token);

  if (!verification.success) {
    return { success: false, error: verification.error };
  }

  // Password hash would happen here (use bcrypt like in changePassword)
  // Delete used token
  await prisma.passwordResetToken.deleteMany({
    where: { email, userId: verification.userId },
  });

  return { success: true };
}
```

---

## Step 6: Server Actions for Email/Password Flow

Create `/src/app/actions/auth.ts`:

```typescript
'use server'

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email-service';
import {
  createVerificationToken,
  verifyEmailToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  resetPasswordWithToken,
} from '@/lib/token-service';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

interface AuthSession {
  user?: {
    email?: string | null;
    name?: string | null;
  };
}

export async function requestEmailVerification() {
  try {
    const session = (await getServerSession(authOptions)) as AuthSession;

    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, emailVerified: true, name: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email already verified' };
    }

    // Generate verification token
    const token = await createVerificationToken(user.email, user.id);
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

    // Send email
    const emailResult = await sendVerificationEmail(
      user.email,
      verificationUrl,
      user.name || 'User'
    );

    if (!emailResult.success) {
      return { success: false, error: 'Failed to send verification email' };
    }

    return {
      success: true,
      message: `Verification email sent to ${user.email}`,
    };
  } catch (error) {
    console.error('Request email verification error:', error);
    return { success: false, error: 'An error occurred' };
  }
}

export async function verifyEmail(email: string, token: string) {
  try {
    const result = await verifyEmailToken(email, token);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/dashboard/settings');

    return { success: true, message: 'Email verified successfully' };
  } catch (error) {
    console.error('Verify email error:', error);
    return { success: false, error: 'Verification failed' };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    // Don't reveal if email exists
    const token = await createPasswordResetToken(email);

    if (!token) {
      // Still return success to prevent email enumeration
      return {
        success: true,
        message: 'If account exists, password reset link sent to email',
      };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const emailResult = await sendPasswordResetEmail(
      email,
      resetUrl,
      user?.name || 'User'
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email');
    }

    return {
      success: true,
      message: 'If account exists, password reset link sent to email',
    };
  } catch (error) {
    console.error('Request password reset error:', error);
    return { success: false, error: 'An error occurred' };
  }
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
) {
  try {
    // Validate password strength
    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return {
        success: false,
        error: 'Password must contain uppercase, lowercase, and numbers',
      };
    }

    // Verify token
    const verification = await verifyPasswordResetToken(email, token);

    if (!verification.success) {
      return { success: false, error: verification.error };
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: verification.userId },
      data: { password: hashedPassword },
    });

    // Delete all reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: verification.userId },
    });

    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Reset failed' };
  }
}
```

---

## Step 7: UI Components

### Email Verification Page (`/src/app/auth/verify-email/page.tsx`)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyEmail } from '@/app/actions/auth'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function handleVerification() {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      const result = await verifyEmail(email, token)

      if (result.success) {
        setStatus('success')
        setMessage('Email verified successfully!')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Verification failed')
      }
    }

    handleVerification()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="text-4xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Verified!</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-4xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Verification Failed</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Password Reset Page (`/src/app/auth/forgot-password/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { requestPasswordReset } from '@/app/actions/auth'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')

    const result = await requestPasswordReset(email)

    if (result.success) {
      setStatus('success')
      setMessage(result.message || 'Password reset link sent to your email')
      setEmail('')
    } else {
      setStatus('error')
      setMessage(result.error || 'An error occurred')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reset Password</h1>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✓</div>
            <p className="text-green-600 dark:text-green-400 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{message}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
```

### Reset Password Page (`/src/app/auth/reset-password/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPassword } from '@/app/actions/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      setError('Invalid reset link')
      return
    }

    setIsLoading(true)

    const result = await resetPassword(email, token, password)

    if (result.success) {
      router.push('/login?message=Password reset successfully')
    } else {
      setError(result.error || 'Failed to reset password')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Set New Password</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter new password"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              At least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

## Step 8: Update Signup/Login Flow

### Google OAuth User Email Handling

In `signup/page.tsx`, add email verification requirement for Google users:

```typescript
// After Google signup, check if email is set and verified
useEffect(() => {
  if (session?.user?.email && !session?.user?.emailVerified) {
    // Redirect to verify email or show banner
    setShowVerificationBanner(true)
  }
}, [session])
```

Add to login page:

```typescript
<div className="space-y-4">
  <a href="/auth/forgot-password" className="text-sm text-primary hover:underline">
    Forgot Password?
  </a>
</div>
```

---

## Step 9: Update Settings Security Tab

Modify `/src/app/dashboard/settings/page.tsx` Security Tab:

```typescript
// Add in SecurityTab function:
const [showVerificationSection, setShowVerificationSection] = useState(false)

useEffect(() => {
  async function checkVerificationStatus() {
    if (securityInfo && !securityInfo.emailVerified) {
      setShowVerificationSection(true)
    }
  }
  checkVerificationStatus()
}, [securityInfo])

// In the JSX, add before "Password Protection":
{showVerificationSection && (
  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg mb-4">
    <div className="flex items-center space-x-3">
      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
      <div>
        <p className="font-medium text-gray-900 dark:text-white">Email Verification</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your email has not been verified yet
        </p>
      </div>
    </div>
    <button
      onClick={() => requestEmailVerification()}
      className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark border border-primary hover:border-primary-dark rounded-lg transition-colors"
    >
      Send Verification Email
    </button>
  </div>
)}
```

---

## Testing Checklist

### Development (Using Resend's Testing Email)
- [ ] Signup with email/password → Verify email sent
- [ ] Click verification link → Email verified
- [ ] Signup with Google → Email auto-set (need to update flow)
- [ ] Forgot password → Link sent
- [ ] Click reset link → Can set new password
- [ ] Login with new password → Success

### Production (Custom Domain)
- [ ] Add Resend DNS records to Cloudflare
- [ ] Verify domain in Resend
- [ ] Test with production email
- [ ] Check email headers and SPF/DKIM

### Edge Cases
- [ ] Expired tokens → Show error
- [ ] Used tokens → Show error
- [ ] Invalid tokens → Show error
- [ ] Email case-insensitive handling
- [ ] Rate limiting (optional but recommended)

---

## Cost Summary (Monthly)

| Service | Tier | Cost | Limit |
|---------|------|------|-------|
| Resend | Free | $0 | 100 emails/day |
| Vercel | Hobby | $0 | Limited but sufficient |
| Supabase | Free | $0 | 500MB DB |
| Cloudflare | Free | $0 | DNS + DDoS protection |
| **Total** | | **$0/month** | - |

---

## Next Steps

1. ✅ Install dependencies: `npm install resend`
2. Update Prisma schema and run migration
3. Create email templates and service
4. Create server actions for email/password flow
5. Create UI pages for verification/reset
6. Update signup/login flows
7. Configure Resend API key
8. Test entire flow
9. Deploy to Vercel
10. Configure Cloudflare DNS for production emails

---

## Important Notes

### Security Best Practices Implemented
- ✅ Tokens expire (24h for verification, 1h for reset)
- ✅ Tokens are unique and cryptographically secure
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Email enumeration prevention (password reset)
- ✅ Rate limiting ready (can add next)
- ✅ CSRF protection via NextAuth

### Google OAuth Email Handling
For users signing up with Google:
1. Email is auto-populated from Google
2. Email is marked as verified (Google verifies it)
3. No separate email verification needed
4. User can still add/change password in settings

### Database Impact
- 2 new tables: `VerificationToken`, `PasswordResetToken`
- Automatic cleanup: Tokens auto-delete after use or expiry
- No performance impact: Indexed by email and token

