'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  index: number;
  rightSlot?: ReactNode;
}

export const FormInput = ({
  label,
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  index,
  rightSlot,
}: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="w-full"
    >
      <label className="block text-sm font-medium text-orange-100 mb-2">
        {label}
      </label>
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 20px rgba(255, 102, 51, 0.5)'
            : '0 0 0px rgba(255, 102, 51, 0)',
        }}
        className="relative"
      >
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={() => setIsFocused(true)}
          className={`w-full px-4 py-3 bg-orange-900/40 border border-orange-600/50 rounded-xl focus:outline-none focus:border-orange-400 transition-all duration-300 text-white placeholder-orange-300 ${rightSlot ? 'pr-12' : ''}`}
        />
        {rightSlot && <div className="absolute inset-y-0 right-3 flex items-center">{rightSlot}</div>}
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-xs mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};
