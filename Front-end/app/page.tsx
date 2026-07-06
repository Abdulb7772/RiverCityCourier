'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';

export default function Home() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLeaving(true), 3900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLeaving) return;
    // wait for the animation to finish, then navigate
    const leaveDuration = 700;
    const navTimer = window.setTimeout(() => {
      router.replace('/auth/login');
    }, leaveDuration);
    return () => clearTimeout(navTimer);
  }, [isLeaving, router]);

  return (
    <div className="min-h-screen w-full">
      <AnimatedBackground animateTruck />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, 18, 0], scale: [1, 1.08, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 mx-auto my-auto h-72 w-72 rounded-full bg-primary-500/12 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={isLeaving ? { opacity: 0, y: -window.innerHeight } : { opacity: 1, y: 0 }}
          transition={{ duration: isLeaving ? 0.7 : 0.8, ease: 'easeInOut' }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Main Title */}
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-6xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-linear-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
              RiverCity Courier
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Seamless Cargo Vehicle Booking Platform for Customers, Drivers & Admins
          </motion.p>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-gray-500 text-sm mt-8"
          >
            Login with your credentials to access your dashboard
          </motion.p>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [0, 30, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, -30, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-32 right-10 w-40 h-40 bg-primary-400/10 rounded-full blur-2xl"
        />
      </div>
    </div>
  );
}
