'use server'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

/**
 * Server Actions for Settings/Profile Management
 * 
 * Handles secure profile updates following industry standards:
 * - Input validation with Zod schemas
 * - Authentication verification
 * - Database updates with proper error handling
 * - Path revalidation for fresh data
 */

// Session type for this module
interface AuthSession {
  user?: {
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional()
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export type UpdateProfileData = z.infer<typeof updateProfileSchema>

interface UpdateProfileResult {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

/**
 * Update user profile information
 * Validates input, checks authentication, and updates database
 */
export async function updateProfile(data: UpdateProfileData): Promise<UpdateProfileResult> {
  try {
    // Get current user session
    const session = await getServerSession(authOptions) as AuthSession
    
    if (!session?.user?.email) {
      return {
        success: false,
        message: 'You must be logged in to update your profile'
      }
    }

    // Get user ID from database using email
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!currentUser) {
      return {
        success: false,
        message: 'User not found'
      }
    }

    // Validate input data
    const validationResult = updateProfileSchema.safeParse(data)
    
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Invalid input data',
        errors: validationResult.error.flatten().fieldErrors
      }
    }

    const validatedData = validationResult.data

    // Check if username is taken by another user
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          id: { not: currentUser.id } // Exclude current user
        }
      })

      if (existingUser) {
        return {
          success: false,
          message: 'Username is already taken',
          errors: {
            username: ['This username is already in use']
          }
        }
      }
    }

    // Update user profile
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: validatedData.name,
        username: validatedData.username || null,
        bio: validatedData.bio || null
      }
    })

    // Revalidate the settings page to show fresh data
    revalidatePath('/dashboard/settings')

    return {
      success: true,
      message: 'Profile updated successfully'
    }

  } catch (error) {
    console.error('Profile update error:', error)
    
    return {
      success: false,
      message: 'An error occurred while updating your profile. Please try again.'
    }
  }
}

/**
 * Get current user profile data
 * Returns profile information for the settings form
 */
export async function getUserProfile() {
  try {
    const session = await getServerSession(authOptions) as AuthSession
    
    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        image: true
      }
    })

    return user

  } catch (error) {
    console.error('Get user profile error:', error)
    return null
  }
}

/**
 * Check if a username is available
 * Used for real-time validation in the form
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions) as AuthSession
    
    if (!session?.user?.email) {
      return false
    }

    // Skip check if username is empty
    if (!username || username.trim().length === 0) {
      return true
    }

    // Get current user ID
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!currentUser) {
      return false
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        id: { not: currentUser.id }
      }
    })

    return !existingUser // Return true if username is available

  } catch (error) {
    console.error('Username availability check error:', error)
    return false
  }
}

/**
 * Change user password with current password verification
 * Security requirements:
 * - Verify current password before allowing change
 * - Enforce strong password requirements
 * - Hash new password securely
 * - Invalidate all other sessions (future enhancement)
 */
export async function changePassword(formData: FormData) {
  try {
    // Get current session
    const session = await getServerSession(authOptions) as AuthSession
    if (!session?.user?.email) {
      return { 
        success: false, 
        error: 'Authentication required' 
      }
    }

    // Parse and validate form data
    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string
    }

    const validatedData = changePasswordSchema.parse(rawData)

    // Get current user with password hash
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        password: true,
        email: true,
        name: true
      }
    })

    if (!currentUser) {
      return { 
        success: false, 
        error: 'User not found' 
      }
    }

    // Check if user has a password (might be OAuth-only account)
    if (!currentUser.password) {
      return {
        success: false,
        error: 'This account uses social login. Password cannot be changed.'
      }
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword, 
      currentUser.password
    )

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: 'Current password is incorrect'
      }
    }

    // Ensure new password is different from current
    const isSamePassword = await bcrypt.compare(
      validatedData.newPassword,
      currentUser.password
    )

    if (isSamePassword) {
      return {
        success: false,
        error: 'New password must be different from current password'
      }
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, saltRounds)

    // Update password in database
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { 
        password: hashedNewPassword
      }
    })

    // TODO: In production, consider invalidating all other user sessions
    // This would require implementing session management

    revalidatePath('/dashboard/settings')

    return { 
      success: true, 
      message: 'Password changed successfully' 
    }

  } catch (error) {
    console.error('Password change error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors
      }
    }

    return { 
      success: false, 
      error: 'Failed to change password. Please try again.' 
    }
  }
}

/**
 * Get user's security information
 * Returns account security status and login methods
 */
export async function getSecurityInfo() {
  try {
    const session = await getServerSession(authOptions) as AuthSession
    if (!session?.user?.email) {
      return { 
        success: false, 
        error: 'Authentication required' 
      }
    }

    // Get user with linked accounts
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        password: true,
        emailVerified: true,
        accounts: {
          select: {
            provider: true,
            type: true
          }
        }
      }
    })

    if (!user) {
      return { 
        success: false, 
        error: 'User not found' 
      }
    }

    const securityInfo = {
      hasPassword: !!user.password,
      linkedAccounts: user.accounts.map(account => ({
        provider: account.provider,
        type: account.type
      })),
      emailVerified: !!user.emailVerified,
      email: user.email
    }

    return {
      success: true,
      data: securityInfo
    }

  } catch (error) {
    console.error('Security info error:', error)
    return { 
      success: false, 
      error: 'Failed to retrieve security information' 
    }
  }
}