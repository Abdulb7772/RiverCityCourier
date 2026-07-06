'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface FormToggleProps {
  text: string;
  linkText: string;
  href: string;
}

export const FormToggle = ({ text, linkText, href }: FormToggleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-center text-orange-200 text-sm"
    >
      {text}{' '}
      <Link
        href={href}
        className="text-orange-300 hover:text-orange-200 font-semibold transition-colors"
      >
        {linkText}
      </Link>
    </motion.div>
  );
};
