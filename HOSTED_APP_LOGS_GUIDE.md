# Where to Find Logs for Hosted App

## If Deployed on Vercel (Most Likely)

### Option 1: Vercel Dashboard (Best)
1. Go to: https://vercel.com/dashboard
2. Click on your project "Avidato"
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Click **Functions** or **Logs** tab
6. See all errors and logs

### Option 2: Real-time Logs
1. In Vercel dashboard
2. Click **Monitoring** → **Logs**
3. Filter by:
   - **Function Logs** - Server-side errors
   - **Edge Logs** - Middleware errors
   - **Build Logs** - Build errors

---

## If Deployed on Other Platforms

### AWS/Lambda
- CloudWatch Logs: https://console.aws.amazon.com/cloudwatch
- Look for `/aws/lambda/your-function-name`

### Docker/Self-hosted
- SSH into server
- Check logs: `docker logs container-name`
- Or: `tail -f /var/log/app.log`

### Railway/Render
- Go to their dashboard
- Click your app
- Click **Logs** tab

---

## Error: "Failed to Generate Lesson Plan"

This error likely comes from:

1. **Gemini API failing**
   - Check: `GOOGLE_API_KEY` in Vercel environment variables
   - Make sure key is valid and has quota
   - Check Google API console for errors

2. **Database issue**
   - Check: `DATABASE_URL` connection
   - Verify Supabase is running
   - Check network connectivity

3. **Server error**
   - Check function logs in Vercel
   - Look for error messages with stack trace

---

## How to Debug

### Step 1: Check Vercel Logs
1. Go to Vercel dashboard
2. Your project → Deployments
3. Latest deployment → Functions tab
4. Look for error with full stack trace

### Step 2: Check Environment Variables
1. Vercel dashboard
2. Settings → Environment Variables
3. Verify all keys are set:
   - ✅ GOOGLE_API_KEY
   - ✅ NEXTAUTH_SECRET
   - ✅ DATABASE_URL
   - ✅ RESEND_API_KEY

### Step 3: Check API Quota
1. Google Cloud Console: https://console.cloud.google.com
2. APIs & Services → Quotas
3. Check if Gemini API has quota remaining

---

## Example: Finding the Error

**In Vercel Logs you'll see:**

```
Error: Failed to generate lesson plan
  at /var/task/ai-generation.ts:45:23
  Error: GOOGLE_API_KEY is not set
    at getGeminiClient (/var/task/lib/gemini.ts:12:5)
```

This tells you: **Missing Google API key in production**

---

## Quick Checklist

- [ ] Go to Vercel dashboard
- [ ] Click your project
- [ ] Click latest deployment
- [ ] Click "Functions" tab
- [ ] Look for red error entries
- [ ] Read the error message
- [ ] Check if API key/env variable is the issue
- [ ] Update environment variable if needed
- [ ] Redeploy

---

## Check These Files in Your App

**For Lesson Generation:**
- `src/lib/gemini.ts` - Gemini API setup
- `src/app/actions/ai-generation.ts` - Lesson generation logic
- `src/app/api/lessons/route.ts` - API endpoint

Look for error handling and logging.

---

## Add More Logging

To better debug, add logging to your code:

```typescript
// src/lib/gemini.ts
export async function generateLesson(prompt: string) {
  try {
    console.log('Starting lesson generation...', { prompt })
    console.log('API Key exists:', !!process.env.GOOGLE_API_KEY)
    
    const result = await gemini.generateContent(prompt)
    
    console.log('Lesson generated successfully')
    return result
  } catch (error) {
    console.error('Lesson generation failed:', error)
    throw error
  }
}
```

Then check Vercel logs to see these console.log messages.

---

## Need Help?

**Share:**
1. The exact error message from Vercel logs
2. Which API is failing (Gemini? Database? etc.)
3. Your deployment platform (Vercel, AWS, etc.)

I can help debug from there!
