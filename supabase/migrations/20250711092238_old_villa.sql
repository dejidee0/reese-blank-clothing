/*
  # Sample Drops Data

  Insert sample drops for testing VIP access and invite-only features
*/

-- Insert sample drops
INSERT INTO drops (title, description, drop_time, end_time, access_level, max_participants, banner_image) VALUES
(
  'VIP Exclusive: Limited Edition Hoodies',
  'Exclusive drop for VIP members only. Limited to 50 pieces.',
  now() + interval '2 hours',
  now() + interval '1 day',
  'vip',
  50,
  'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'
),
(
  'Member Early Access: Summer Collection',
  'Get early access to our summer collection before public release.',
  now() + interval '6 hours',
  now() + interval '3 days',
  'member',
  200,
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'
),
(
  'Invite Only: Designer Collaboration',
  'Exclusive collaboration with top designers. Invitation required.',
  now() + interval '1 day',
  now() + interval '5 days',
  'invite_only',
  25,
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'
),
(
  'Public Drop: Basic Essentials',
  'Our classic essentials collection available to everyone.',
  now() + interval '30 minutes',
  now() + interval '7 days',
  'public',
  1000,
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'
);

-- Update user_profiles to add ADMIN tier option
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_tier_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_tier_check 
CHECK (tier IN ('Guest', 'Member', 'VIP', 'ADMIN'));

-- Create an admin user for testing (you can update this with your actual user ID)
-- INSERT INTO user_profiles (user_id, tier, total_points) 
-- VALUES ('your-user-id-here', 'ADMIN', 1000)
-- ON CONFLICT (user_id) DO UPDATE SET tier = 'ADMIN';