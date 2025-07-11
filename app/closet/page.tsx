'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Trash2 } from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import AiStylistModal from '@/components/ai-stylist-modal';
import Image from 'next/image';
import Link from 'next/link';

export default function ClosetPage() {
  const { user } = useAuth();
  const [closetItems, setClosetItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAiStylist, setShowAiStylist] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClosetItems();
    }
  }, [user]);

  const fetchClosetItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('closets')
      .select(`
        id,
        products (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching closet items:', error);
      return;
    }

    const items = data?.map(item => item.products).filter(Boolean) || [];
    setClosetItems(items as Product[]);
    setLoading(false);
  };

  const removeFromCloset = async (productId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('closets')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (!error) {
      setClosetItems(items => items.filter(item => item.id !== productId));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please log in to view your closet</h1>
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Closet</h1>
            <p className="text-gray-600">{closetItems.length} items in your virtual wardrobe</p>
          </div>
          
          {closetItems.length > 0 && (
            <button
              onClick={() => setShowAiStylist(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              AI Stylist
            </button>
          )}
        </motion.div>

        {/* Closet Items */}
        {closetItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your closet is empty</h2>
            <p className="text-gray-600 mb-6">Start adding items you love to build your virtual wardrobe</p>
            <Link
              href="/shop"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {closetItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/product/${item.slug}`}>
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{item.category}</p>
                    <p className="text-lg font-bold text-gray-900">${item.price}</p>
                  </Link>
                </div>

                <button
                  onClick={() => removeFromCloset(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* AI Stylist Modal */}
        {showAiStylist && (
          <AiStylistModal
            closetItems={closetItems}
            onClose={() => setShowAiStylist(false)}
          />
        )}
      </div>
    </div>
  );
}