# Vercel Deployment Checklist

## Pre-Deployment

### 1. Code Cleanup
- [x] Remove unused files
- [x] Remove dev dependencies not needed in production
- [x] Create setup.bat for easy setup
- [x] Update README.md

### 2. Environment Variables
Prepare these for Vercel:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL (e.g., https://yourapp.vercel.app)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXT_PUBLIC_SUPABASE_URL` - (Optional) Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - (Optional) Supabase anon key

### 3. Database Setup
- [ ] Create production database (Supabase recommended)
- [ ] Get connection string
- [ ] Test connection locally

## Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Careers customization platform"
git branch -M main
git remote add origin https://github.com/yourusername/careers-customization.git
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add all variables from .env
   - Make sure `NEXTAUTH_URL` points to your Vercel URL

5. Click **Deploy**

#### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
# Follow prompts to link project
# Add environment variables when prompted
```

### 3. Post-Deployment

1. **Update NEXTAUTH_URL**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `NEXTAUTH_URL` to your actual domain (e.g., `https://your-app.vercel.app`)
   - Redeploy

2. **Initialize Database**:
   ```bash
   # Run this after deployment
   npx prisma db push
   ```

3. **Test Your Deployment**:
   - [ ] Visit your production URL
   - [ ] Go to `/signup` and create first account
   - [ ] Test login at `/login`
   - [ ] Access editor at `/{company-slug}/edit`
   - [ ] Customize theme and sections
   - [ ] Publish and verify public page at `/{company-slug}/careers`

### 4. Custom Domain (Optional)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database allows external connections
- For Supabase: Use "Session Pooler" connection string

### Authentication Not Working
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear cookies and try again

### Images Not Loading
- Check next.config.js has correct image domains
- Verify remotePatterns is configured

## Performance Optimization

### After Deployment
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry optional)
- [ ] Monitor database performance
- [ ] Check Lighthouse scores

### Recommended Settings in Vercel
- **Node.js Version**: 18.x or 20.x
- **Regions**: Select closest to your users
- **Cache**: Leave default settings

## Security Checklist
- [ ] NEXTAUTH_SECRET is strong (32+ chars)
- [ ] Database credentials are secure
- [ ] No sensitive data in code
- [ ] Environment variables not exposed in client
- [ ] CORS configured properly

## Monitoring
- [ ] Set up Vercel Analytics
- [ ] Monitor database usage
- [ ] Check error logs regularly
- [ ] Set up uptime monitoring (optional)

## Success!
Your careers page platform should now be live at:
`https://your-app.vercel.app`

First user signup URL: `https://your-app.vercel.app/signup`
