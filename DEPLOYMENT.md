# Deployment Guide - IC Cars Dealership

## Quick Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Storage buckets created
- [ ] Environment variables configured
- [ ] Logo uploaded
- [ ] First admin user created
- [ ] Test data added
- [ ] Deployed to Vercel

## Detailed Deployment Steps

### Phase 1: Supabase Setup (15-20 minutes)

#### 1.1 Create Supabase Project
1. Visit https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Name: `ic-cars-dealership`
   - Database Password: (Generate strong password and save it)
   - Region: Choose closest to Pretoria (e.g., South Africa or Europe)
5. Click "Create new project"
6. Wait 2-3 minutes for provisioning

#### 1.2 Execute Database Schema
1. In Supabase dashboard, go to "SQL Editor"
2. Click "New query"
3. Open `supabase/schema.sql` from the project
4. Copy ALL contents
5. Paste into SQL Editor
6. Click "Run"
7. Verify success message
8. Check "Table Editor" to confirm tables exist:
   - users
   - vehicles
   - hero_carousel

#### 1.3 Set Up Storage
1. Go to "Storage" in sidebar
2. Click "New bucket"
3. Create bucket:
   - Name: `vehicle-images`
   - Public: ✅ Enable
4. Click "Create bucket"
5. Repeat for:
   - Name: `hero-images`
   - Public: ✅ Enable

