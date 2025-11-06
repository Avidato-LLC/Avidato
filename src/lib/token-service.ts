import { prisma } from './prisma'
import { randomBytes } from 'crypto'

/**
 * Generate a random token for email verification or password reset
 */
function generateToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Create a verification token and store it in the database
 * Tokens expire in 24 hours
 */
export async function createVerificationToken(
  email: string,
  userId?: string
): Promise<{ token: string; expires: Date }> {
  const token = generateToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { email },
  })

  // Create new token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires,
      userId: userId || null,
    },
  })

  return {
    token: verificationToken.token,
    expires: verificationToken.expires,
  }
}

/**
 * Verify an email verification token
 * Returns the email if valid, null if invalid or expired
 */
export async function verifyEmailToken(
  email: string,
  token: string
): Promise<{ valid: boolean; expired: boolean }> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      email,
      token,
    },
  })

  if (!verificationToken) {
    return { valid: false, expired: false }
  }

  const isExpired = new Date() > verificationToken.expires

  if (isExpired) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })
    return { valid: false, expired: true }
  }

  return { valid: true, expired: false }
}

/**
 * Mark email as verified and delete the verification token
 */
export async function confirmEmailVerification(
  email: string,
  token: string
): Promise<boolean> {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email,
        token,
      },
    })

    if (!verificationToken) {
      return false
    }

    // Check if expired
    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      })
      return false
    }

    // Update user's emailVerified status
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    })

    // Delete the token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    return true
  } catch (error) {
    console.error('Error confirming email verification:', error)
    return false
  }
}

/**
 * Create a password reset token and store it in the database
 * Tokens expire in 1 hour
 */
export async function createPasswordResetToken(
  email: string
): Promise<{ token: string; expires: Date } | null> {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return null
  }

  const token = generateToken()
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  })

  // Create new token
  const resetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
      userId: user.id,
    },
  })

  return {
    token: resetToken.token,
    expires: resetToken.expires,
  }
}

/**
 * Verify a password reset token
 * Returns valid/expired status
 */
export async function verifyPasswordResetToken(
  email: string,
  token: string
): Promise<{ valid: boolean; expired: boolean }> {
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      email,
      token,
    },
  })

  if (!resetToken) {
    return { valid: false, expired: false }
  }

  const isExpired = new Date() > resetToken.expires

  if (isExpired) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })
    return { valid: false, expired: true }
  }

  return { valid: true, expired: false }
}

/**
 * Reset password using a valid reset token
 * Updates the user's password and deletes the token
 */
export async function resetPasswordWithToken(
  email: string,
  token: string,
  newPasswordHash: string
): Promise<boolean> {
  try {
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        token,
      },
    })

    if (!resetToken) {
      return false
    }

    // Check if expired
    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return false
    }

    // Update user's password
    await prisma.user.update({
      where: { email },
      data: { password: newPasswordHash },
    })

    // Delete all password reset tokens for this user (security: invalidate all existing tokens)
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    return true
  } catch (error) {
    console.error('Error resetting password:', error)
    return false
  }
}

/**
 * Clean up expired tokens (call this periodically, e.g., via a cron job)
 */
export async function cleanupExpiredTokens(): Promise<{ deleted: number }> {
  const now = new Date()

  const [verificationDeleted, resetDeleted] = await Promise.all([
    prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: now,
        },
      },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        expires: {
          lt: now,
        },
      },
    }),
  ])

  return {
    deleted: verificationDeleted.count + resetDeleted.count,
  }
}
