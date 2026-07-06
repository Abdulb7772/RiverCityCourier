"use client";

import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

// Local mapping of sidebar labels to route paths. Kept local so the sidebar
// component controls its own presentation details rather than exporting them
// from a shared data module.
const adminSidebarPaths: Record<string, string> = {
  Dashboard: '/admin',
  Orders: '/admin/orders',
  Drivers: '/admin/drivers',
  Customers: '/admin/customers',
  Pricing: '/admin/pricing',
  'AI Assignment': '/admin/ai',
  Reports: '/admin/reports',
  Reviews: '/admin/reviews',
  'Activity Log': '/admin/activity',
  Profile: '/admin/profile',
  Support: '/admin/support',
};

type AdminSidebarProps = {
  isOpen: boolean;
  activeSection: string;
  items: string[];
  onSelect: (item: string) => void;
  onClose: () => void;
  onLogout: () => void;
};

const adminSidebarIcons: Record<string, React.ReactNode> = {
  Dashboard: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  Orders: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 12H15M9 16H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Drivers: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Customers: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 3.5c2.5.8 4 3 4 5.5s-1.5 4.7-4 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Pricing: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v8M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  'AI Assignment': (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  Reports: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M4 20h16M6 16V9M10 16V5M14 16v-5M18 16V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Reviews: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'Activity Log': (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M3 6h18M3 12h18M3 18h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Profile: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  Support: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M4.5 12a7.5 7.5 0 0 1 15 0v4a2 2 0 0 1-2 2h-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 13.5V12a6 6 0 1 1 12 0v1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 16.5A1.5 1.5 0 0 1 6 15v-1a1.5 1.5 0 0 1 1.5-1.5H8v4h-.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16.5 16.5A1.5 1.5 0 0 0 18 15v-1a1.5 1.5 0 0 0-1.5-1.5H16v4h.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
};

function SidebarContent({ activeSection, items, onSelect, onLogout }: Omit<AdminSidebarProps, 'isOpen' | 'onClose'>) {
  const router = useRouter();

  const handleClick = (item: string) => {
    const path = adminSidebarPaths[item];
    if (path) {
      router.push(path);
    }
    onSelect(item);
  };

  return (
    <div className="flex h-full flex-col">

      {/* Header */}
      <div className="border-b border-orange-900/40 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-orange-700/40 bg-orange-950/60">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-orange-400">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-500/80">RiverCity Courier</p>
            <p className="mt-0.5 text-sm font-semibold text-white">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        {items.map((item) => {
          const isActive = item === activeSection;
          return (
            <button
              key={item}
              type="button"
              onClick={() => handleClick(item)}
              className={`flex w-full items-center gap-3 border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'border-orange-500/50 bg-linear-to-r from-orange-600/30 to-orange-900/10 text-white'
                  : 'border-transparent text-orange-200/70 hover:border-orange-800/40 hover:bg-orange-950/50 hover:text-orange-100'
              }`}
            >
              <span className={`${isActive ? 'text-orange-400' : 'text-orange-600/70'}`}>
                {adminSidebarIcons[item]}
              </span>
              <span className="flex-1 truncate">{item}</span>
              {isActive && <span className="text-xs text-orange-400">›</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-orange-900/40 px-4 py-4 space-y-2">
        <p className="px-1 text-[0.6rem] uppercase tracking-[0.3em] text-orange-500/70">Admin controls</p>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 border border-rose-800/40 bg-rose-950/30 px-4 py-3 text-sm font-medium text-rose-300 transition hover:border-rose-500/50 hover:bg-rose-900/30 hover:text-rose-200"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
            <path d="M9 21H5c-.5 0-1-.2-1.4-.6C3.2 20 3 19.5 3 19V5c0-.5.2-1 .6-1.4C4 3.2 4.5 3 5 3h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Logout
        </button>
      </div>

    </div>
  );
}

export function AdminSidebar({ isOpen, activeSection, items, onSelect, onClose, onLogout }: AdminSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.button
          key="overlay"
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.aside
          key="drawer"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="fixed inset-y-0 left-0 z-50 w-72 border-r border-orange-900/40 bg-linear-to-b from-[#1a0800] via-[#0f0400] to-[#000000] shadow-2xl shadow-black/70"
        >
          <div className="flex items-center justify-between border-b border-orange-900/40 px-5 py-4">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-500/70">Menu</p>
              <p className="text-sm font-semibold text-white">Admin drawer</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center border border-orange-800/40 bg-orange-950/60 text-orange-300 transition hover:border-orange-500/50 hover:bg-orange-900/50"
              aria-label="Close drawer"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <SidebarContent activeSection={activeSection} items={items} onSelect={(item) => { onSelect(item); onClose(); }} onLogout={onLogout} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export const adminSidebarItems = [
  'Dashboard',
  'Orders',
  'Drivers',
  'Customers',
  'Pricing',
  'AI Assignment',
  'Reports',
  'Reviews',
  'Activity Log',
  'Profile',
];