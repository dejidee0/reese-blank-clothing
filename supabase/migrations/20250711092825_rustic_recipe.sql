/*
  # Sample Reviews Data

  Insert sample reviews for testing the review system
*/

-- Insert sample reviews (you'll need to replace user IDs with actual ones)
INSERT INTO reviews (user_id, product_id, stars, title, text, verified) 
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  p.id,
  (ARRAY[4, 5, 5, 4, 5])[floor(random() * 5 + 1)],
  (ARRAY['Great quality!', 'Love the fit', 'Perfect for streetwear', 'Exceeded expectations', 'Highly recommend'])[floor(random() * 5 + 1)],
  (ARRAY[
    'The material quality is outstanding and the fit is perfect. Definitely worth the investment.',
    'Comfortable and stylish. Gets compliments every time I wear it.',
    'Great addition to my wardrobe. The design is unique and well-executed.',
    'Fast shipping and excellent quality. Will definitely order again.',
    'Perfect fit and the color is exactly as shown. Very satisfied with this purchase.'
  ])[floor(random() * 5 + 1)],
  true
FROM products p
LIMIT 10
ON CONFLICT (user_id, product_id) DO NOTHING;

-- Insert sample AI captions
INSERT INTO captions (product_id, caption_type, content, is_active)
SELECT 
  id,
  'description',
  'Crafted with premium materials and attention to detail, this piece embodies the perfect blend of streetwear aesthetics and contemporary fashion. Designed for the modern individual who values both style and comfort.',
  true
FROM products
LIMIT 5
ON CONFLICT (product_id, caption_type) DO NOTHING;