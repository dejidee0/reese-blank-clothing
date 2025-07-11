/*
  # Phase 4 Database Schema - Reviews, Analytics & Captions

  1. New Tables
    - `reviews` - Product reviews with ratings and photos
    - `analytics` - User behavior tracking
    - `captions` - AI-generated product descriptions
    - `email_subscribers` - Marketing email capture

  2. Security
    - Enable RLS on all new tables
    - Add policies for user access control
    - Verified purchase requirements for reviews

  3. Functions
    - Auto-update product ratings
    - Analytics tracking helpers
*/

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  stars integer NOT NULL CHECK (stars >= 1 AND stars <= 5),
  title text,
  text text,
  photo_url text,
  verified boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Analytics table for user behavior tracking
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  event_type text NOT NULL,
  page_path text,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- AI-generated captions table
CREATE TABLE IF NOT EXISTS captions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  caption_type text DEFAULT 'description' CHECK (caption_type IN ('description', 'social', 'marketing')),
  content text NOT NULL,
  ai_model text DEFAULT 'gpt-4',
  generated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT false,
  UNIQUE(product_id, caption_type)
);

-- Email subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source text DEFAULT 'popup',
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  preferences jsonb DEFAULT '{"marketing": true, "drops": true, "vip": false}'
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can create reviews for purchased products"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE user_id = auth.uid() AND status = 'completed'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for analytics
CREATE POLICY "Users can view their own analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert analytics"
  ON analytics FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS Policies for captions
CREATE POLICY "Anyone can view active captions"
  ON captions FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admins can manage captions"
  ON captions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND tier = 'ADMIN'
    )
  );

-- RLS Policies for email subscribers
CREATE POLICY "Anyone can subscribe"
  ON email_subscribers FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Function to update product average rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the product's average rating
  UPDATE products 
  SET metadata = COALESCE(metadata, '{}'::jsonb) || 
    jsonb_build_object(
      'average_rating', (
        SELECT ROUND(AVG(stars)::numeric, 1)
        FROM reviews 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      ),
      'review_count', (
        SELECT COUNT(*)
        FROM reviews 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
      )
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating product ratings
CREATE OR REPLACE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Function to track page views
CREATE OR REPLACE FUNCTION track_page_view(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_page_path text DEFAULT NULL,
  p_product_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO analytics (user_id, session_id, event_type, page_path, product_id)
  VALUES (p_user_id, p_session_id, 'page_view', p_page_path, p_product_id);
END;
$$ LANGUAGE plpgsql;