'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { AdminOrder } from '@/lib/admin-orders';

type CompletedOrdersModalProps = {
  orders: AdminOrder[];
  isOpen: boolean;
  onClose: () => void;
};

function CheckCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CompletedOrdersModal({ orders, isOpen, onClose }: CompletedOrdersModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-6 shadow-2xl shadow-black/40"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-emerald-400/80">Archive</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Completed Orders</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20"
              >
                Close
              </button>
            </div>

            <div className="mt-6 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="rounded border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-100/70">
                  No completed orders yet.
                </div>
              ) : (
                orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    onClick={onClose}
                    className="block rounded border border-emerald-500/30 bg-emerald-500/10 p-4 transition hover:border-emerald-400/50 hover:bg-emerald-500/20"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-semibold text-emerald-200">{order.orderNumber}</p>
                        <p className="mt-1 text-sm text-emerald-100/80">{order.customer}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Delivered
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-emerald-100/70">{order.pickup} → {order.destination}</p>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
