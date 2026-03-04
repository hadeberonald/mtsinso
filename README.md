# IC Cars Dealership Management System

A complete, production-ready car dealership management system built with Next.js, Supabase, and Tailwind CSS.

## Features

### Public Features
- **Hero Carousel**: Dynamic carousel on homepage with admin-managed slides
- **Vehicle Browsing**: Browse all available vehicles with advanced filtering
- **Vehicle Details**: Comprehensive vehicle detail pages with image galleries
- **Contact Page**: Contact form and dealership information
- **Responsive Design**: Fully responsive across all devices

### Admin Features
- **User Management**: Add and manage agents and admins
- **Vehicle Management**: Full CRUD operations for vehicles
- **Hero Carousel Management**: Manage homepage carousel slides
- **Role-Based Access**: Separate permissions for admins and agents

### Agent Features
- **Vehicle Management**: Add, edit, and delete their own vehicles
- **Dashboard Access**: View all vehicles and manage inventory

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Deployment**: Vercel-ready

## Design System

### Colors
- **Gold Light**: `#e0ba65`
- **Gold Dark**: `#ab832c`
- **Black**: `#000000`
- **Dark Gray**: `#323232`
- **White**: `#FFFFFF`

### Fonts
- **Display**: Playfair Display (serif) - for headings
- **Body**: Inter (sans-serif) - for body text

### Custom Components
- Angled buttons with hollow and filled variants
- Angled cards with clipped corners
- Custom input fields with angled styling

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Vercel account for deployment (optional)

## Setup Instructions

### 1. Clone and Install

```bash
cd ic-cars-dealership
npm install
```

### 2. Supabase Setup

#### A. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned

#### B. Set Up Database
1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL to create all tables, policies, and indexes

#### C. Configure Storage (for vehicle images)
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `vehicle-images`
3. Set it to **public** (or configure your own access policies)
4. Create another bucket called `hero-images` for carousel images

#### D. Get Your Credentials
1. Go to Project Settings > API
2. Copy your:
   - Project URL
   - `anon` public API key

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Add Logo

Place your `logo.png` file in the `/public` directory. The logo should be:
- Transparent background PNG
- Approximately 120x60 pixels (or similar aspect ratio)
- High resolution for retina displays

### 5. Create First Admin User

1. Start the development server:
```bash
npm run dev
```

2. Go to `http://localhost:3000/auth/login`
3. Click "Sign In" and then create an account with the Supabase Auth UI
4. After creating your account, go to your Supabase dashboard
5. Go to SQL Editor and run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 6. Test the Application

- Visit `http://localhost:3000` to see the homepage
- Login at `/auth/login`
- Access dashboard at `/dashboard`
- Add your first vehicle and hero carousel slide!

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment to Vercel

### Automatic Deployment

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy!

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Project Structure

```
ic-cars-dealership/
├── app/
│   ├── auth/login/          # Authentication pages
│   ├── contact/             # Contact page
│   ├── dashboard/           # Admin/Agent dashboard
│   ├── vehicles/            # Vehicle listing and details
│   │   └── [id]/           # Dynamic vehicle detail page
│   ├── globals.css          # Global styles and custom classes
│   ├── layout.tsx           # Root layout with navigation
│   └── page.tsx             # Homepage with hero and featured vehicles
├── components/
│   ├── Footer.tsx           # Site footer
│   ├── HeroCarousel.tsx     # Homepage hero carousel
│   ├── Navigation.tsx       # Main navigation bar
│   └── VehicleCard.tsx      # Vehicle card component
├── lib/
│   └── supabase.ts          # Supabase client and types
├── public/
│   └── logo.png             # Your dealership logo
├── supabase/
│   └── schema.sql           # Database schema
├── .env.local.example       # Environment variables template
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Database Schema

### Tables

#### `users`
- Links to Supabase Auth
- Stores user roles (admin/agent)
- Tracks user information

#### `vehicles`
- Comprehensive vehicle information
- Image URLs array
- Finance information
- Status tracking (available/sold/reserved)
- Creator tracking

#### `hero_carousel`
- Homepage carousel slides
- Order management
- Active/inactive status

### Row Level Security (RLS)

The database uses RLS policies to ensure:
- Public users can view available vehicles and active hero slides
- Authenticated users can manage their own vehicles
- Admins have full access to all resources
- Agents can manage vehicles but not users or hero carousel

## Usage Guide

### For Admins

1. **Add Agents**: Dashboard > Users tab > Add User
2. **Manage Vehicles**: Dashboard > Vehicles tab
3. **Update Hero Carousel**: Dashboard > Hero Carousel tab
4. **Configure Hero Slides**:
   - Upload images to Supabase Storage
   - Get the public URL
   - Add slide with title, subtitle, and image URL
   - Set order and active status

### For Agents

1. **Add Vehicles**: Dashboard > Vehicles tab > Add Vehicle
2. **Edit Your Vehicles**: Click edit icon on your vehicles
3. **Update Vehicle Status**: Mark as sold/reserved when needed

### Vehicle Images

To add vehicle images:
1. Upload images to Supabase Storage (`vehicle-images` bucket)
2. Get the public URL
3. Add the URL to the vehicle's images array
4. First image in array is the main image

## Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
```javascript
colors: {
  gold: {
    light: '#e0ba65',
    DEFAULT: '#e0ba65',
    dark: '#ab832c',
  },
  // ... add more colors
}
```

### Fonts
Edit `app/layout.tsx` to change fonts:
```typescript
import { YourFont } from 'next/font/google'
```

### Custom Styles
Edit `app/globals.css` to modify button styles, card styles, and more.

## Features Roadmap

Potential enhancements:
- [ ] Image upload directly from dashboard
- [ ] Advanced search with multiple filters
- [ ] Vehicle comparison feature
- [ ] Favorites/saved vehicles
- [ ] Email notifications for enquiries
- [ ] Analytics dashboard
- [ ] Export vehicle data
- [ ] Trade-in calculator
- [ ] Finance calculator
- [ ] Customer testimonials section

## Troubleshooting

### Images not loading
- Check Supabase Storage bucket is public
- Verify image URLs are correct
- Check Next.js config has correct domains

### Authentication issues
- Verify environment variables are set
- Check Supabase project is active
- Ensure RLS policies are created

### Database errors
- Run the schema.sql file completely
- Check all tables were created
- Verify RLS is enabled

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check Next.js documentation

## License

This project is provided as-is for use by IC Cars dealership.

---

Built with ❤️ for IC Cars - Your Trusted Dealership in Pretoria
