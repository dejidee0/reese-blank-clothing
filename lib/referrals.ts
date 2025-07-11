import { supabase } from './supabase';
import { randomUUID } from 'crypto';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id?: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  bonus_points: number;
  created_at: string;
  completed_at?: string;
}

export async function generateReferralCode(userId: string): Promise<string> {
  const code = `REF-${randomUUID().slice(0, 8).toUpperCase()}`;
  
  const { error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: userId,
      referral_code: code,
      status: 'pending'
    });
  
  if (error) throw error;
  return code;
}

export async function getUserReferrals(userId: string): Promise<Referral[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function processReferralSignup(referralCode: string, newUserId: string): Promise<boolean> {
  try {
    // Find the referral
    const { data: referral, error: findError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referral_code', referralCode)
      .eq('status', 'pending')
      .single();
    
    if (findError || !referral) return false;
    
    // Update referral with new user
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        referred_user_id: newUserId,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', referral.id);
    
    if (updateError) throw updateError;
    
    // Award points to referrer
    await supabase
      .from('points')
      .insert({
        user_id: referral.referrer_id,
        amount: referral.bonus_points,
        reason: 'Referral bonus'
      });
    
    // Award welcome bonus to new user
    await supabase
      .from('points')
      .insert({
        user_id: newUserId,
        amount: 50,
        reason: 'Welcome bonus'
      });
    
    return true;
  } catch (error) {
    console.error('Error processing referral:', error);
    return false;
  }
}

export function getReferralLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}/register?ref=${code}`;
}