'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

type CustomerSidebarProps = {
  isOpen: boolean;
  activeItem: string;
  onClose: () => void;
  onSelect: (item: string) => void;
};

type MenuItem = {
  label: string;
  icon: ReactNode;
};

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10v6H4V6.5ZM14 4h3.5A2.5 2.5 0 0 1 20 6.5V10h-6V4ZM4 14h6v6H6.5A2.5 2.5 0 0 1 4 17.5V14ZM14 14h6v3.5A2.5 2.5 0 0 1 17.5 20H14v-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M3.5 7.5h11v8H3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14.5 10.5H18l2.5 2.5V15h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.5" cy="17.5" r="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 4v4h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.5L6 20V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M4.5 12a7.5 7.5 0 0 1 15 0v4a2 2 0 0 1-2 2h-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 13.5V12a6 6 0 1 1 12 0v1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 16.5A1.5 1.5 0 0 1 6 15v-1a1.5 1.5 0 0 1 1.5-1.5H8v4h-.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M16.5 16.5A1.5 1.5 0 0 0 18 15v-1a1.5 1.5 0 0 0-1.5-1.5H16v4h.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon /> },
  { label: 'Create Delivery', icon: <PlusIcon /> },
  { label: 'Active Deliveries', icon: <TruckIcon /> },
  { label: 'Delivery History', icon: <HistoryIcon /> },
  { label: 'Saved Addresses', icon: <BookmarkIcon /> },
  { label: 'Support', icon: <SupportIcon /> },
];

function SidebarContent({ activeItem, onSelect }: Pick<CustomerSidebarProps, 'activeItem' | 'onSelect'>) {
  return (
    <div className="flex h-full flex-col">

      {/* Header */}
      <div className="border-b border-orange-900/40 px-6 py-5">
        <p className="text-[0.6rem] uppercase tracking-[0.35em] text-orange-500/80">Customer Area</p>
        <p className="mt-1.5 text-xl font-semibold text-white">Your workspace</p>
        <p className="mt-1 text-xs text-orange-300/60">Quick access to the pages you use most.</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.label === activeItem;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item.label)}
              className={`flex w-full items-center gap-4 border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'border-orange-500/50 bg-linear-to-r from-orange-600/30 to-orange-900/10 text-white'
                  : 'border-transparent text-orange-200/70 hover:border-orange-800/40 hover:bg-orange-950/50 hover:text-orange-100'
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center border ${
                isActive
                  ? 'border-orange-500/50 bg-orange-600/20 text-orange-300'
                  : 'border-orange-900/40 bg-orange-950/60 text-orange-400/70'
              }`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-orange-900/40 px-6 py-5">
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-orange-500/70">Need help?</p>
        <p className="mt-2 text-xs leading-relaxed text-orange-200/60">
          Open a support request or check route updates from this drawer.
        </p>
      </div>

    </div>
  );
}

export function CustomerSidebar({ isOpen, activeItem, onClose, onSelect }: CustomerSidebarProps) {
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
              <p className="text-sm font-semibold text-white">Customer drawer</p>
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

          <SidebarContent activeItem={activeItem} onSelect={onSelect} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}