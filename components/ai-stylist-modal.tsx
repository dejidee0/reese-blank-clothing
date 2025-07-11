'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Loader } from 'lucide-react';
import { Product } from '@/lib/supabase';

interface AiStylistModalProps {
  closetItems: Product[];
  onClose: () => void;
}

export default function AiStylistModal({ closetItems, onClose }: AiStylistModalProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string>('');

  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai-stylist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: closetItems.map(item => ({
            name: item.name,
            category: item.category,
            colors: item.colors,
          }))
        }),
      });

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setRecommendations('Sorry, I couldn\'t generate recommendations at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">AI Stylist</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            I'll analyze your {closetItems.length} closet items and provide personalized styling recommendations!
          </p>
          
          {!recommendations && !loading && (
            <button
              onClick={generateRecommendations}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get AI Recommendations
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-purple-600 animate-spin mr-3" />
            <span className="text-gray-600">Analyzing your style...</span>
          </div>
        )}

        {recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Personal Style Guide</h3>
            <div className="text-gray-700 whitespace-pre-line">{recommendations}</div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}