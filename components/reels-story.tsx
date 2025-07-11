'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface ReelsStoryProps {
  stories: {
    id: string;
    image: string;
    video?: string;
    title: string;
    description: string;
    cta?: {
      text: string;
      action: () => void;
    };
  }[];
  autoPlay?: boolean;
  duration?: number;
}

export default function ReelsStory({ stories, autoPlay = true, duration = 5000 }: ReelsStoryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((current) => (current + 1) % stories.length);
          return 0;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, duration, stories.length]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const currentStory = stories[currentIndex];

  const nextStory = () => {
    setCurrentIndex((current) => (current + 1) % stories.length);
    setProgress(0);
  };

  const prevStory = () => {
    setCurrentIndex((current) => (current - 1 + stories.length) % stories.length);
    setProgress(0);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto bg-black rounded-2xl overflow-hidden aspect-[9/16]">
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-20 flex space-x-1">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Story Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full"
        >
          {currentStory.video ? (
            <video
              src={currentStory.video}
              className="w-full h-full object-cover"
              autoPlay={isPlaying}
              muted={isMuted}
              loop
            />
          ) : (
            <img
              src={currentStory.image}
              alt={currentStory.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold mb-2"
            >
              {currentStory.title}
            </motion.h3>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-white/90 mb-4"
            >
              {currentStory.description}
            </motion.p>
            {currentStory.cta && (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={currentStory.cta.action}
                className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                {currentStory.cta.text}
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Areas */}
      <button
        onClick={prevStory}
        className="absolute left-0 top-0 w-1/3 h-full z-10"
        aria-label="Previous story"
      />
      <button
        onClick={nextStory}
        className="absolute right-0 top-0 w-1/3 h-full z-10"
        aria-label="Next story"
      />
    </div>
  );
}