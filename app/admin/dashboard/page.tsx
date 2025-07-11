'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Package, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import VipBadge from '@/components/vip-badge';

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

interface Drop {
  id: string;
  title: string;
  description: string;
  drop_time: string;
  access_level: string;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0
  });
  const [drops, setDrops] = useState<Drop[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDrop, setShowCreateDrop] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
      fetchStats();
      fetchDrops();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setUserProfile(data);
      if (data.tier !== 'ADMIN') {
        // Redirect non-admin users
        window.location.href = '/dashboard';
      }
    }
  };

  const fetchStats = async () => {
    try {
      // Get user count
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Get order count
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Calculate total revenue (simplified)
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount');

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        totalOrders: orderCount || 0,
        totalProducts: productCount || 0,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDrops = async () => {
    const { data, error } = await supabase
      .from('drops')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setDrops(data);
    }
    setLoading(false);
  };

  const toggleDropStatus = async (dropId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('drops')
      .update({ is_active: !currentStatus })
      .eq('id', dropId);

    if (!error) {
      fetchDrops();
    }
  };

  if (!user || (userProfile && userProfile.tier !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin access required</p>
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
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-orange-600 mr-2" />
              <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <VipBadge tier="ADMIN" size="lg" />
          </div>
          <button
            onClick={() => setShowCreateDrop(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Drop
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
          >
            <Users className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
            <p className="text-blue-100">Total Users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white"
          >
            <Package className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
            <p className="text-green-100">Total Orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
          >
            <Package className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
            <p className="text-purple-100">Total Products</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white"
          >
            <TrendingUp className="w-8 h-8 mb-4" />
            <h3 className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-orange-100">Total Revenue</p>
          </motion.div>
        </div>

        {/* Drops Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Drops</h2>
          
          {drops.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Drops Created</h3>
              <p className="text-gray-600">Create your first drop to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Access Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Participants</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Drop Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drops.map((drop) => (
                    <tr key={drop.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{drop.title}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">{drop.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <VipBadge 
                          tier={drop.access_level === 'vip' ? 'VIP' : drop.access_level === 'member' ? 'Member' : 'Guest'} 
                          size="sm" 
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {drop.current_participants}/{drop.max_participants}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(drop.drop_time).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            drop.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {drop.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleDropStatus(drop.id, drop.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              drop.is_active
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {drop.is_active ? <Trash2 className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}