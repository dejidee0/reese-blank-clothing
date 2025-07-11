'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Shield, Truck, RotateCcw, Star } from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cart';
import Image from 'next/image';
import Link from 'next/link';

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const { user } = useAuth();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [inCloset, setInCloset] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  useEffect(() => {
    if (product && user) {
      checkClosetStatus();
    }
  }, [product, user]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return;
    }

    setProduct(data);
    setLoading(false);
  };

  const checkClosetStatus = async () => {
    if (!user || !product) return;

    const { data } = await supabase
      .from('closets')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .single();

    setInCloset(!!data);
  };

  const toggleCloset = async () => {
    if (!user || !product) return;

    if (inCloset) {
      await supabase
        .from('closets')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      setInCloset(false);
    } else {
      await supabase
        .from('closets')
        .insert({ user_id: user.id, product_id: product.id });
      setInCloset(true);
    }
  };

  const handleAddToCart = () => {
    if (product && selectedSize) {
      addItem({ ...product, selectedSize });
    }
  };

  const handleBuyNow = async () => {
    if (!product || !selectedSize) return;
    
    setPaymentLoading(true);
    
    // Add to cart first
    addItem({ ...product, selectedSize });
    
    // Redirect to cart for checkout
    window.location.href = '/cart';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-purple-600 hover:text-purple-700">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
            >
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              
              {user && (
                <button
                  onClick={toggleCloset}
                  className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      inCloset ? 'text-red-500 fill-current' : 'text-gray-600'
                    }`}
                  />
                </button>
              )}
            </motion.div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-purple-600' : ''
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-purple-600 font-medium">{product.category}</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm text-gray-600">4.8 (124 reviews)</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-2xl font-bold text-gray-900 mb-6">${product.price}</p>
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                <div className="grid grid-cols-4 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 border rounded-lg text-center font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-purple-600 bg-purple-50 text-purple-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleBuyNow}
                  disabled={!selectedSize || paymentLoading}
                  className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? 'Processing...' : 'Buy Now'}
                </button>
                
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Authentic</p>
                  <p className="text-xs text-gray-600">100% Genuine</p>
                </div>
                
                <div className="text-center">
                  <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Fast Delivery</p>
                  <p className="text-xs text-gray-600">2-3 Business Days</p>
                </div>
                
                <div className="text-center">
                  <RotateCcw className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                  <p className="text-xs text-gray-600">30-Day Policy</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}