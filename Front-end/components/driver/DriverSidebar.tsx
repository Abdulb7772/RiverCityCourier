'use client';

import { AnimatePresence, motion } from 'framer-motion';

type DriverSidebarProps = {
  isOpen: boolean;
  activeSection: string;
  items: string[];
  onSelect: (item: string) => void;
  onClose: () => void;
  onLogout: () => void;
};

const sidebarIcons: Record<string, React.ReactNode> = {
  Dashboard: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  'Assigned Orders': (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 12H15M9 16H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  'In Progress': (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Completed: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.5L10.5 15L16 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Verification: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

function SidebarContent({ activeSection, items, onSelect, onLogout }: Omit<DriverSidebarProps, 'isOpen' | 'onClose'>) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-orange-900/40 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-orange-700/40 bg-orange-950/60">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-orange-400">
              <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-500/80">RiverCity Courier</p>
            <p className="mt-0.5 text-sm font-semibold text-white">Driver Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {items.map((item) => {
          const isActive = item === activeSection;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={`flex w-full items-center gap-3 border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'border-orange-500/50 bg-linear-to-r from-orange-600/30 to-orange-900/10 text-white'
                  : 'border-transparent text-orange-200/70 hover:border-orange-800/40 hover:bg-orange-950/50 hover:text-orange-100'
              }`}
            >
              <span className={`${isActive ? 'text-orange-400' : 'text-orange-600/70'}`}>
                {sidebarIcons[item]}
              </span>
              <span className="flex-1">{item}</span>
              {isActive && <span className="text-xs text-orange-400">›</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-orange-900/40 px-4 py-4 space-y-2">
        <p className="px-1 text-[0.6rem] uppercase tracking-[0.3em] text-orange-500/70">Driver controls</p>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 border border-rose-800/40 bg-rose-950/30 px-4 py-3 text-sm font-medium text-rose-300 transition hover:border-rose-500/50 hover:bg-rose-900/30 hover:text-rose-200"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

export const driverSidebarItems = [
  'Dashboard',
  'Assigned Orders',
  'In Progress',
  'Completed',
  'Verification',
  'Support',
];

export function DriverSidebar({ isOpen, activeSection, items, onSelect, onClose, onLogout }: DriverSidebarProps) {
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
              <p className="text-sm font-semibold text-white">Driver drawer</p>
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

          <SidebarContent
            activeSection={activeSection}
            items={items}
            onSelect={(item) => { onSelect(item); onClose(); }}
            onLogout={onLogout}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}