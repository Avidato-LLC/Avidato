/* eslint-disable react/no-unescaped-entities, react/no-unescaped-entities */
import * as React from 'react'

interface VerificationEmailProps {
  verificationUrl: string
  userName?: string
}

export const VerificationEmailTemplate = ({
  verificationUrl,
  userName = 'User',
}: VerificationEmailProps) => (
  <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#3b82f6', marginBottom: '20px' }}>Welcome to Avidato, {userName}!</h2>
      
      <p style={{ marginBottom: '16px' }}>Thanks for signing up. Please verify your email address to get started.</p>
      
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
            cursor: 'pointer',
          }}
        >
          Verify Email Address
        </a>
      </div>

      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        Or copy and paste this link:
      </p>
      <p style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '4px', 
        wordBreak: 'break-all',
        fontSize: '12px',
        color: '#555'
      }}>
        {verificationUrl}
      </p>

      <hr style={{ borderTop: '1px solid #eee', margin: '30px 0' }} />

      <p style={{ color: '#999', fontSize: '12px' }}>
        This link expires in 24 hours. If you didn't create this account, please ignore this email.
      </p>

      <p style={{ color: '#999', fontSize: '12px', marginTop: '20px' }}>
        © 2025 Avidato. All rights reserved.
      </p>
    </div>
  </div>
)

interface PasswordResetEmailProps {
  resetUrl: string
  userName?: string
}

export const PasswordResetEmailTemplate = ({
  resetUrl,
  userName = 'User',
}: PasswordResetEmailProps) => (
  <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#3b82f6', marginBottom: '20px' }}>Password Reset Request</h2>
      
      <p style={{ marginBottom: '16px' }}>Hi {userName},</p>
      
      <p style={{ marginBottom: '16px' }}>
        We received a request to reset your password. Click the button below to proceed.
      </p>
      
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
            cursor: 'pointer',
          }}
        >
          Reset Password
        </a>
      </div>

      <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
        Or copy and paste this link:
      </p>
      <p style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '4px', 
        wordBreak: 'break-all',
        fontSize: '12px',
        color: '#555'
      }}>
        {resetUrl}
      </p>

      <hr style={{ borderTop: '1px solid #eee', margin: '30px 0' }} />

      <p style={{ color: '#999', fontSize: '12px' }}>
        This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
      </p>

      <p style={{ color: '#999', fontSize: '12px', marginTop: '20px' }}>
        © 2025 Avidato. All rights reserved.
      </p>
    </div>
  </div>
)
