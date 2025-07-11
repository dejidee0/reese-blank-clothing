import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  video_url?: string;
  in_stock: boolean;
  featured: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  items: any[];
  total_amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_reference?: string;
  shipping_address?: any;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  tier: 'Guest' | 'Member' | 'VIP' | 'ADMIN';
  total_points: number;
  created_at: string;
  updated_at: string;
};