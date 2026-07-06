"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerNavbar } from "./CustomerNavbar";
import { CustomerSidebar } from "./CustomerSidebar";

type CustomerDashboardProps = {
  userEmail?: string | null;
  userName?: string | null;
  entrySource?: "login" | "signup" | null;
};

const summaryCards = [
  {
    label: "Active Deliveries",
    value: "12",
    tone: "from-orange-600 to-amber-500",
    detail: "Orders currently assigned to drivers",
  },
  {
    label: "Deliveries In Progress",
    value: "07",
    tone: "from-cyan-600 to-sky-500",
    detail: "Packages moving through the route queue",
  },
  {
    label: "Completed Deliveries",
    value: "84",
    tone: "from-emerald-600 to-lime-500",
    detail: "Successful drop-offs this week",
  },
  {
    label: "Total Deliveries This Month",
    value: "143",
    tone: "from-fuchsia-600 to-rose-500",
    detail: "Monthly customer shipment total",
  },
];

const quickItems = [
  { title: "Schedule a pickup", note: "Book a truck for the next available slot." },
  { title: "Track all shipments", note: "See live progress for every active order." },
  { title: "Review invoices", note: "Check billing history and payment status." },
];

const ongoingOrders = [
  { id: "#ORD-4821", route: "Lahore → Karachi", driver: "Ahmed Raza", status: "In Transit", eta: "2h 30m", progress: 65 },
  { id: "#ORD-4819", route: "Islamabad → Multan", driver: "Bilal Khan", status: "Picked Up", eta: "4h 10m", progress: 30 },
  { id: "#ORD-4815", route: "Rawalpindi → Peshawar", driver: "Usman Ali", status: "Out for Delivery", eta: "45m", progress: 85 },
];

export function CustomerDashboard({ userEmail, userName }: CustomerDashboardProps) {
  const handleLogout = () => { window.location.href = "/auth/login"; };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const router = useRouter();

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
                <p className="mt-2 text-5xl font-bold text-white">{card.value}</p>
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
              {ongoingOrders.length} active
            </span>
          </div>

          <div className="grid gap-4">
            {ongoingOrders.map((order) => (
              <div key={order.id} className="border border-orange-900/30 bg-orange-950/20 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{order.id}</p>
                      <p className="mt-0.5 text-xs text-orange-300/70">{order.route}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs text-orange-400/60">Driver</p>
                      <p className="mt-0.5 text-sm text-white">{order.driver}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-400/60">ETA</p>
                      <p className="mt-0.5 text-sm text-white">{order.eta}</p>
                    </div>
                    <div>
                      <span className="border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-orange-400/60 mb-1">
                    <span>Progress</span>
                    <span>{order.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-orange-950/60">
                    <div
                      className="h-full bg-linear-to-r from-orange-500 to-amber-400 transition-all duration-500"
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                Sidebar controls these views
              </span>
            </div>

            <div className="grid gap-4">
              {quickItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveItem(item.title)}
                  className={`flex w-full flex-col justify-center border px-6 py-5 text-left transition-all duration-300 ${
                    activeItem === item.title
                      ? "border-orange-500/50 bg-orange-600/20"
                      : "border-orange-900/30 bg-orange-950/20 hover:border-orange-500/30 hover:bg-orange-950/40"
                  }`}
                >
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="mt-1.5 text-sm text-orange-100/60">{item.note}</p>
                </button>
              ))}
            </div>
          </article>

          <aside className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Current Focus</p>
            <h3 className="mt-2 text-center text-2xl font-semibold text-white">{activeItem}</h3>
            <p className="mt-3 text-center text-sm leading-relaxed text-orange-100/60">
              Stay updated with delivery activity, assigned drivers, shipment tracking and upcoming pickup schedules.
            </p>

            <div className="mt-6 space-y-4">
              {["Pickup scheduled", "Driver assigned", "Status update pending"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-center border border-orange-900/30 bg-orange-950/20 px-4 py-4 text-center text-sm text-orange-100/80"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </section>

      </main>
    </div>
  );
}