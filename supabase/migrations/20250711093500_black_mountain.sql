/*
  # Phase 2 Schema - AI Stylist & Fashion Battles

  1. New Tables
    - `closets` - User's virtual wardrobe
    - `battles` - Fashion battle arena
    - `votes` - Battle voting system
    - `points` - Points tracking system

  2. Security
    - Enable RLS on all new tables
    - Add policies for user access control
*/

-- Closets table (virtual wardrobe)
CREATE TABLE IF NOT EXISTS closets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Battles table
CREATE TABLE IF NOT EXISTS battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  look_a_id uuid REFERENCES products(id) ON DELETE CASCADE,
  look_b_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  votes_a integer DEFAULT 0,
  votes_b integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  battle_id uuid REFERENCES battles(id) ON DELETE CASCADE,
  winner_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, battle_id)
);

-- Points table
CREATE TABLE IF NOT EXISTS points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE closets ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own closet" ON closets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view active battles" ON battles FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create battles" ON battles FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view their own votes" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own points" ON points FOR SELECT USING (auth.uid() = user_id);

-- Function to update battle vote counts
CREATE OR REPLACE FUNCTION update_battle_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update vote counts
    UPDATE battles 
    SET 
      votes_a = (SELECT COUNT(*) FROM votes WHERE battle_id = NEW.battle_id AND winner_id = (SELECT look_a_id FROM battles WHERE id = NEW.battle_id)),
      votes_b = (SELECT COUNT(*) FROM votes WHERE battle_id = NEW.battle_id AND winner_id = (SELECT look_b_id FROM battles WHERE id = NEW.battle_id))
    WHERE id = NEW.battle_id;
    
    -- Award points to voter
    INSERT INTO points (user_id, amount, reason) VALUES (NEW.user_id, 10, 'Battle vote');
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vote updates
CREATE OR REPLACE TRIGGER on_vote_cast
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_battle_votes();

-- Function to update user total points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles 
  SET total_points = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM points 
    WHERE user_id = NEW.user_id
  )
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for points updates
CREATE OR REPLACE TRIGGER on_points_change
  AFTER INSERT ON points
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();

-- Insert sample battles
INSERT INTO battles (look_a_id, look_b_id, created_by, title, description) 
SELECT 
  p1.id,
  p2.id,
  (SELECT id FROM auth.users LIMIT 1),
  'Classic vs Modern',
  'Vote for your favorite style: classic streetwear or modern minimalism'
FROM products p1, products p2 
WHERE p1.slug = 'premium-hoodie' AND p2.slug = 'street-tee'
LIMIT 1;

INSERT INTO battles (look_a_id, look_b_id, created_by, title, description) 
SELECT 
  p1.id,
  p2.id,
  (SELECT id FROM auth.users LIMIT 1),
  'Comfort vs Style',
  'Which would you choose for a night out?'
FROM products p1, products p2 
WHERE p1.slug = 'cargo-pants' AND p2.slug = 'bomber-jacket'
LIMIT 1;