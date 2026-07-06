'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CustomerNavbar } from './CustomerNavbar';
import { CustomerSidebar } from './CustomerSidebar';
import {
  fetchLocations,
  createLocation,
  deleteLocation,
  type SavedLocation,
} from '@/lib/customer-locations';

type Props = {
  userEmail?: string | null;
  userName?: string | null;
};

function PlusIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 21s-7-6.686-7-11a7 7 0 1 1 14 0c0 4.314-7 11-7 11Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function SavedLocationsScreen({ userEmail, userName }: Props) {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Saved Addresses');
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!userEmail) return;
    fetchLocations(userEmail)
      .then(setLocations)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [userEmail]);

  const handleSidebarSelect = useCallback(
    (item: string) => {
      setActiveSection(item);
      const paths: Record<string, string> = {
        Dashboard: '/customer', 'Create Delivery': '/customer/create-delivery',
        'Active Deliveries': '/customer/orders', 'Delivery History': '/customer/orders/history', 'Saved Addresses': '/customer/saved-locations',
        Profile: '/customer/profile', Support: '/customer/support',
      };
      router.push(paths[item] || '/customer');
    },
    [router],
  );

  const handleLogout = () => { window.location.href = '/auth/login'; };

  const handleAdd = async () => {
    if (!userEmail) return;
    if (!newName.trim() || !newAddress.trim()) {
      toast.error('Both location name and address are required.');
      return;
    }
    setSaving(true);
    try {
      const created = await createLocation({
        locationName: newName.trim(),
        address: newAddress.trim(),
        customerEmail: userEmail,
      });
      setLocations((prev) => [created, ...prev]);
      setNewName('');
      setNewAddress('');
      toast.success('Location saved.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save location.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
      toast.success('Location deleted.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete location.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <CustomerNavbar
        userEmail={userEmail}
        userName={userName}
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <CustomerSidebar
        isOpen={isSidebarOpen}
        activeItem={activeSection}
        onSelect={handleSidebarSelect}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">
              Customer Account
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
              Saved Locations
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
              Manage your frequently used addresses for faster checkout.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-12 text-center text-sm text-orange-100/60">
            Loading saved locations...
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            {/* Locations table */}
            <div className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-white">Your Locations</h2>
              <p className="mt-1 text-sm text-orange-100/60">
                {locations.length} saved location{locations.length !== 1 ? 's' : ''}
              </p>

              {/* Existing locations */}
              {locations.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-orange-900/30 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400/60">
                        <th className="px-4 py-3 font-medium">Location Name</th>
                        <th className="px-4 py-3 font-medium">Address</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-900/20">
                      {locations.map((loc) => (
                        <tr key={loc.id} className="transition hover:bg-orange-950/20">
                          <td className="px-4 py-4 font-medium text-white">
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4 shrink-0 text-orange-400" />
                              {loc.locationName}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-orange-100/70">{loc.address}</td>
                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDelete(loc.id)}
                              className="inline-flex items-center gap-1 border border-rose-800/40 px-3 py-1.5 text-xs text-rose-300/70 transition hover:border-rose-500/50 hover:bg-rose-950/30 hover:text-rose-200"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add new location form */}
              <div className={`${locations.length > 0 ? 'mt-8 border-t border-orange-900/20 pt-8' : 'mt-6'}`}>
                <h3 className="text-base font-semibold text-white">Add New Location</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.6rem] uppercase tracking-[0.2em] text-orange-400/60">Location Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Home, Office, Warehouse"
                      className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.6rem] uppercase tracking-[0.2em] text-orange-400/60">Address</label>
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Full address"
                      className="border border-orange-900/40 bg-orange-950/30 px-4 py-2.5 text-sm text-white placeholder-orange-300/30 outline-none transition focus:border-orange-500/50"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={saving}
                  className="mt-4 flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PlusIcon className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="flex flex-col gap-5">
              <div className="border border-orange-900/40 bg-slate-950/60 p-6">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Map View</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Visualize Locations</h2>
                <div className="mt-5 flex h-64 items-center justify-center border border-dashed border-orange-900/40 bg-orange-950/10">
                  <div className="text-center">
                    <MapPinIcon className="mx-auto h-10 w-10 text-orange-500/40" />
                    <p className="mt-3 text-sm font-medium text-orange-300/70">Interactive Map</p>
                    <p className="mt-1 text-xs text-orange-400/50">Coming soon</p>
                  </div>
                </div>
              </div>

              <div className="border border-orange-900/40 bg-slate-950/60 p-6">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">Quick Info</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Tips</h2>
                <div className="mt-5 space-y-3 text-sm text-orange-100/60 leading-relaxed">
                  <p>Save your frequently used addresses to auto-fill them when creating deliveries.</p>
                  <p>You can use location names like &quot;Home&quot;, &quot;Office&quot;, or &quot;Warehouse 1&quot; for easy identification.</p>
                  <p>Saved locations will appear as dropdown options on the Create Delivery page.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
