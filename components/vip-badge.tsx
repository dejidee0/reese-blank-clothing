'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Shield } from 'lucide-react';

interface VipBadgeProps {
  tier: 'Guest' | 'Member' | 'VIP' | 'ADMIN';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function VipBadge({ tier, size = 'md', showLabel = true }: VipBadgeProps) {
  const configs = {
    Guest: {
      icon: Shield,
      color: 'text-gray-500',
      bg: 'bg-gray-100',
      label: 'Guest'
    },
    Member: {
      icon: Star,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      label: 'Member'
    },
    VIP: {
      icon: Crown,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      label: 'VIP'
    },
    ADMIN: {
      icon: Crown,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      label: 'Admin'
    }
  };

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const config = configs[tier];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${config.bg}`}
    >
      <Icon className={`${sizes[size]} ${config.color}`} />
      {showLabel && (
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
    </motion.div>
  );
}