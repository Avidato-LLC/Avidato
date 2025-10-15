#!/bin/bash

# GitHub Issues Creation Script for Settings Page & Enhanced Authentication
# Run this script to create the new issues after authentication system completion

echo "🚀 Creating GitHub Issues for Settings Page & Enhanced Authentication..."

# First, create the labels we need
echo "📋 Creating labels..."

gh label create "auth" --color "0366d6" --description "Authentication related" 2>/dev/null || echo "Label 'auth' already exists"
gh label create "security" --color "d73a4a" --description "Security features" 2>/dev/null || echo "Label 'security' already exists"
gh label create "feature" --color "a2eeef" --description "New feature" 2>/dev/null || echo "Label 'feature' already exists"
gh label create "high-priority" --color "b60205" --description "High priority task" 2>/dev/null || echo "Label 'high-priority' already exists"
gh label create "medium-priority" --color "fbca04" --description "Medium priority task" 2>/dev/null || echo "Label 'medium-priority' already exists"
gh label create "low-priority" --color "0e8a16" --description "Low priority task" 2>/dev/null || echo "Label 'low-priority' already exists"
gh label create "ui" --color "c5def5" --description "User interface" 2>/dev/null || echo "Label 'ui' already exists"
gh label create "settings" --color "006b75" --description "Settings page" 2>/dev/null || echo "Label 'settings' already exists"
gh label create "profile" --color "5319e7" --description "User profile" 2>/dev/null || echo "Label 'profile' already exists"
gh label create "email" --color "f9d0c4" --description "Email service" 2>/dev/null || echo "Label 'email' already exists"
gh label create "infrastructure" --color "fef2c0" --description "Infrastructure" 2>/dev/null || echo "Label 'infrastructure' already exists"

echo "✅ Labels created/verified"
echo ""

# Issue 1: Password Reset Flow
echo "Creating Issue 1: Password Reset Flow..."
gh issue create \
  --title "Feat(Auth): Implement Password Reset Flow with Industry Standards" \
  --body "**Goal:** Add secure password reset functionality following security best practices.

**Key Steps:**
1. Create password reset token model in Prisma schema with expiration
2. Build \`/forgot-password\` page with email input form  
3. Create server action to generate secure reset tokens (crypto.randomBytes)
4. Implement email sending service (Nodemailer/Resend) with reset links
5. Create \`/reset-password/[token]\` page to handle password updates
6. Add token validation, expiration checks, and secure password hashing
7. Include rate limiting to prevent abuse (max 3 requests per hour)
8. Add proper error handling and user feedback

**Security Requirements:**
- Tokens expire after 1 hour
- Single-use tokens (invalidated after use)  
- Secure random token generation (32+ bytes)
- Rate limiting on reset requests
- No user enumeration (same response for valid/invalid emails)

**Acceptance Criteria:**
- [ ] PasswordResetToken model added to Prisma schema
- [ ] /forgot-password page with email form
- [ ] /reset-password/[token] page for password updates
- [ ] Secure token generation and validation
- [ ] Email service integration (Resend/Nodemailer)
- [ ] Rate limiting implementation
- [ ] Security validations and error handling
- [ ] User feedback and success messages" \
  --label "auth,security,feature,high-priority"

echo "✅ Created Issue: Password Reset Flow"

# Issue 2: Settings Page
echo "Creating Issue 2: Settings Page..."
gh issue create \
  --title "Feat(Settings): Create Tutor Settings/Profile Management Page" \
  --body "**Goal:** Build comprehensive settings page for tutor profile management.

**Key Steps:**
1. Create \`/dashboard/settings\` route and page
2. Implement tabbed interface: Profile, Security, Account Linking
3. **Profile Tab:**
   - Update display name, email, profile picture
   - Change username (unique validation)
   - Bio/description field for tutor profile
4. **Security Tab:**
   - Change password (for credential users)
   - Set password (for OAuth-only users)  
   - Two-factor authentication setup (future)
   - Active sessions management
5. **Account Linking Tab:**
   - Connect/disconnect Google account
   - Show linked providers
   - Account merge functionality
6. Form validation with proper error handling
7. Success/error toast notifications
8. Responsive design for mobile/desktop

**Acceptance Criteria:**
- [ ] /dashboard/settings route created
- [ ] Tabbed interface implementation
- [ ] Profile management forms with validation
- [ ] Security settings with password management
- [ ] Account linking interface
- [ ] Toast notifications for user feedback
- [ ] Responsive design for all screen sizes
- [ ] Error handling and form validation" \
  --label "ui,settings,profile,feature,medium-priority"

echo "✅ Created Issue: Settings Page"

# Issue 3: Account Linking
echo "Creating Issue 3: Account Linking..."
gh issue create \
  --title "Feat(Auth): Account Linking & Provider Management" \
  --body "**Goal:** Allow users to link/unlink authentication providers (Google + email/password).

**Dependencies:** Settings page

**Key Steps:**
1. Extend User model to track authentication methods
2. Create server actions for:
   - Linking Google account to existing email/password account
   - Setting password for OAuth-only users
   - Unlinking providers (with safety checks)
3. Add provider status indicators in settings
4. Implement account merge logic for duplicate emails
5. Add security confirmations for account changes
6. Prevent users from removing their only authentication method

**Security Features:**
- Email verification for new email addresses
- Password confirmation for sensitive changes
- Audit log of account modifications

**Acceptance Criteria:**
- [ ] User model extended for authentication tracking
- [ ] Account linking server actions
- [ ] Provider status indicators in UI
- [ ] Account merge functionality
- [ ] Security confirmations for changes
- [ ] Prevention of removing only auth method
- [ ] Email verification for new emails
- [ ] Audit logging for security" \
  --label "auth,security,feature,medium-priority"

echo "✅ Created Issue: Account Linking"

# Issue 4: Email Service
echo "Creating Issue 4: Email Service..."
gh issue create \
  --title "Feat(Email): Setup Transactional Email Service" \
  --body "**Goal:** Implement reliable email service for password resets and notifications.

**Key Steps:**
1. Choose email provider (Resend/SendGrid/Nodemailer+SMTP)
2. Set up email templates for:
   - Password reset emails
   - Email verification
   - Account linking confirmations
   - Security notifications
3. Configure environment variables for email service
4. Create reusable email utility functions
5. Add email queue for reliability (future: Redis/Bull)
6. Implement email delivery tracking and error handling

**Note:** Can be implemented locally with development SMTP or email service API keys

**Acceptance Criteria:**
- [ ] Email service provider selected and configured
- [ ] Email templates created for all use cases
- [ ] Environment variables configured
- [ ] Reusable email utility functions
- [ ] Email delivery tracking
- [ ] Error handling and retry logic
- [ ] Development/testing email setup" \
  --label "email,infrastructure,feature,low-priority"

echo "✅ Created Issue: Email Service"

echo ""
echo "🎉 All GitHub issues created successfully!"
echo ""
echo "📋 Issues created:"
echo "1. Password Reset Flow (High Priority)"
echo "2. Settings Page (Medium Priority)"  
echo "3. Account Linking (Medium Priority)"
echo "4. Email Service (Low Priority)"
echo ""
echo "🚀 Ready to start development!"