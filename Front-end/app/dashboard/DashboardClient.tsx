'use client';

import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type DashboardClientProps = {
  userEmail?: string | null;
  userName?: string | null;
  entrySource?: 'login' | 'signup' | null;
};

const highlights = [
  { label: 'Live Deliveries', value: '12', tone: 'from-orange-500 to-amber-400' },
  { label: 'Completed Today', value: '84', tone: 'from-cyan-500 to-sky-400' },
  { label: 'Return Trips', value: '07', tone: 'from-emerald-500 to-lime-400' },
  { label: 'Monthly Revenue', value: '$18.2K', tone: 'from-fuchsia-500 to-rose-400' },
];

const checkpoints = [
  { time: '08:20', title: 'Pickup confirmed', note: 'Warehouse dock B', done: true },
  { time: '09:05', title: 'Loaded on truck', note: 'Priority route assigned', done: true },
  { time: '10:10', title: 'En route', note: 'West corridor moving', done: true },
  { time: '11:00', title: 'Drop-off window', note: 'Customer handoff pending', done: false },
];

const actions = [
  'Create Delivery',
  'Track Shipment',
  'Billing Summary',
  'Saved Addresses',
  'Support Request',
];

export function DashboardClient({ userEmail, userName, entrySource }: DashboardClientProps) {
  const reduceMotion = useReducedMotion();
  const focusSectionRef = useRef<HTMLElement | null>(null);
  const isLoginEntry = entrySource === 'login';

  const entryLabel = useMemo(() => {
    if (entrySource === 'signup') return 'Account created successfully';
    if (entrySource === 'login') return 'Signed in successfully';
    return 'Dashboard ready';
  }, [entrySource]);

  useEffect(() => {
    const target = focusSectionRef.current;

    if (!target) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [entrySource, reduceMotion]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.3),transparent_26%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.13),transparent_22%),linear-gradient(180deg,#1f1308_0%,#0f172a_48%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <motion.main
        initial={isLoginEntry ? { opacity: 0, y: 120 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: isLoginEntry ? 0.75 : 0.45,
          ease: 'easeOut',
        }}
        className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 lg:px-8"
      >
        <motion.header
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-4xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-orange-300">RiverCity Courier</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                Welcome{userName ? `, ${userName}` : ''}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                {entryLabel}. Your routes, shipments, and billing overview are now live.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-slate-400">Status</p>
                <p className="mt-1 font-medium text-emerald-300">Active</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-slate-400">Account</p>
                <p className="mt-1 font-medium text-white">Verified</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 col-span-2 sm:col-span-1">
                <p className="text-slate-400">Email</p>
                <p className="mt-1 truncate font-medium text-white">{userEmail ?? 'customer@rivercitycourier.com'}</p>
              </div>
            </div>
          </div>
        </motion.header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item, index) => (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
            >
              <div className={`rounded-2xl bg-linear-to-br ${item.tone} p-4`}>
                <p className="text-sm text-white/85">{item.label}</p>
                <p className="mt-3 text-4xl font-bold text-white">{item.value}</p>
              </div>
            </motion.article>
          ))}
        </section>

        <section ref={focusSectionRef} className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr] scroll-mt-8">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45 }}
            className="rounded-4xl border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-black/15 backdrop-blur-xl sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Journey</p>
                <h2 className="mt-2 text-2xl font-semibold">Current delivery flow</h2>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                Auto-scrolled on entry
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {checkpoints.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="flex gap-4 rounded-3xl border border-white/8 bg-white/5 p-4"
                >
                  <div className="flex w-16 shrink-0 flex-col items-center gap-1">
                    <div className={`h-3 w-3 rounded-full ${step.done ? 'bg-emerald-300' : 'bg-orange-300'}`} />
                    <div className="h-full w-px bg-white/10" />
                    <span className="text-xs text-slate-400">{step.time}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base font-medium text-white">{step.title}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs ${step.done ? 'bg-emerald-400/15 text-emerald-200' : 'bg-orange-400/15 text-orange-200'}`}>
                        {step.done ? 'Done' : 'Next'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{step.note}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.article>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="rounded-4xl border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-black/15 backdrop-blur-xl sm:p-6"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Quick Actions</p>
            <h2 className="mt-2 text-2xl font-semibold">Jump back into work</h2>

            <div className="mt-5 space-y-3">
              {actions.map((action, index) => (
                <motion.button
                  key={action}
                  type="button"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 transition hover:border-orange-400/50 hover:bg-orange-500/10"
                >
                  <span>{action}</span>
                  <span className="text-orange-300">→</span>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-orange-500/20 bg-linear-to-br from-orange-500/15 via-orange-500/8 to-transparent p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-orange-200">Signed in as</p>
              <p className="mt-2 break-all text-sm text-white">{userEmail ?? 'customer@rivercitycourier.com'}</p>
              <p className="mt-1 text-xs text-slate-300">Smooth scroll is triggered when login or signup lands here.</p>
            </div>
          </motion.aside>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45 }}
          className="grid gap-4 lg:grid-cols-3"
        >
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-300">Live tracking</p>
            <p className="mt-2 text-lg font-semibold text-white">Truck 18 is 11 minutes out</p>
            <p className="mt-2 text-sm text-slate-300">Route updates animate into view as the page scrolls.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Billing</p>
            <p className="mt-2 text-lg font-semibold text-white">$2,140 outstanding</p>
            <p className="mt-2 text-sm text-slate-300">Invoices and payments stay visible in the sidebar flow.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Security</p>
            <p className="mt-2 text-lg font-semibold text-white">Session verified</p>
            <p className="mt-2 text-sm text-slate-300">Successful login and signup both land on this animated dashboard.</p>
          </div>
        </motion.section>

        <div className="pb-8 text-center text-xs uppercase tracking-[0.35em] text-slate-400">
          RiverCity Courier Control Center
        </div>
      </motion.main>

      <AnimatePresence>
        {entrySource ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full border border-orange-300/30 bg-orange-500/15 px-4 py-2 text-sm text-orange-50 shadow-xl backdrop-blur-xl"
          >
            {entryLabel}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}