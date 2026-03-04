# Quick Start Guide - IC Cars Dealership

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
1. Create account at https://supabase.com
2. Create new project
3. Go to SQL Editor
4. Run `supabase/schema.sql`

### 3. Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### 4. Add Logo
Place your `logo.png` in `/public/` folder

### 5. Start Development
```bash
npm run dev
```

### 6. Create Admin User
1. Visit http://localhost:3000/auth/login
2. Create account
3. In Supabase SQL Editor:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 7. Access Dashboard
Go to http://localhost:3000/dashboard and start adding:
- Hero carousel slides
- Vehicles
- Additional users

## Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push

# Deploy on Vercel
# 1. Import GitHub repo on vercel.com
# 2. Add environment variables
# 3. Deploy!
```

## Need Help?

- Full documentation: See `README.md`
- Deployment guide: See `DEPLOYMENT.md`
- Database schema: See `supabase/schema.sql`

## Next Steps

1. **Customize Design**: Edit colors in `tailwind.config.js`
2. **Add Content**: Upload vehicle images to Supabase Storage
3. **Configure Email**: Set up contact form email delivery
4. **Train Staff**: Show agents how to add vehicles
5. **Go Live**: Point your domain to Vercel deployment

---

Need detailed instructions? Check the full README.md file!
