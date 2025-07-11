'use client';

import { motion } from 'framer-motion';
import { Heart, Users, Award, Globe } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About ReeseBlanks
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're redefining streetwear culture through authentic design, premium quality, 
            and a community-driven approach to fashion.
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 mb-6">
              Founded in 2024, ReeseBlanks emerged from a simple belief: streetwear should be 
              more than just clothing—it should be a canvas for self-expression and authentic style.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our journey began with a vision to create premium streetwear that speaks to the 
              bold, the creative, and the unapologetically individual. Every piece we design 
              tells a story of craftsmanship, innovation, and cultural relevance.
            </p>
            <p className="text-lg text-gray-600">
              Today, we're building a global community of style enthusiasts who share our 
              passion for authentic fashion and creative expression.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-square rounded-2xl overflow-hidden"
          >
            <Image
              src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"
              alt="ReeseBlanks Story"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Authenticity</h3>
              <p className="text-gray-600">
                Every design reflects genuine creativity and cultural relevance, 
                never following trends but setting them.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality</h3>
              <p className="text-gray-600">
                Premium materials and meticulous craftsmanship ensure every piece 
                meets our exacting standards.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                We're building a global family of creatives who inspire and 
                support each other's unique style journey.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600">
                Ethical manufacturing and sustainable practices guide every 
                decision we make for our planet's future.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Journey</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ReeseBlanks is more than a brand—it's a movement. Join us as we continue 
            to push boundaries and redefine what streetwear can be.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/shop"
              className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Shop Collection
            </a>
            <a
              href="/register"
              className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              Join Community
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}