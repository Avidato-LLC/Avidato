#!/bin/zsh

# Email Verification & Password Reset - Quick Test Guide
# Run these commands to test the implementation

echo "🧪 Email Verification & Password Reset Implementation Test"
echo "=========================================================="
echo ""
echo "This guide helps you test the email verification and password reset flows."
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

echo "1️⃣  Build the application"
echo "   Run: npm run build"
echo "   This will check for any TypeScript errors"
echo ""

echo "2️⃣  Start the development server"
echo "   Run: npm run dev"
echo "   Navigate to: http://localhost:3000"
echo ""

echo "3️⃣  Test Email Verification Flow"
echo "   - Sign up with a new email"
echo "   - Check your email for verification link"
echo "   - Click the link (or use the onboarding@resend.dev email in dev mode)"
echo "   - You should see a verification success page"
echo ""

echo "4️⃣  Test Password Reset Flow"
echo "   - Go to: http://localhost:3000/login"
echo "   - Click 'Forgot password?'"
echo "   - Enter your email"
echo "   - Check email for password reset link"
echo "   - Click the link and set a new password"
echo "   - Log in with new password"
echo ""

echo "5️⃣  Key Test Scenarios"
echo "   ✓ Valid token → success"
echo "   ✓ Expired token → error with 'expired' message"
echo "   ✓ Invalid token → error with 'invalid' message"
echo "   ✓ Missing params → error page"
echo "   ✓ Mismatched passwords → error message"
echo "   ✓ Password too short → error message"
echo ""

echo "6️⃣  Development Email Testing"
echo "   In development, use: onboarding@resend.dev"
echo "   This is Resend's testing email - no actual email sent"
echo "   Check Resend dashboard at: https://resend.com/emails"
echo ""

echo "7️⃣  Environment Variables"
echo "   ✓ RESEND_API_KEY - Set in .env.local"
echo "   ✓ NEXTAUTH_URL - Should be http://localhost:3000 (dev)"
echo "   ✓ NEXTAUTH_SECRET - Already configured"
echo ""

echo "8️⃣  Database Verification"
echo "   Run: npx prisma studio"
echo "   Check tables: VerificationToken, PasswordResetToken"
echo "   These should be empty in a fresh database"
echo ""

echo "✅ Implementation is complete and ready for testing!"
echo ""
