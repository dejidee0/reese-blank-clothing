/*
  # Add 15 More Products to Catalog

  1. New Products
    - 15 additional streetwear products across all categories
    - Mix of featured and non-featured items
    - Diverse price points and styles
    - Premium streetwear aesthetic

  2. Categories Expanded
    - More hoodies and sweatshirts
    - Additional t-shirts and tanks
    - More pants and shorts
    - Expanded jacket collection
    - More footwear options
    - Additional accessories
*/

-- Insert 15 additional products
INSERT INTO products (name, slug, description, price, category, sizes, colors, images, featured) VALUES

-- Hoodies & Sweatshirts
('Oversized Hoodie', 'oversized-hoodie', 'Relaxed fit hoodie with dropped shoulders and premium fleece lining', 94.99, 'Hoodies', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Cream', 'Black', 'Forest Green'], ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'], true),

('Zip-Up Hoodie', 'zip-up-hoodie', 'Classic zip-up hoodie with kangaroo pocket and adjustable hood', 79.99, 'Hoodies', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Gray', 'Navy'], ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'], false),

('Crewneck Sweatshirt', 'crewneck-sweatshirt', 'Minimalist crewneck with embroidered logo and ribbed cuffs', 69.99, 'Hoodies', ARRAY['S', 'M', 'L', 'XL'], ARRAY['White', 'Black', 'Heather Gray'], ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'], true),

-- T-Shirts & Tanks
('Graphic Tee', 'graphic-tee', 'Bold graphic print tee with vintage-inspired artwork', 39.99, 'T-Shirts', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Vintage Blue'], ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'], true),

('Long Sleeve Tee', 'long-sleeve-tee', 'Essential long sleeve tee in heavyweight cotton', 44.99, 'T-Shirts', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Olive'], ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'], false),

('Tank Top', 'tank-top', 'Relaxed fit tank top perfect for layering or solo wear', 29.99, 'T-Shirts', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Gray'], ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'], false),

-- Pants & Shorts
('Jogger Pants', 'jogger-pants', 'Tapered joggers with elastic waistband and ankle cuffs', 89.99, 'Pants', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Gray', 'Navy'], ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'], true),

('Denim Jeans', 'denim-jeans', 'Classic straight-leg denim with modern streetwear fit', 109.99, 'Pants', ARRAY['28', '30', '32', '34', '36'], ARRAY['Black', 'Indigo', 'Light Wash'], ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'], true),

('Cargo Shorts', 'cargo-shorts', 'Tactical-inspired shorts with multiple pockets and utility details', 74.99, 'Pants', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Khaki', 'Olive'], ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'], false),

-- Jackets & Outerwear
('Windbreaker', 'windbreaker', 'Lightweight windbreaker with packable design and water resistance', 134.99, 'Jackets', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Neon Green'], ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'], true),

('Denim Jacket', 'denim-jacket', 'Classic denim jacket with modern cut and premium wash', 119.99, 'Jackets', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Indigo', 'Light Blue'], ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'], false),

('Puffer Vest', 'puffer-vest', 'Insulated puffer vest for layering with streetwear edge', 99.99, 'Jackets', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Olive'], ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'], false),

-- Footwear
('High-Top Sneakers', 'high-top-sneakers', 'Classic high-top sneakers with premium leather construction', 179.99, 'Footwear', ARRAY['7', '8', '9', '10', '11', '12'], ARRAY['White', 'Black', 'Red'], ARRAY['https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'], true),

('Slide Sandals', 'slide-sandals', 'Comfortable slide sandals with cushioned footbed and logo branding', 54.99, 'Footwear', ARRAY['7', '8', '9', '10', '11', '12'], ARRAY['Black', 'White', 'Navy'], ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'], false),

-- Accessories
('Bucket Hat', 'bucket-hat', 'Trendy bucket hat with embroidered details and adjustable chin strap', 49.99, 'Accessories', ARRAY['One Size'], ARRAY['Black', 'Khaki', 'Navy'], ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'], true);

-- Update product metadata for better search and filtering
UPDATE products SET metadata = jsonb_build_object(
  'tags', ARRAY['streetwear', 'premium', 'urban'],
  'season', 'all-season',
  'style', 'contemporary'
) WHERE metadata = '{}' OR metadata IS NULL;