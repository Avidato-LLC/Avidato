import { Resend } from 'resend'
import React from 'react'
import { VerificationEmailTemplate, PasswordResetEmailTemplate } from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

const getFromEmail = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'
  }
  // In development, check if domain is verified
  // If not, we can only send to the verified sender email
  // For now, use noreply@avidato.com if RESEND_FROM_EMAIL is set
  // Otherwise fall back to onboarding@resend.dev for testing
  const devEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  return devEmail
}

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
      react: React.createElement(VerificationEmailTemplate, {
        verificationUrl,
        userName,
      }),
    })

    if (result.error) {
      console.error('Error sending verification email:', result.error)
      return { success: false, error: result.error }
    }

    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error }
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
      react: React.createElement(PasswordResetEmailTemplate, {
        resetUrl,
        userName,
      }),
    })

    if (result.error) {
      console.error('Error sending password reset email:', result.error)
      return { success: false, error: result.error }
    }

    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error }
  }
}
