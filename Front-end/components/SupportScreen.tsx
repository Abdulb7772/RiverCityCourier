'use client';

import { motion } from 'framer-motion';

type SupportScreenProps = {
  role: 'customer' | 'admin' | 'driver';
  userEmail?: string | null;
  userName?: string | null;
};

export function SupportScreen({ role }: SupportScreenProps) {
  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="flex flex-col items-center text-center max-w-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="mb-8"
          animate={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-20 w-20 text-orange-400">
            <path d="M4.5 12a7.5 7.5 0 0 1 15 0v4a2 2 0 0 1-2 2h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 13.5V12a6 6 0 1 1 12 0v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.5 16.5A1.5 1.5 0 0 1 6 15v-1a1.5 1.5 0 0 1 1.5-1.5H8v4h-.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M16.5 16.5A1.5 1.5 0 0 0 18 15v-1a1.5 1.5 0 0 0-1.5-1.5H16v4h.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <motion.h1
          className="text-4xl font-bold tracking-tight text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Support
        </motion.h1>

        <motion.p
          className="mt-4 text-lg text-orange-200/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          We&apos;re working on something great to help you faster.
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <span className="inline-block border border-orange-500/30 bg-orange-500/10 px-6 py-3 text-sm font-semibold tracking-widest text-orange-300 uppercase">
            Coming Soon
          </span>
        </motion.div>

        <motion.div
          className="mt-12 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-orange-500"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
