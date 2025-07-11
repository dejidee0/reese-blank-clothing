/*
  # Phase 3 Database Schema

  1. New Tables
    - `referrals` - Track user referrals and rewards
    - `waitlists` - Manage drop waitlists and access
    - `drops` - Exclusive drops with access levels
    - `drop_access` - User access permissions for drops

  2. Security
    - Enable RLS on all new tables
    - Add policies for user access control
    - Admin-only access for drops management

  3. Functions
    - Automatic referral bonus processing
    - VIP tier upgrade logic
    - Drop access validation
*/

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  bonus_points integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(referrer_id, referred_user_id)
);

-- Waitlists table
CREATE TABLE IF NOT EXISTS waitlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  drop_id uuid NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'approved', 'rejected')),
  position integer,
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  UNIQUE(email, drop_id)
);

-- Drops table
CREATE TABLE IF NOT EXISTS drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  product_ids uuid[] DEFAULT '{}',
  drop_time timestamptz NOT NULL,
  end_time timestamptz,
  access_level text DEFAULT 'public' CHECK (access_level IN ('public', 'member', 'vip', 'invite_only')),
  max_participants integer,
  current_participants integer DEFAULT 0,
  is_active boolean DEFAULT true,
  banner_image text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Drop access permissions
CREATE TABLE IF NOT EXISTS drop_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid REFERENCES drops(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  access_granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id),
  UNIQUE(drop_id, user_id)
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (referrer_id = auth.uid());

-- RLS Policies for waitlists
CREATE POLICY "Users can view their own waitlist entries"
  ON waitlists FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join waitlists"
  ON waitlists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for drops
CREATE POLICY "Everyone can view active drops"
  ON drops FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage drops"
  ON drops FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND tier = 'ADMIN'
    )
  );

-- RLS Policies for drop_access
CREATE POLICY "Users can view their drop access"
  ON drop_access FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage drop access"
  ON drop_access FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND tier = 'ADMIN'
    )
  );

-- Function to process referral completion
CREATE OR REPLACE FUNCTION process_referral_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update referral status to completed
  UPDATE referrals 
  SET status = 'completed', completed_at = now()
  WHERE referred_user_id = NEW.user_id AND status = 'pending';
  
  -- Award points to referrer
  INSERT INTO points (user_id, amount, reason, created_at)
  SELECT referrer_id, bonus_points, 'Referral bonus', now()
  FROM referrals 
  WHERE referred_user_id = NEW.user_id AND status = 'completed';
  
  -- Award welcome bonus to new user
  INSERT INTO points (user_id, amount, reason, created_at)
  VALUES (NEW.user_id, 50, 'Welcome bonus', now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for referral completion
CREATE OR REPLACE TRIGGER on_user_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION process_referral_completion();

-- Function to check VIP access
CREATE OR REPLACE FUNCTION has_vip_access(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = user_uuid AND tier IN ('VIP', 'ADMIN')
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check drop access
CREATE OR REPLACE FUNCTION can_access_drop(user_uuid uuid, drop_uuid uuid)
RETURNS boolean AS $$
DECLARE
  drop_access_level text;
  user_tier text;
BEGIN
  -- Get drop access level
  SELECT access_level INTO drop_access_level
  FROM drops WHERE id = drop_uuid;
  
  -- Get user tier
  SELECT tier INTO user_tier
  FROM user_profiles WHERE user_id = user_uuid;
  
  -- Check access based on drop level
  CASE drop_access_level
    WHEN 'public' THEN RETURN true;
    WHEN 'member' THEN RETURN user_tier IN ('Member', 'VIP', 'ADMIN');
    WHEN 'vip' THEN RETURN user_tier IN ('VIP', 'ADMIN');
    WHEN 'invite_only' THEN 
      RETURN EXISTS (
        SELECT 1 FROM drop_access 
        WHERE drop_id = drop_uuid AND user_id = user_uuid
      );
    ELSE RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql;