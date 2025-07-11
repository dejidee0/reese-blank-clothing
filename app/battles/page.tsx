'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sword, Trophy, Clock, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import BattleCard from '@/components/battle-card';

interface Battle {
  id: string;
  title: string;
  description: string;
  look_a_id: string;
  look_b_id: string;
  votes_a: number;
  votes_b: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  products_a: any;
  products_b: any;
  user_vote?: string;
}

export default function BattlesPage() {
  const { user } = useAuth();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ votes: 0, points: 0 });

  useEffect(() => {
    fetchBattles();
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  useEffect(() => {
    if (battles.length > 0) {
      // Subscribe to real-time updates
      const subscription = supabase
        .channel('battles')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'battles' },
          () => fetchBattles()
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'votes' },
          () => fetchBattles()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [battles.length]);

  const fetchBattles = async () => {
    const { data, error } = await supabase
      .from('battles')
      .select(`
        *,
        products_a:products!battles_look_a_id_fkey(*),
        products_b:products!battles_look_b_id_fkey(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching battles:', error);
      return;
    }

    // Get user votes if logged in
    if (user && data) {
      const battleIds = data.map(battle => battle.id);
      const { data: votes } = await supabase
        .from('votes')
        .select('battle_id, winner_id')
        .eq('user_id', user.id)
        .in('battle_id', battleIds);

      const battlesWithVotes = data.map(battle => ({
        ...battle,
        user_vote: votes?.find(vote => vote.battle_id === battle.id)?.winner_id
      }));

      setBattles(battlesWithVotes);
    } else {
      setBattles(data || []);
    }

    setLoading(false);
  };

  const fetchUserStats = async () => {
    if (!user) return;

    const { count: votesCount } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { data: pointsData } = await supabase
      .from('points')
      .select('amount')
      .eq('user_id', user.id)
      .eq('reason', 'Battle vote');

    const totalPoints = pointsData?.reduce((sum, point) => sum + point.amount, 0) || 0;

    setUserStats({
      votes: votesCount || 0,
      points: totalPoints
    });
  };

  const handleVote = async (battleId: string, winnerId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { error } = await supabase
      .from('votes')
      .insert({
        user_id: user.id,
        battle_id: battleId,
        winner_id: winnerId
      });

    if (!error) {
      fetchBattles();
      fetchUserStats();
    }
  };

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
            <Sword className="w-8 h-8 text-purple-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">Fashion Battles</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vote for your favorite looks and earn points! Help decide what's trending in streetwear.
          </p>
        </motion.div>

        {/* User Stats */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center">
              <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.votes}</div>
              <div className="text-purple-600 font-medium">Battles Voted</div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.points}</div>
              <div className="text-orange-600 font-medium">Points Earned</div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{battles.length}</div>
              <div className="text-green-600 font-medium">Active Battles</div>
            </div>
          </motion.div>
        )}

        {/* Battles Grid */}
        {battles.length === 0 ? (
          <div className="text-center py-16">
            <Sword className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No active battles</h2>
            <p className="text-gray-600">Check back soon for new fashion battles!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {battles.map((battle, index) => (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BattleCard
                  battle={battle}
                  onVote={handleVote}
                  userVote={battle.user_vote}
                  isLoggedIn={!!user}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}