#### 1.4 Get API Credentials
1. Go to "Project Settings" (gear icon)
2. Click "API"
3. Copy and save:
   - Project URL (e.g., https://xxxxx.supabase.co)
   - `anon` `public` key (starts with "eyJ...")
4. Keep these safe for next steps

### Phase 2: Local Setup (10-15 minutes)

#### 2.1 Install Dependencies
```bash
cd ic-cars-dealership
npm install
```

#### 2.2 Configure Environment
1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Replace with your actual values from Step 1.4

#### 2.3 Add Your Logo
1. Save your logo as `logo.png`
2. Place in `/public/logo.png`
3. Ensure it's a PNG with transparent background
4. Recommended size: 120x60 pixels (or 240x120 for retina)

#### 2.4 Test Locally
```bash
npm run dev
```

Visit http://localhost:3000
- Homepage should load (may be empty without data)
- Navigation should show
- No console errors

### Phase 3: Create Admin User (5 minutes)

#### 3.1 Sign Up
1. Go to http://localhost:3000/auth/login
2. Enter your email and password
3. Click "Sign In" (Supabase will create account)
4. Check your email for verification (if required)

#### 3.2 Promote to Admin
1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Run this query (replace with YOUR email):
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

4. Refresh your local app
5. You should now see "Dashboard" in navigation

### Phase 4: Add Initial Data (10 minutes)

#### 4.1 Upload Hero Images
1. Find 3 high-quality car images (1920x600px recommended)
2. In Supabase Dashboard > Storage > `hero-images`
3. Click "Upload file"
4. Upload each image
5. Click on uploaded image > Copy URL

#### 4.2 Create Hero Slides
1. Go to http://localhost:3000/dashboard
2. Click "Hero Carousel" tab
3. Delete default slides or edit them:
   - Title: "Welcome to IC Cars"
   - Subtitle: "Your trusted dealership in Pretoria"
   - Image URL: (paste URL from 4.1)
   - Order: 0
   - Active: ✅
4. Add 2-3 more slides

#### 4.3 Add Sample Vehicles
1. In Dashboard, click "Vehicles" tab
2. Click "Add Vehicle"
3. Fill in details for 3-5 vehicles
4. For images:
   - Upload to Storage > `vehicle-images`
   - Copy URLs
   - Paste in vehicle form
5. Save vehicles

#### 4.4 Test Public Site
1. Visit http://localhost:3000
2. Verify:
   - Hero carousel shows your slides
   - Vehicles appear in "In Stock" section
   - Vehicle cards link to detail pages
   - All details display correctly

### Phase 5: Deploy to Vercel (10 minutes)

#### 5.1 Prepare Code
```bash
# Ensure everything is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 5.2 Deploy
**Option A: GitHub Integration (Recommended)**
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: (your value)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (your value)
6. Click "Deploy"
7. Wait 2-3 minutes

**Option B: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
# Follow prompts, add environment variables when asked
vercel --prod
```

#### 5.3 Verify Deployment
1. Visit your Vercel URL (e.g., https://ic-cars.vercel.app)
2. Check all pages:
   - Homepage ✅
   - All Vehicles ✅
   - Vehicle Detail ✅
   - Contact ✅
   - Login ✅
   - Dashboard (when logged in) ✅

### Phase 6: Post-Deployment (5 minutes)

#### 6.1 Configure Custom Domain (Optional)
1. In Vercel dashboard, go to Project Settings
2. Click "Domains"
3. Add your domain (e.g., www.iccars.co.za)
4. Follow DNS configuration instructions

#### 6.2 Update Supabase URLs (if using custom domain)
1. Go to Supabase Dashboard
2. Project Settings > API
3. Add your domain to allowed URLs
4. Authentication > URL Configuration
5. Add site URL and redirect URLs

#### 6.3 Set Up Email (Optional)
For contact form submissions:
1. Use Vercel Edge Functions, or
2. Integrate with email service (SendGrid, Mailgun), or
3. Use Supabase Edge Functions

## Troubleshooting

### Build Fails
**Error**: Module not found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Error**: Environment variables missing
- Verify all variables are set in Vercel
- Check spelling (NEXT_PUBLIC_ prefix required)
- Redeploy after adding variables

### Images Not Loading
**Problem**: Vehicle or hero images show broken
- Check Supabase Storage bucket is PUBLIC
- Verify Next.js config includes Supabase domain:
```javascript
// next.config.js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
}
```

### Authentication Issues
**Problem**: Can't log in on production
- Verify environment variables are set in Vercel
- Check Supabase Site URL includes production URL
- Ensure email confirmation is handled

### Database Connection Fails
**Problem**: "relation does not exist"
- Schema not fully executed
- Go to SQL Editor
- Run entire schema.sql again
- Check each table in Table Editor

### RLS Prevents Access
**Problem**: "Row level security policy violation"
- Ensure you're logged in
- Verify user has correct role
- Check RLS policies in Supabase
- May need to run schema.sql again

## Maintenance

### Regular Tasks
- **Weekly**: Check for new vehicle submissions
- **Monthly**: Review and update hero carousel
- **Quarterly**: Backup database (Supabase auto-backups)

### Backups
Supabase provides automatic backups, but you can also:
```bash
# Export data
npx supabase db dump > backup.sql
```

### Updates
```bash
# Update dependencies (monthly)
npm outdated
npm update
```

### Monitoring
- Vercel Analytics (built-in)
- Vercel Speed Insights
- Supabase Dashboard > Database > Query Performance

## Security Checklist

- [x] RLS enabled on all tables
- [x] Environment variables secured
- [x] Supabase anon key is safe to expose (public)
- [ ] Configure email rate limiting (Supabase settings)
- [ ] Set up monitoring alerts (Vercel)
- [ ] Regular security updates (npm update)

## Performance Optimization

### Already Implemented
- Image optimization (Next.js)
- Static generation where possible
- Database indexes on common queries

### Additional Optimizations
1. **Enable Vercel Edge Caching**:
   - Automatic for static pages
   - Configure ISR for dynamic pages

2. **Image CDN**:
   - Supabase Storage has built-in CDN
   - Consider Cloudinary for advanced needs

3. **Database**:
   - Monitor slow queries in Supabase
   - Add indexes as needed

## Going Live Checklist

- [ ] All hero slides added with real images
- [ ] At least 10 vehicles in database
- [ ] Logo uploaded and displaying
- [ ] Contact information updated
- [ ] Test all forms
- [ ] Test on mobile devices
- [ ] Test in different browsers
- [ ] Set up custom domain
- [ ] Configure email for contact form
- [ ] Train staff on dashboard usage
- [ ] Create user accounts for agents
- [ ] Document any customizations

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review Vercel deployment logs
3. Check Supabase Dashboard > Logs
4. Verify environment variables

## Success!

Once deployed, your dealership management system is live! Staff can:
- Add and manage vehicles
- Update homepage carousel
- Track inventory
- Manage users (admins)

Customers can:
- Browse all vehicles
- Filter and search
- View detailed vehicle information
- Contact the dealership

---

Happy selling! 🚗✨
