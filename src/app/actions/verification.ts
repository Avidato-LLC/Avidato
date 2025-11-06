'use server'

import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import {
  createVerificationToken,
  verifyEmailToken,
  confirmEmailVerification,
  createPasswordResetToken,
  verifyPasswordResetToken,
  resetPasswordWithToken,
} from '@/lib/token-service'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '@/lib/email-service'
import { z } from 'zod'

// Schemas for validation
const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const verifyTokenSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Token is required'),
})

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

/**
 * Request email verification
 * Generates a token and sends verification email
 */
export async function requestEmailVerification(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = emailSchema.parse({ email })

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (!user) {
      // Don't reveal if user exists for security
      return {
        success: true,
        message: 'If an account with this email exists, a verification link has been sent.',
      }
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return {
        success: true,
        message: 'Email is already verified.',
      }
    }

    // Create verification token
    const tokenData = await createVerificationToken(validated.email, user.id)

    // Build verification URL
    const baseUrl = getBaseUrl()
    const verificationUrl = `${baseUrl}/auth/verify-email?email=${encodeURIComponent(validated.email)}&token=${tokenData.token}`

    // Send verification email
    const emailResult = await sendVerificationEmail(
      validated.email,
      verificationUrl,
      user.name || 'User'
    )

    if (!emailResult.success) {
      return {
        success: false,
        message: 'Failed to send verification email. Please try again.',
      }
    }

    return {
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    }
  } catch (error) {
    console.error('Error requesting email verification:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message || 'Validation error',
      }
    }
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    }
  }
}

/**
 * Verify email using token
 * Marks email as verified if token is valid
 */
export async function verifyEmail(
  email: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = verifyTokenSchema.parse({ email, token })

    // Verify token
    const tokenStatus = await verifyEmailToken(validated.email, validated.token)

    if (!tokenStatus.valid) {
      if (tokenStatus.expired) {
        return {
          success: false,
          message: 'Verification link has expired. Please request a new one.',
        }
      }
      return {
        success: false,
        message: 'Invalid verification link.',
      }
    }

    // Confirm email verification
    const confirmed = await confirmEmailVerification(
      validated.email,
      validated.token
    )

    if (!confirmed) {
      return {
        success: false,
        message: 'Failed to verify email. Please try again.',
      }
    }

    return {
      success: true,
      message: 'Email verified successfully!',
    }
  } catch (error) {
    console.error('Error verifying email:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message || 'Validation error',
      }
    }
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    }
  }
}

/**
 * Request password reset
 * Generates a token and sends reset email
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = emailSchema.parse({ email })

    // Create password reset token
    const tokenData = await createPasswordResetToken(validated.email)

    if (!tokenData) {
      // Don't reveal if user exists for security
      return {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      }
    }

    // Get user for personalization
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    // Build reset URL
    const baseUrl = getBaseUrl()
    const resetUrl = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(validated.email)}&token=${tokenData.token}`

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      validated.email,
      resetUrl,
      user?.name || 'User'
    )

    if (!emailResult.success) {
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again.',
      }
    }

    return {
      success: true,
      message: 'Password reset link sent. Please check your inbox.',
    }
  } catch (error) {
    console.error('Error requesting password reset:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message || 'Validation error',
      }
    }
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    }
  }
}

/**
 * Reset password using token
 * Updates password if token is valid
 */
export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = resetPasswordSchema.parse({
      email,
      token,
      password: newPassword,
    })

    // Verify token
    const tokenStatus = await verifyPasswordResetToken(
      validated.email,
      validated.token
    )

    if (!tokenStatus.valid) {
      if (tokenStatus.expired) {
        return {
          success: false,
          message: 'Reset link has expired. Please request a new one.',
        }
      }
      return {
        success: false,
        message: 'Invalid reset link.',
      }
    }

    // Hash new password
    const passwordHash = await hash(validated.password, 12)

    // Reset password with token
    const success = await resetPasswordWithToken(
      validated.email,
      validated.token,
      passwordHash
    )

    if (!success) {
      return {
        success: false,
        message: 'Failed to reset password. Please try again.',
      }
    }

    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message || 'Validation error',
      }
    }
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    }
  }
}
