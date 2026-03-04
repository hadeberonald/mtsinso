-- IC Cars Dealership Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  mileage DECIMAL(12, 2) NOT NULL CHECK (mileage >= 0),
  description TEXT NOT NULL,
  transmission TEXT NOT NULL CHECK (transmission IN ('Manual', 'Automatic')),
  fuel_type TEXT NOT NULL,
  drivetrain TEXT NOT NULL CHECK (drivetrain IN ('4x2', '4x4')),
  color TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('New', 'Used')),
  aircon BOOLEAN DEFAULT FALSE,
  airbags INTEGER DEFAULT 0 CHECK (airbags >= 0),
  finance_available BOOLEAN DEFAULT FALSE,
  estimated_monthly_payment DECIMAL(12, 2) CHECK (estimated_monthly_payment >= 0),
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero Carousel table
CREATE TABLE hero_carousel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at DESC);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_hero_carousel_active ON hero_carousel(active);
CREATE INDEX idx_hero_carousel_order ON hero_carousel(order_index);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_carousel ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Anyone can view users (for role checking)
CREATE POLICY "Users are viewable by authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert users
CREATE POLICY "Only admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Only admins can delete users
CREATE POLICY "Only admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for vehicles table
-- Everyone can view available vehicles
CREATE POLICY "Vehicles are viewable by everyone"
  ON vehicles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users (agents and admins) can insert vehicles
CREATE POLICY "Authenticated users can insert vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
    )
  );

-- Users can update vehicles they created, admins can update any
CREATE POLICY "Users can update their own vehicles, admins can update any"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Users can delete vehicles they created, admins can delete any
CREATE POLICY "Users can delete their own vehicles, admins can delete any"
  ON vehicles FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for hero_carousel table
-- Everyone can view active hero slides
CREATE POLICY "Hero slides are viewable by everyone"
  ON hero_carousel FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can insert hero slides
CREATE POLICY "Only admins can insert hero slides"
  ON hero_carousel FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Only admins can update hero slides
CREATE POLICY "Only admins can update hero slides"
  ON hero_carousel FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Only admins can delete hero slides
CREATE POLICY "Only admins can delete hero slides"
  ON hero_carousel FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_carousel_updated_at
  BEFORE UPDATE ON hero_carousel
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default hero carousel slides (optional)
INSERT INTO hero_carousel (title, subtitle, image_url, order_index, active) VALUES
  ('Welcome to IC Cars', 'Your trusted dealership in Pretoria. Browse our extensive collection of quality vehicles.', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920', 0, true),
  ('Quality Vehicles', 'Every vehicle is thoroughly inspected and comes with financing options available.', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920', 1, true),
  ('Finance Available', 'Flexible financing options to help you drive your dream car today.', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920', 2, true);

-- Note: You'll need to create your first admin user manually after signing up
-- Run this query after creating your account, replacing 'YOUR_EMAIL' with your email:
-- UPDATE users SET role = 'admin' WHERE email = 'YOUR_EMAIL';
