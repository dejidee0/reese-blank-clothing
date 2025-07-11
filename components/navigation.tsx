'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cart';
import Link from 'next/link';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const totalItems = getTotalItems();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            ReeseBlanks
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-gray-700 hover:text-purple-600 transition-colors">
              Shop
            </Link>
            <Link href="/battles" className="text-gray-700 hover:text-purple-600 transition-colors">
              Battles
            </Link>
            <Link href="/vip" className="text-gray-700 hover:text-purple-600 transition-colors">
              VIP
            </Link>
            <Link href="/referrals" className="text-gray-700 hover:text-purple-600 transition-colors">
              Referrals
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm">{user.email?.split('@')[0]}</span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                    >
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/closet"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Closet
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-4">
                <Link href="/shop" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">
                  Shop
                </Link>
                <Link href="/battles" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">
                  Battles
                </Link>
                <Link href="/vip" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">
                  VIP
                </Link>
                <Link href="/referrals" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">
                  Referrals
                </Link>
                <Link href="/cart" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">
                  Cart ({totalItems})
                </Link>
                
                {user ? (
                  <>
                    <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/closet" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">
                      My Closet
                    </Link>
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors">
                      Login
                    </Link>
                    <Link href="/register" className="block px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}