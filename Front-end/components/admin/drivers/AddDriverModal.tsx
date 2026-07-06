'use client';
 
import { useMemo, useState } from 'react';
import { CreateDriverInput, createDriver } from '@/lib/admin-drivers';
 
type AddDriverModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDriverAdded: (driver: { id: string; fullName: string; email: string; phone: string; role: 'driver'; verified: boolean; createdAt: string }) => void;
};
 
const initialFormState: CreateDriverInput = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
};
 
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
 
function UserPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M2 20c0-4 3.6-7 8-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M19 12v6M16 15h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
 
export function AddDriverModal({ isOpen, onClose, onDriverAdded }: AddDriverModalProps) {
  const [form, setForm] = useState<CreateDriverInput>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
 
  const canSubmit = useMemo(
    () =>
      form.fullName.trim().length >= 2 &&
      form.email.trim().includes('@') &&
      form.phone.trim().length >= 7 &&
      form.password.trim().length >= 8,
    [form],
  );
 
  const handleChange = (field: keyof CreateDriverInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };
 
  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Please complete all required fields with valid values.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const newDriver = await createDriver(form);
      onDriverAdded(newDriver);
      setForm(initialFormState);
      onClose();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to add driver.');
    } finally {
      setIsSubmitting(false);
    }
  };
 
  if (!isOpen) return null;
 
  const fields: { key: keyof CreateDriverInput; label: string; type: string; placeholder: string }[] = [
    { key: 'fullName', label: 'Full name', type: 'text', placeholder: 'Afzal Ahmed' },
    { key: 'email', label: 'Email address', type: 'email', placeholder: 'ahmed@example.com' },
    { key: 'phone', label: 'Phone number', type: 'tel', placeholder: '+92 300 123 4567' },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters' },
  ];
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 py-6">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
 
      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-2xl shadow-black/70">
        {/* Subtle top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-orange-500/60 to-transparent" />
 
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-900/50 bg-orange-950/60 text-orange-400">
              <UserPlusIcon />
            </div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.4em] text-orange-400/60">New driver</p>
              <h2 className="text-base font-semibold text-white leading-tight">Add driver profile</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <XIcon />
          </button>
        </div>
 
        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-xs text-white/40 mb-5 leading-relaxed">
            The driver will be created with a pending verification state. You can verify them from the driver details page.
          </p>
 
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map(({ key, label, type, placeholder }) => (
              <label key={key} className="block">
                <span className="block text-[0.7rem] font-medium text-white/50 mb-1.5 uppercase tracking-[0.2em]">{label}</span>
                <input
                  value={form[key]}
                  type={type}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-orange-500/20"
                />
              </label>
            ))}
          </div>
 
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          )}
        </div>
 
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl w-20 border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="relative overflow-hidden w-20 rounded-xl px-5 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 bg-linear-to-r from-orange-600 via-rose-500 to-fuchsia-600 hover:brightness-110 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
                Adding...
              </span>
            ) : (
              'Add driver'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
 