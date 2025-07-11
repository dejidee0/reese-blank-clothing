import { supabase } from './supabase';
import { Currency, getPaystackAmount, CURRENCIES } from './currency';

export interface PaystackConfig {
  amount: number;
  email: string;
  reference?: string;
  currency?: Currency;
  metadata?: Record<string, any>;
}

export function initializePaystack({
  amount,
  email,
  reference,
  currency = 'NGN',
  metadata = {},
}) {
  const config: PaystackConfig = {
    reference: reference || `reese_${Date.now()}`,
    email,
    amount: getPaystackAmount(amount, currency),
    currency: CURRENCIES[currency].paystack_currency,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    metadata,
    onSuccess: async (transaction: any) => {
      try {
        // Save order to database
        await supabase.from('orders').insert({
          user_id: metadata.userId,
          total_amount: amount,
          currency: currency,
          status: 'completed',
        });
      } catch (error) {
        console.error('Error saving order:', error);
      }
    },
    onCancel: () => {
      console.log('Payment cancelled');
    },
  };

  return config;
}