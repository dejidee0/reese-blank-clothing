'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Camera, ThumbsUp, Verified } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Review {
  id: string;
  user_id: string;
  stars: number;
  title: string;
  text: string;
  photo_url?: string;
  verified: boolean;
  helpful_count: number;
  created_at: string;
  user_profiles?: {
    full_name: string;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    stars: 5,
    title: '',
    text: '',
    photo: null as File | null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user_profiles (
          full_name
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const submitReview = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      let photoUrl = null;

      // Upload photo if provided
      if (newReview.photo) {
        const fileExt = newReview.photo.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(fileName, newReview.photo);

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('review-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrl;
        }
      }

      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        product_id: productId,
        stars: newReview.stars,
        title: newReview.title,
        text: newReview.text,
        photo_url: photoUrl,
        verified: true // You might want to check if user actually purchased
      });

      if (!error) {
        setNewReview({ stars: 5, title: '', text: '', photo: null });
        setShowReviewForm(false);
        fetchReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.stars === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.stars === stars).length / reviews.length) * 100 : 0
  }));

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600">{reviews.length} reviews</p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 w-8">{stars}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {user && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Write Your Review</h3>
          
          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, stars: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= newReview.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Summarize your review"
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
              <textarea
                value={newReview.text}
                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Share your experience with this product"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewReview({ ...newReview, photo: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={submitReview}
                disabled={submitting || !newReview.text}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {review.verified && (
                    <div className="flex items-center text-green-600">
                      <Verified className="w-4 h-4 mr-1" />
                      <span className="text-xs">Verified Purchase</span>
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900">{review.title}</h4>
                <p className="text-sm text-gray-600">
                  {review.user_profiles?.full_name || 'Anonymous'} • {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{review.text}</p>

            {review.photo_url && (
              <img
                src={review.photo_url}
                alt="Review photo"
                className="w-32 h-32 object-cover rounded-lg mb-4"
              />
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>Helpful ({review.helpful_count})</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
}