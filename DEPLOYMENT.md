# 🚀 Deployment Checklist

Follow these steps to deploy your Gemini Chat Wrapper to production:

## ✅ Prerequisites

1. **Gemini API Key**
   - Go to https://aistudio.google.com/apikey
   - Create a new API key
   - Copy it for later

2. **GitHub Account** (for OAuth)
   - Go to https://github.com/settings/developers
   - Create new OAuth App
   - Set callback URL: `https://YOUR_DOMAIN/api/auth/callback/github`
   - Copy Client ID and Secret

3. **Google Account** (for OAuth - optional)
   - Go to https://console.cloud.google.com
   - Create OAuth credentials
   - Set callback URL: `https://YOUR_DOMAIN/api/auth/callback/google`
   - Copy Client ID and Secret

---

## 📝 Step-by-Step Deployment

### Step 1: Push to GitHub

```bash
cd /home/workspace/gemini-wrapper

# Create GitHub repository first at https://github.com/new
# Repository name: gemini-wrapper
# Make it private or public

# Add your remote
git remote add origin https://github.com/YOUR_USERNAME/gemini-wrapper.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Connect Repository:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Add Environment Variables:**
   
   In Vercel dashboard → Settings → Environment Variables, add:
   
   ```bash
   # Required
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
   NEXTAUTH_URL=https://your-app.vercel.app
   
   # Database (Vercel will auto-create)
   # Just add the Postgres integration
   
   # OAuth (at least one required)
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

3. **Add Vercel Postgres:**
   - In Vercel dashboard, go to Storage
   - Create new Postgres database
   - Connect it to your project
   - Vercel will auto-add the POSTGRES_* variables

4. **Generate NEXTAUTH_SECRET:**
   ```bash
   # Run locally:
   openssl rand -base64 32
   
   # Or use Vercel CLI:
   vercel env add NEXTAUTH_SECRET
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app will be live!

### Step 3: Update OAuth Callbacks

After deployment, update your OAuth app settings:

**GitHub OAuth App:**
- Homepage URL: `https://your-app.vercel.app`
- Callback URL: `https://your-app.vercel.app/api/auth/callback/github`

**Google OAuth:**
- Authorized JavaScript origins: `https://your-app.vercel.app`
- Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`

### Step 4: Initialize Database

After first deployment, run:

```bash
# Local terminal with Vercel CLI
vercel env pull .env.local
npm run db:push
```

Or use Vercel's dashboard terminal.

---

## 🎯 Quick Deploy Commands

If you have Vercel CLI installed:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /home/workspace/gemini-wrapper
vercel

# Add environment variables
vercel env add GEMINI_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET

# Add Postgres
# Go to Vercel dashboard → Storage → Create Database
```

---

## 🔧 Post-Deployment

1. **Test Authentication**
   - Visit your deployed app
   - Try signing in with GitHub/Google
   - Verify you can access the chat

2. **Test Chat Functionality**
   - Send a test message
   - Verify streaming works
   - Check conversation persistence

3. **Configure Custom Domain** (Optional)
   - Go to Vercel dashboard → Settings → Domains
   - Add your custom domain
   - Update NEXTAUTH_URL to match

4. **Monitor Usage**
   - Check Vercel analytics
   - Monitor Gemini API usage at https://aistudio.google.com
   - Set up alerts for API limits

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Check TypeScript errors
npm run build

# Fix linting issues
npm run lint
```

### Database Errors

```bash
# Re-run migrations
npm run db:push

# Check database connection
vercel env pull .env.local
npx drizzle-kit studio
```

### Authentication Issues

- Verify callback URLs match exactly (including https://)
- Check NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches your domain

---

## 📊 Monitoring & Analytics

- **Vercel Analytics**: Enable in Vercel dashboard
- **Error Tracking**: Use Vercel's built-in error logs
- **API Usage**: Monitor at https://aistudio.google.com

---

## 💡 Tips

1. **Free Tier Limits:**
   - Gemini: 1,000 requests/day
   - Vercel: 100GB bandwidth
   - Postgres: 512MB storage

2. **Optimize Performance:**
   - Enable Edge Functions in Vercel
   - Use Vercel's CDN for static assets
   - Implement rate limiting

3. **Security:**
   - Keep API keys secure
   - Enable Vercel's DDoS protection
   - Regular security audits

---

## 🎉 Success!

Your Gemini Chat Wrapper is now live! 

Share your app: `https://your-app.vercel.app`

Need help? Check the README.md or open an issue on GitHub.
