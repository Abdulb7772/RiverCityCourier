'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { DriverNavbar } from './DriverNavbar';
import { DriverSidebar, driverSidebarItems } from './DriverSidebar';
import { fetchVerification, uploadDocument, type DriverVerification, type VerificationDocument } from '@/lib/driver-verification';
import { openCloudinaryWidget, isCloudinaryConfigured } from '@/lib/cloudinary-upload';

type Props = {
  userEmail: string;
  userName?: string | null;
};

const documentConfig: { type: VerificationDocument['type']; label: string; desc: string }[] = [
  { type: 'license', label: 'Driver License', desc: 'Upload a clear photo of your valid driver license' },
  { type: 'identification', label: 'Identification Card', desc: 'Upload your government-issued ID card' },
  { type: 'insurance', label: 'Proof of Insurance', desc: 'Upload your valid insurance document' },
  { type: 'picture', label: 'Profile Picture', desc: 'Upload a recent passport-style photo' },
  { type: 'vehicle_photo', label: 'Vehicle Photo', desc: 'Upload a clear photo of your delivery vehicle' },
  { type: 'vehicle_registration', label: 'Vehicle Registration', desc: 'Upload your vehicle registration document' },
];

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
};

const statusColor: Record<string, string> = {
  pending: 'border-yellow-600/40 bg-yellow-950/30 text-yellow-300',
  verified: 'border-emerald-600/40 bg-emerald-950/30 text-emerald-300',
  rejected: 'border-red-600/40 bg-red-950/30 text-red-300',
};

function UploadCard({
  doc,
  config,
  onUpload,
}: {
  doc?: VerificationDocument;
  config: { type: string; label: string; desc: string };
  onUpload: () => void;
}) {
  const status = doc?.status || null;

  return (
    <div className="rounded-lg border border-orange-900/40 bg-slate-950/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">{config.label}</h3>
          <p className="mt-1 text-xs leading-relaxed text-orange-300/60">{config.desc}</p>
        </div>
        {status && (
          <span className={`shrink-0 rounded border px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider ${statusColor[status]}`}>
            {statusLabel[status]}
          </span>
        )}
      </div>

      {doc?.url && (
        <div className="relative mt-3 h-40 w-full overflow-hidden rounded border border-orange-900/30 bg-black/40">
          <Image
            src={doc.url}
            alt={config.label}
            fill
            className="object-contain"
          />
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        {!status || status === 'rejected' ? (
          <button
            type="button"
            onClick={onUpload}
            className="border border-orange-700/50 bg-orange-950/40 px-4 py-2 text-xs font-medium text-orange-200 transition hover:border-orange-500/60 hover:bg-orange-900/50"
          >
            {doc?.url ? 'Re-upload' : 'Upload'}
          </button>
        ) : (
          <span className="text-xs text-emerald-400/70">Document submitted</span>
        )}
      </div>

      {doc?.comment && (
        <div className="mt-3 rounded border border-orange-900/30 bg-orange-950/20 p-3">
          <p className="text-[0.55rem] uppercase tracking-wider text-orange-400/50">Comment</p>
          <p className="mt-1 text-xs text-orange-200/80">{doc.comment}</p>
        </div>
      )}
    </div>
  );
}

export function DriverVerificationClient({ userEmail, userName }: Props) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [verification, setVerification] = useState<DriverVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVerification = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchVerification(userEmail);
      setVerification(data);
    } catch {
      setError('Failed to load verification status.');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) loadVerification();
  }, [userEmail, loadVerification]);

  const handleSidebarSelect = useCallback((item: string) => {
    setIsSidebarOpen(false);
    if (item === 'Dashboard') router.push('/driver');
    if (item === 'Assigned Orders') router.push('/driver/orders');
    if (item === 'In Progress') router.push('/driver/orders/in-progress');
    if (item === 'Completed') router.push('/driver/orders/completed');
    if (item === 'Verification') router.push('/driver/verification');
    if (item === 'Support') router.push('/driver/support');
  }, [router]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  const handleUpload = (type: VerificationDocument['type']) => {
    if (!isCloudinaryConfigured()) {
      setError('Cloudinary is not configured.');
      return;
    }
    openCloudinaryWidget({
      maxFiles: 1,
      onUpload: async (url) => {
        try {
          setError('');
          const result = await uploadDocument(userEmail, type, url);
          setVerification(result);
        } catch {
          setError('Failed to save document. Please try again.');
        }
      },
      onError: (msg) => setError(msg),
    });
  };

  const allUploaded = verification?.documents.length === 6;
  const allVerified = verification?.documents.every((d) => d.status === 'verified');

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1a0800_0%,#0f0400_50%,#000000_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,140,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,0,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />

      <DriverNavbar
        userName={userName}
        userEmail={userEmail}
        summaryText="Verification"
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <DriverSidebar
        isOpen={isSidebarOpen}
        activeSection="Verification"
        items={driverSidebarItems}
        onSelect={handleSidebarSelect}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Driver Verification</h1>
            <p className="mt-1 text-sm text-orange-300/60">
              {allVerified
                ? 'All documents have been verified.'
                : allUploaded
                  ? 'Documents submitted. Awaiting verification.'
                  : 'Upload the required documents to verify your account.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500/40 border-t-orange-400" />
            </div>
          ) : (
            <>
              {allUploaded && !allVerified && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-900/40 bg-yellow-950/20 px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-yellow-600/40 bg-yellow-950/30">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-yellow-400">
                      <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-300">Waiting to Verify</p>
                    <p className="text-xs text-orange-300/60">All documents submitted. Please wait while an admin reviews your documents.</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {documentConfig.map((config) => {
                  const doc = verification?.documents.find((d) => d.type === config.type);
                  return (
                    <UploadCard
                      key={config.type}
                      doc={doc}
                      config={config}
                      onUpload={() => handleUpload(config.type)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
