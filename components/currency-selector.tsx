'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Currency, CURRENCIES } from '@/lib/currency';

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export default function CurrencySelector({ selectedCurrency, onCurrencyChange }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Auto-detect currency on first load
    if (!selectedCurrency) {
      // Default to USD for now, can be enhanced later
      onCurrencyChange('USD');
    }
  }, [selectedCurrency, onCurrencyChange]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-purple-500 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {CURRENCIES[selectedCurrency]?.symbol} {selectedCurrency}
        </span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
          {Object.entries(CURRENCIES).map(([code, config]) => (
            <button
              key={code}
              onClick={() => {
                onCurrencyChange(code as Currency);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                selectedCurrency === code ? 'bg-purple-50 text-purple-600' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{config.symbol} {code}</span>
                <span className="text-sm text-gray-500">{config.name}</span>
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}