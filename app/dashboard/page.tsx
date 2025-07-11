'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, ShoppingBag, Heart, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import VipBadge from '@/components/vip-badge';
import Link from 'next/link';

interface UserStats {
  totalPoints: number;
  tier: string;
  closetItems: number;
  battlesVoted: number;
  ordersCount: number;
}

interface Activity {
  id: string;
  reason: string;
  amount: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    tier: 'Guest',
    closetItems: 0,
    battlesVoted: 0,
    ordersCount: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchRecentActivity();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_points, tier')
        .eq('user_id', user.id)
        .single();

      // Get closet count
      const { count: closetCount } = await supabase
        .from('closets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get votes count
      const { count: votesCount } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        totalPoints: profile?.total_points || 0,
        tier: profile?.tier || 'Guest',
        closetItems: closetCount || 0,
        battlesVoted: votesCount || 0,
        ordersCount: ordersCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('points')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setActivities(data);
    }
    setLoading(false);
  };

  const getTierProgress = () => {
    const tiers = {
      'Guest': { min: 0, max: 100, next: 'Member' },
      'Member': { min: 100, max: 500, next: 'VIP' },
      'VIP': { min: 500, max: 1000, next: 'Elite' },
      'ADMIN': { min: 1000, max: 1000, next: 'Max Level' }
    };

    const currentTier = tiers[stats.tier as keyof typeof tiers] || tiers.Guest;
    const progress = Math.min(((stats.totalPoints - currentTier.min) / (currentTier.max - currentTier.min)) * 100, 100);
    
    return { ...currentTier, progress };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your dashboard</h1>
          <Link href="/login" className="text-purple-600 hover:text-purple-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const tierProgress = getTierProgress();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.email?.split('@')[0]}!
              </h1>
              <div className="flex items-center space-x-4">
                <VipBadge tier={stats.tier as any} />
                <span className="text-gray-600">{stats.totalPoints} points</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tier Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl p-6 text-white mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Tier Progress</h2>
            <Trophy className="w-6 h-6" />
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>{stats.tier}</span>
              <span>Next: {tierProgress.next}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${tierProgress.progress}%` }}
              />
            </div>
          </div>
          
          <p className="text-sm text-white/80">
            {tierProgress.max - stats.totalPoints} points to {tierProgress.next}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalPoints}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Points</h3>
            <p className="text-gray-600">Earned from activities</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.closetItems}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Closet Items</h3>
            <p className="text-gray-600">Saved favorites</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.battlesVoted}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Battles Voted</h3>
            <p className="text-gray-600">Fashion battles</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.ordersCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
            <p className="text-gray-600">Total purchases</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Link
            href="/closet"
            className="bg-purple-50 border border-purple-200 rounded-2xl p-6 hover:bg-purple-100 transition-colors group"
          >
            <Heart className="w-8 h-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Closet</h3>
            <p className="text-gray-600">View your saved items and get AI styling tips</p>
          </Link>

          <Link
            href="/battles"
            className="bg-orange-50 border border-orange-200 rounded-2xl p-6 hover:bg-orange-100 transition-colors group"
          >
            <Star className="w-8 h-8 text-orange-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fashion Battles</h3>
            <p className="text-gray-600">Vote on style battles and earn points</p>
          </Link>

          <Link
            href="/vip"
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 hover:bg-yellow-100 transition-colors group"
          >
            <Trophy className="w-8 h-8 text-yellow-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">VIP Access</h3>
            <p className="text-gray-600">Exclusive drops and member benefits</p>
          </Link>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white border border-gray-200 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          {activities.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{activity.reason}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-green-600 font-semibold">+{activity.amount} pts</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}