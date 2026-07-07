"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerNavbar } from "./CustomerNavbar";
import { CustomerSidebar } from "./CustomerSidebar";
import { fetchCustomerOrders, type CustomerOrder } from "@/lib/customer-orders";

type CustomerDashboardProps = {
  userEmail?: string | null;
  userName?: string | null;
  entrySource?: "login" | "signup" | null;
};

const statusProgress: Record<CustomerOrder['status'], number> = {
  new: 15,
  processing: 40,
  picked_up: 70,
  completed: 100,
  rejected: 0,
};

const statusLabel: Record<CustomerOrder['status'], string> = {
  new: 'New',
  processing: 'Processing',
  picked_up: 'Picked Up',
  completed: 'Completed',
  rejected: 'Rejected',
};

export function CustomerDashboard({ userEmail, userName }: CustomerDashboardProps) {
  const handleLogout = () => { window.location.href = "/auth/login"; };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userEmail) return;
    let mounted = true;
    let interval: ReturnType<typeof setInterval>;

    async function fetchOrders() {
      try {
        const data = await fetchCustomerOrders(userEmail, userName ?? undefined);
        if (mounted) setOrders(data);
      } catch {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchOrders();
    interval = setInterval(fetchOrders, 15000);

    return () => { mounted = false; clearInterval(interval); };
  }, [userEmail, userName]);

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'completed' && o.status !== 'rejected'),
    [orders],
  );

  const inProgressOrders = useMemo(
    () => orders.filter((o) => o.status === 'processing' || o.status === 'picked_up'),
    [orders],
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'completed'),
    [orders],
  );

  const thisMonthOrders = useMemo(
    () => orders.filter((o) => {
      const d = new Date(o.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }),
    [orders],
  );

  const summaryCards = useMemo(() => [
    {
      label: "Active Deliveries",
      value: String(activeOrders.length),
      tone: "from-orange-600 to-amber-500",
      detail: "Orders currently assigned to drivers",
    },
    {
      label: "Deliveries In Progress",
      value: String(inProgressOrders.length),
      tone: "from-cyan-600 to-sky-500",
      detail: "Packages moving through the route queue",
    },
    {
      label: "Completed Deliveries",
      value: String(completedOrders.length),
      tone: "from-emerald-600 to-lime-500",
      detail: "Successful drop-offs this week",
    },
    {
      label: "Total Deliveries This Month",
      value: String(thisMonthOrders.length),
      tone: "from-fuchsia-600 to-rose-500",
      detail: "Monthly customer shipment total",
    },
  ], [activeOrders, inProgressOrders, completedOrders, thisMonthOrders]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <CustomerNavbar
        userName={userName}
        userEmail={userEmail}
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <CustomerSidebar
        isOpen={isSidebarOpen}
        activeItem={activeItem}
        onClose={() => setIsSidebarOpen(false)}
        onSelect={(item) => {
          setActiveItem(item);
          setIsSidebarOpen(false);
          if (item === 'Create Delivery') { router.push('/customer/create-delivery'); return; }
          if (item === 'Active Deliveries') { router.push('/customer/orders'); return; }
          if (item === 'Delivery History') { router.push('/customer/orders/history'); return; }
          if (item === 'Saved Addresses') { router.push('/customer/saved-locations'); return; }
          if (item === 'Support') { router.push('/customer/support'); return; }
          if (item === 'Dashboard') { router.push('/dashboard'); return; }
        }}
      />

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[1fr_auto]">
            <div className="flex flex-col justify-center px-2 py-2">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">
                Customer Profile
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white lg:text-4xl">
                Welcome{userName ? `, ${userName}` : ""}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                Manage deliveries, schedule pickups, track shipments, review invoices and stay
                connected with your courier activity from one centralized dashboard.
              </p>
            </div>

            <div className="flex flex-row gap-3">
              <div className="flex min-w-25 flex-col items-center justify-center border border-orange-900/40 bg-orange-950/40 px-5 py-4 text-center">
                <p className="text-xs text-orange-400/70">Status</p>
                <p className="mt-1 text-sm font-semibold text-emerald-400">Active</p>
              </div>
              <div className="flex min-w-25 flex-col items-center justify-center border border-orange-900/40 bg-orange-950/40 px-5 py-4 text-center">
                <p className="text-xs text-orange-400/70">Account</p>
                <p className="mt-1 text-sm font-semibold text-white">Customer</p>
              </div>
              <div className="flex min-w-35 flex-col items-center justify-center border border-orange-900/40 bg-orange-950/40 px-5 py-4 text-center">
                <p className="text-xs text-orange-400/70">Email</p>
                <p className="mt-1 break-all text-sm font-semibold text-white">
                  {userEmail ?? "customer@rivercitycourier.com"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.label} className="flex flex-col overflow-hidden border border-orange-900/40 bg-slate-950/60">
              <div className={`flex flex-col items-center justify-center bg-linear-to-br ${card.tone} px-6 py-6`}>
                <p className="text-xs font-medium text-white/90">{card.label}</p>
                <p className="mt-2 text-5xl font-bold text-white">{loading ? "\u2014" : card.value}</p>
              </div>
              <p className="px-4 py-3 text-center text-xs text-orange-100/60">{card.detail}</p>
            </article>
          ))}
        </section>

        {/* Ongoing Orders */}
        <section className="w-full border border-orange-900/40 bg-slate-950/60 px-6 py-6 sm:px-8 sm:py-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Live Tracking</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">Ongoing Orders</h3>
            </div>
            <span className="border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
              {loading ? "\u2014" : activeOrders.length} active
            </span>
          </div>

          {loading ? (
            <div className="border border-orange-900/30 bg-orange-950/20 px-5 py-10 text-center text-sm text-orange-100/50">
              Loading orders...
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="border border-orange-900/30 bg-orange-950/20 px-5 py-10 text-center text-sm text-orange-100/50">
              No active orders. Create a delivery to get started.
            </div>
          ) : (
            <div className="grid gap-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="border border-orange-900/30 bg-orange-950/20 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
                        <p className="mt-0.5 text-xs text-orange-300/70">{order.pickup} \u2192 {order.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="text-xs text-orange-400/60">Driver</p>
                        <p className="mt-0.5 text-sm text-white">{order.assignedDriver || "Unassigned"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-orange-400/60">ETA</p>
                        <p className="mt-0.5 text-sm text-white">{order.eta || "\u2014"}</p>
                      </div>
                      <div>
                        <span className="border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
                          {statusLabel[order.status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-orange-400/60 mb-1">
                      <span>Progress</span>
                      <span>{statusProgress[order.status]}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-orange-950/60">
                      <div
                        className="h-full bg-linear-to-r from-orange-500 to-amber-400 transition-all duration-500"
                        style={{ width: `${statusProgress[order.status]}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bottom Section */}
        <section className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
          <article className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Quick Access</p>
                <h3 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Customer Actions</h3>
              </div>
              <span className="border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs text-orange-300">
                Quick navigation
              </span>
            </div>

            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => router.push('/customer/create-delivery')}
                className="flex w-full flex-col justify-center border border-orange-900/30 bg-orange-950/20 px-6 py-5 text-left transition-all duration-300 hover:border-orange-500/30 hover:bg-orange-950/40"
              >
                <p className="text-base font-semibold text-white">Schedule a pickup</p>
                <p className="mt-1.5 text-sm text-orange-100/60">Book a truck for the next available slot.</p>
              </button>
              <button
                type="button"
                onClick={() => router.push('/customer/orders')}
                className="flex w-full flex-col justify-center border border-orange-900/30 bg-orange-950/20 px-6 py-5 text-left transition-all duration-300 hover:border-orange-500/30 hover:bg-orange-950/40"
              >
                <p className="text-base font-semibold text-white">Track your orders</p>
                <p className="mt-1.5 text-sm text-orange-100/60">
                  {loading ? "\u2014" : `${activeOrders.length} active order${activeOrders.length === 1 ? '' : 's'} in progress`}.
                </p>
              </button>
              <button
                type="button"
                onClick={() => router.push('/customer/orders/history')}
                className="flex w-full flex-col justify-center border border-orange-900/30 bg-orange-950/20 px-6 py-5 text-left transition-all duration-300 hover:border-orange-500/30 hover:bg-orange-950/40"
              >
                <p className="text-base font-semibold text-white">View delivery history</p>
                <p className="mt-1.5 text-sm text-orange-100/60">
                  {loading ? "\u2014" : `${completedOrders.length} completed delivery${completedOrders.length === 1 ? '' : 'ies'}`}.
                </p>
              </button>
            </div>
          </article>

          <aside className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">At a Glance</p>
            <h3 className="mt-2 text-center text-2xl font-semibold text-white">
              {orders.length} Total Orders
            </h3>
            <p className="mt-3 text-center text-sm leading-relaxed text-orange-100/60">
              {loading
                ? "Loading your delivery summary..."
                : orders.length === 0
                  ? "No orders yet. Create your first delivery to get started."
                  : `You have ${activeOrders.length} active and ${completedOrders.length} completed deliveries.`}
            </p>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center border border-orange-900/30 bg-orange-950/20 px-4 py-4 text-center text-sm text-orange-100/50">
                  Loading...
                </div>
              ) : orders.length === 0 ? (
                <div
                  className="flex cursor-pointer items-center justify-center border border-orange-500/40 bg-orange-600/20 px-4 py-4 text-center text-sm font-semibold text-orange-200 hover:bg-orange-600/30"
                  onClick={() => router.push('/customer/create-delivery')}
                >
                  Create your first delivery
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border border-orange-900/30 bg-orange-950/20 px-4 py-4 text-sm">
                    <span className="text-orange-100/80">Active</span>
                    <span className="font-semibold text-amber-300">{activeOrders.length}</span>
                  </div>
                  <div className="flex items-center justify-between border border-orange-900/30 bg-orange-950/20 px-4 py-4 text-sm">
                    <span className="text-orange-100/80">Completed</span>
                    <span className="font-semibold text-emerald-300">{completedOrders.length}</span>
                  </div>
                  <div className="flex items-center justify-between border border-orange-900/30 bg-orange-950/20 px-4 py-4 text-sm">
                    <span className="text-orange-100/80">This month</span>
                    <span className="font-semibold text-white">{thisMonthOrders.length}</span>
                  </div>
                </>
              )}
            </div>
          </aside>
        </section>

      </main>
    </div>
  );
}