'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Users, Gift, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { generateReferralCode, getUserReferrals, getReferralLink, Referral } from '@/lib/referrals';

export default function ReferralsPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    if (user) {
      fetchReferrals();
    }
  }, [user]);

  const fetchReferrals = async () => {
    try {
      const userReferrals = await getUserReferrals(user!.id);
      setReferrals(userReferrals);
      
      // Get or create referral code
      if (userReferrals.length > 0) {
        setReferralCode(userReferrals[0].referral_code);
      } else {
        const newCode = await generateReferralCode(user!.id);
        setReferralCode(newCode);
      }

      // Calculate total earned
      const earned = userReferrals
        .filter(ref => ref.status === 'completed')
        .reduce((sum, ref) => sum + ref.bonus_points, 0);
      setTotalEarned(earned);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    const link = getReferralLink(referralCode);
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = async () => {
    const link = getReferralLink(referralCode);
    if (navigator.share) {
      await navigator.share({
        title: 'Join ReeseBlanks',
        text: 'Get exclusive access to premium streetwear and earn points!',
        url: link
      });
    } else {
      copyReferralLink();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600">Please log in to access your referral dashboard</p>
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

  const completedReferrals = referrals.filter(ref => ref.status === 'completed');
  const pendingReferrals = referrals.filter(ref => ref.status === 'pending');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-purple-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">Referral Program</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Invite friends to ReeseBlanks and earn points for every successful referral!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
          >
            <Gift className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">{totalEarned}</h3>
            <p className="text-purple-100">Points Earned</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white"
          >
            <CheckCircle className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">{completedReferrals.length}</h3>
            <p className="text-orange-100">Successful Referrals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
          >
            <Users className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">{pendingReferrals.length}</h3>
            <p className="text-blue-100">Pending Referrals</p>
          </motion.div>
        </div>

        {/* Referral Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Referral Link</h2>
          <p className="text-gray-600 mb-6">
            Share this link with friends to earn 100 points for each successful referral!
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
              <code className="text-sm text-gray-800 break-all">
                {getReferralLink(referralCode)}
              </code>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={copyReferralLink}
                className={`flex items-center px-4 py-3 rounded-lg font-semibold transition-colors ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              
              <button
                onClick={shareReferralLink}
                className="flex items-center px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Share Your Link</h3>
              <p className="text-sm text-gray-600">Send your unique referral link to friends</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Friend Signs Up</h3>
              <p className="text-sm text-gray-600">They create an account using your link</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Earn Rewards</h3>
              <p className="text-sm text-gray-600">Get 100 points, they get 50 welcome points</p>
            </div>
          </div>
        </motion.div>

        {/* Referral History */}
        {referrals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Referral History</h2>
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Referral Code: {referral.referral_code}
                    </p>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        referral.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : referral.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {referral.status}
                    </span>
                    {referral.status === 'completed' && (
                      <p className="text-sm text-green-600 mt-1">
                        +{referral.bonus_points} points
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}