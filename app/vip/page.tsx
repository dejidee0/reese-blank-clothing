'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Clock, Users, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import VipBadge from '@/components/vip-badge';
import Link from 'next/link';

interface Drop {
  id: string;
  title: string;
  description: string;
  drop_time: string;
  end_time: string;
  access_level: string;
  max_participants: number;
  current_participants: number;
  banner_image: string;
}

interface UserProfile {
  tier: 'Guest' | 'Member' | 'VIP' | 'ADMIN';
  total_points: number;
}

export default function VipPage() {
  const { user } = useAuth();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchVipDrops();
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: Record<string, string> = {};
      drops.forEach(drop => {
        const now = new Date().getTime();
        const dropTime = new Date(drop.drop_time).getTime();
        const distance = dropTime - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          newTimeLeft[drop.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
          newTimeLeft[drop.id] = 'LIVE NOW';
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [drops]);

  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('tier, total_points')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setUserProfile(data);
    }
  };

  const fetchVipDrops = async () => {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .in('access_level', ['vip', 'member'])
      .eq('is_active', true)
      .order('drop_time', { ascending: true });

    if (data) {
      setDrops(data);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Please log in to access VIP drops</p>
          <Link
            href="/login"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (userProfile && !['VIP', 'ADMIN'].includes(userProfile.tier)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">VIP Access Required</h1>
          <p className="text-gray-600 mb-6">
            You need VIP status to access exclusive drops. Earn more points to upgrade your tier!
          </p>
          <div className="mb-6">
            <VipBadge tier={userProfile.tier} size="lg" />
            <p className="text-sm text-gray-500 mt-2">
              Current Points: {userProfile.total_points}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            View Dashboard
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-purple-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">VIP Exclusive</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to your exclusive VIP area. Access limited drops and premium collections before anyone else.
          </p>
          {userProfile && (
            <div className="mt-4">
              <VipBadge tier={userProfile.tier} size="lg" />
            </div>
          )}
        </motion.div>

        {/* Drops Grid */}
        {drops.length === 0 ? (
          <div className="text-center py-12">
            <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No VIP Drops Available</h3>
            <p className="text-gray-600">Check back soon for exclusive VIP drops!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {drops.map((drop, index) => (
              <motion.div
                key={drop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <img
                    src={drop.banner_image}
                    alt={drop.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <VipBadge 
                      tier={drop.access_level === 'vip' ? 'VIP' : 'Member'} 
                      size="sm" 
                    />
                  </div>
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {drop.current_participants}/{drop.max_participants} spots
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{drop.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{drop.description}</p>

                  {/* Countdown */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        Drop Time
                      </div>
                      <div className="text-sm font-mono font-bold text-purple-600">
                        {timeLeft[drop.id] || 'Loading...'}
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Participants
                    </div>
                    <span>{drop.current_participants}/{drop.max_participants}</span>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      timeLeft[drop.id] === 'LIVE NOW'
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {timeLeft[drop.id] === 'LIVE NOW' ? 'Shop Now' : 'Set Reminder'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}