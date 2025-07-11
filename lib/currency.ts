import { headers } from 'next/headers';
import geoip from 'geoip-lite';

export type Currency = 'NGN' | 'USD';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  paystack_currency: string;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    paystack_currency: 'NGN'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    paystack_currency: 'USD'
  }
};

export const EXCHANGE_RATES: Record<Currency, number> = {
  NGN: 1,
  USD: 0.0013 // 1 NGN = 0.0013 USD (approximate)
};

export function detectCurrencyFromIP(): Currency {
  try {
    // Try to get country from headers first
    try {
      const headersList = headers();
      const country = headersList.get('cf-ipcountry') || 
                     headersList.get('x-vercel-ip-country');
      
      if (country) {
        return country === 'NG' ? 'NGN' : 'USD';
      }
    } catch (headerError) {
      // Headers might not be available in client-side context
    }
    
    // Fallback to client-side detection or default
    if (typeof window !== 'undefined') {
      // Client-side: use timezone as fallback
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.includes('Lagos') || timezone.includes('Africa')) {
        return 'NGN';
      }
    }
    
    return 'USD'; // Default fallback
  } catch {
    return 'USD'; // Default fallback
  }
}

export function convertPrice(basePrice: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return basePrice;
  
  // Convert to NGN first, then to target currency
  const priceInNGN = fromCurrency === 'NGN' ? basePrice : basePrice / EXCHANGE_RATES[fromCurrency];
  const convertedPrice = toCurrency === 'NGN' ? priceInNGN : priceInNGN * EXCHANGE_RATES[toCurrency];
  
  return Math.round(convertedPrice * 100) / 100;
}

export function formatPrice(price: number, currency: Currency): string {
  const config = CURRENCIES[currency];
  return `${config.symbol}${price.toLocaleString()}`;
}

export function getPaystackAmount(price: number, currency: Currency): number {
  // Paystack expects amount in kobo for NGN, cents for USD
  return Math.round(price * 100);
}