'use client';

import { motion } from 'framer-motion';

interface RoleSelectorProps {
  selectedRole: 'customer' | 'driver' | 'admin' | '';
  onRoleSelect: (role: 'customer' | 'driver' | 'admin') => void;
}

const roles = [
  { id: 'customer', label: 'Customer', icon: '🛍️', color: 'from-blue-600 to-blue-500' },
  { id: 'driver', label: 'Driver', icon: '🚚', color: 'from-green-600 to-green-500' },
  { id: 'admin', label: 'Admin', icon: '⚙️', color: 'from-purple-600 to-purple-500' },
];

export const RoleSelector = ({ selectedRole, onRoleSelect }: RoleSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <p className="text-gray-300 text-sm font-medium mb-4">Select your role:</p>
      <div className="grid grid-cols-3 gap-3">
        {roles.map((role, index) => (
          <motion.button
            key={role.id}
            onClick={() => onRoleSelect(role.id as 'customer' | 'driver' | 'admin')}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-lg border-2 transition-all duration-300 ${
              selectedRole === role.id
                ? `border-primary-500 bg-linear-to-br ${role.color} shadow-lg shadow-primary-500/50`
                : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
            }`}
          >
            <div className="text-2xl mb-1">{role.icon}</div>
            <div className="text-xs font-semibold">{role.label}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
