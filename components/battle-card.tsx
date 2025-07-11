'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import Image from 'next/image';

interface BattleCardProps {
  battle: {
    id: string;
    title: string;
    description: string;
    votes_a: number;
    votes_b: number;
    expires_at: string;
    products_a: any;
    products_b: any;
  };
  onVote: (battleId: string, winnerId: string) => void;
  userVote?: string;
  isLoggedIn: boolean;
}

export default function BattleCard({ battle, onVote, userVote, isLoggedIn }: BattleCardProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(battle.expires_at).getTime();
      const distance = expiry - now;

      if (distance > 0) {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [battle.expires_at]);

  const totalVotes = battle.votes_a + battle.votes_b;
  const percentageA = totalVotes > 0 ? (battle.votes_a / totalVotes) * 100 : 50;
  const percentageB = totalVotes > 0 ? (battle.votes_b / totalVotes) * 100 : 50;

  const hasVoted = !!userVote;
  const votedForA = userVote === battle.products_a?.id;
  const votedForB = userVote === battle.products_b?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg"
    >
      {/* Battle Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{battle.title}</h2>
        <p className="text-gray-600 mb-4">{battle.description}</p>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{timeLeft}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{totalVotes} votes</span>
          </div>
        </div>
      </div>

      {/* Battle Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option A */}
        <div className="relative">
          <button
            onClick={() => !hasVoted && isLoggedIn && onVote(battle.id, battle.products_a?.id)}
            disabled={hasVoted || !isLoggedIn}
            className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
              hasVoted
                ? votedForA
                  ? 'ring-4 ring-green-500'
                  : 'opacity-60'
                : 'hover:scale-105 hover:shadow-lg'
            }`}
          >
            <div className="relative aspect-square bg-gray-100">
              {battle.products_a && (
                <Image
                  src={battle.products_a.images[0]}
                  alt={battle.products_a.name}
                  fill
                  className="object-cover"
                />
              )}
              
              {/* Vote Overlay */}
              {!hasVoted && isLoggedIn && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-semibold text-gray-900">Vote</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-1">
                {battle.products_a?.name || 'Look A'}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {battle.products_a?.category}
              </p>
              <p className="text-lg font-bold text-purple-600">
                {percentageA.toFixed(1)}%
              </p>
            </div>
          </button>

          {/* Vote Bar */}
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentageA}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-purple-600 rounded-full"
            />
          </div>
        </div>

        {/* VS Divider */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-white border-4 border-gray-200 rounded-full w-12 h-12 flex items-center justify-center">
            <span className="font-bold text-gray-600">VS</span>
          </div>
        </div>

        {/* Option B */}
        <div className="relative">
          <button
            onClick={() => !hasVoted && isLoggedIn && onVote(battle.id, battle.products_b?.id)}
            disabled={hasVoted || !isLoggedIn}
            className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
              hasVoted
                ? votedForB
                  ? 'ring-4 ring-green-500'
                  : 'opacity-60'
                : 'hover:scale-105 hover:shadow-lg'
            }`}
          >
            <div className="relative aspect-square bg-gray-100">
              {battle.products_b && (
                <Image
                  src={battle.products_b.images[0]}
                  alt={battle.products_b.name}
                  fill
                  className="object-cover"
                />
              )}
              
              {/* Vote Overlay */}
              {!hasVoted && isLoggedIn && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="font-semibold text-gray-900">Vote</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-1">
                {battle.products_b?.name || 'Look B'}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {battle.products_b?.category}
              </p>
              <p className="text-lg font-bold text-orange-600">
                {percentageB.toFixed(1)}%
              </p>
            </div>
          </button>

          {/* Vote Bar */}
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentageB}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-orange-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Login Prompt */}
      {!isLoggedIn && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-3">Sign in to vote and earn points!</p>
          <a
            href="/login"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In to Vote
          </a>
        </div>
      )}

      {/* Vote Confirmation */}
      {hasVoted && (
        <div className="mt-6 text-center">
          <p className="text-green-600 font-medium">
            ✓ You voted for {votedForA ? battle.products_a?.name : battle.products_b?.name}
          </p>
          <p className="text-sm text-gray-600">+10 points earned!</p>
        </div>
      )}
    </motion.div>
  );
}