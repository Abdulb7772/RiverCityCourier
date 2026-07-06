'use client';

import { motion } from 'framer-motion';

interface AuthButtonProps {
  text: string;
  onClick?: () => void;
  isLoading?: boolean;
  type?: 'submit' | 'button';
}

export const AuthButton = ({
  text,
  onClick,
  isLoading = false,
  type = 'submit',
}: AuthButtonProps) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full py-4 px-6 bg-linear-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-orange-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.5 }}
        style={{ opacity: 0.1 }}
      />
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="inline-block"
        >
          ⏳
        </motion.div>
      ) : (
        text
      )}
    </motion.button>
  );
};
