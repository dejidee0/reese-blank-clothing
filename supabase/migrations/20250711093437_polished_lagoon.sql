/*
  # Base Schema for ReeseBlanks E-commerce

  1. New Tables
    - `products` - Product catalog with images, pricing, and inventory
    - `orders` - Order management with payment status
    - `user_profiles` - Extended user information with tiers

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  video_url text,
  in_stock boolean DEFAULT true,
  featured boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'NGN',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  payment_reference text,
  shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name text,
  avatar_url text,
  tier text DEFAULT 'Guest' CHECK (tier IN ('Guest', 'Member', 'VIP', 'ADMIN')),
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample products
INSERT INTO products (name, slug, description, price, category, sizes, colors, images, featured) VALUES
('Premium Hoodie', 'premium-hoodie', 'Ultra-soft premium hoodie crafted from organic cotton blend', 89.99, 'Hoodies', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Gray'], ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'], true),
('Street Tee', 'street-tee', 'Classic streetwear tee with modern fit and premium materials', 34.99, 'T-Shirts', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Navy'], ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'], true),
('Cargo Pants', 'cargo-pants', 'Tactical-inspired cargo pants with modern streetwear aesthetic', 124.99, 'Pants', ARRAY['28', '30', '32', '34', '36'], ARRAY['Black', 'Olive', 'Khaki'], ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'], true),
('Bomber Jacket', 'bomber-jacket', 'Classic bomber jacket with contemporary details and premium finish', 159.99, 'Jackets', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Olive'], ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'], true),
('Sneakers', 'premium-sneakers', 'Limited edition sneakers with premium materials and unique design', 199.99, 'Footwear', ARRAY['7', '8', '9', '10', '11', '12'], ARRAY['White', 'Black', 'Gray'], ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'], true),
('Baseball Cap', 'baseball-cap', 'Premium baseball cap with embroidered logo and adjustable fit', 44.99, 'Accessories', ARRAY['One Size'], ARRAY['Black', 'White', 'Navy'], ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'], false);