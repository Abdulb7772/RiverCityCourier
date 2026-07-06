'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminNavbar } from '../AdminNavbar';
import { AdminSidebar } from '../AdminSidebar';
import { adminSidebarItems } from '../AdminSidebar';
import { fetchReviews, replyToReview, type Review } from '@/lib/admin-reviews';

type ReviewsScreenProps = {
  userEmail?: string | null;
  userName?: string | null;
};

function StarIcon({ className = 'h-4 w-4', filled }: { className?: string; filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M3 10c0-4 2-6 9-6s9 2 9 6-2 6-9 6c-1 0-2 0-3-.5L5 20v-5.5C3.7 13.5 3 12 3 10z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReplyIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M3 11l6-6v4h9a3 3 0 013 3v3M3 11l6 6v-4h9a3 3 0 003-3v-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbsUpIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3m7-2V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ratingColors: Record<number, string> = {
  5: 'text-emerald-400',
  4: 'text-sky-400',
  3: 'text-amber-400',
  2: 'text-orange-400',
  1: 'text-rose-400',
};

export function ReviewsScreen({ userEmail, userName }: ReviewsScreenProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Reviews');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const limit = 5;
  const router = useRouter();

  const loadReviews = useCallback((page: number) => {
    setLoading(true);
    fetchReviews(page, limit)
      .then((result) => {
        setReviews(result.data);
        setTotalPages(result.totalPages);
        setTotalReviews(result.total);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadReviews(currentPage);
  }, [currentPage, loadReviews]);

  const handleSidebarSelect = useCallback(
    (item: string) => {
      setActiveSection(item);
      const paths: Record<string, string> = {
        Dashboard: '/admin', Orders: '/admin/orders', Drivers: '/admin/drivers',
        Customers: '/admin/customers', Pricing: '/admin/pricing', Reports: '/admin/reports',
        Reviews: '/admin/reviews', Support: '/admin/support',
      };
      router.push(paths[item] || '/admin');
    },
    [router],
  );

  const handleLogout = () => { window.location.href = '/auth/login'; };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const updated = await replyToReview(reviewId, replyText.trim());
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      setReplyingTo(null);
      setReplyText('');
      toast.success('Reply posted successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post reply.';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const avgRating = totalReviews
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.14),transparent_18%),linear-gradient(180deg,#2b1606_0%,#0f172a_52%,#020617_100%)] text-white">
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[56px_56px]" />

      <AdminNavbar
        userEmail={userEmail}
        userName={userName}
        summaryText="Read customer feedback and respond to reviews directly."
        onMenuClick={() => setIsSidebarOpen(true)}
        onLogout={handleLogout}
      />

      <AdminSidebar
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        items={adminSidebarItems}
        onSelect={handleSidebarSelect}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="w-full border border-orange-900/40 bg-orange-950/30 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-orange-400/80">
                Reviews & Feedback
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
                Customer Reviews
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-orange-100/60">
                Monitor ratings, read customer comments, and respond to feedback to maintain service quality.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Reviews', value: totalReviews, color: 'text-sky-300' },
              { label: 'Average Rating', value: avgRating, color: 'text-amber-300' },
              { label: 'Replied', value: reviews.filter((r) => r.reply).length, color: 'text-emerald-300' },
              { label: 'Unreplied', value: reviews.filter((r) => !r.reply).length, color: 'text-rose-300' },
            ].map((stat) => (
              <div key={stat.label} className="border border-orange-900/40 bg-orange-950/25 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.35em] text-orange-400/70">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-12 text-center text-sm text-orange-100/60">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="border border-orange-900/40 bg-slate-950/60 px-6 py-12 text-center text-sm text-orange-100/60">
            No reviews yet.
          </div>
        ) : (
          <section className="flex flex-col gap-5">
            {reviews.map((review) => (
              <article key={review.id} className="border border-orange-900/40 bg-slate-950/60 p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center border border-orange-500/30 bg-orange-500/10 text-sm font-bold text-orange-300">
                      {review.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{review.customerName}</p>
                      <p className="text-xs text-orange-300/60">{review.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="border border-orange-900/30 bg-orange-950/20 px-2.5 py-1 text-xs text-orange-300/70">
                      {review.orderId}
                    </span>
                    <span className="text-xs text-orange-400/50">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="mt-4 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      filled={star <= review.rating}
                      className={`h-4 w-4 ${star <= review.rating ? ratingColors[review.rating] : 'text-orange-800/50'}`}
                    />
                  ))}
                  <span className={`ml-2 text-sm font-semibold ${ratingColors[review.rating]}`}>
                    {review.rating}/5
                  </span>
                </div>

                {/* Title & Comment */}
                <h3 className="mt-4 text-base font-semibold text-white">{review.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-orange-100/70">{review.comment}</p>

                {/* Reply */}
                {review.reply ? (
                  <div className="mt-5 border-l-2 border-emerald-500/50 bg-emerald-950/20 px-5 py-4">
                    <div className="flex items-center gap-2 text-xs text-emerald-400/70">
                      <ReplyIcon className="h-3.5 w-3.5" />
                      Your reply
                      {review.repliedAt && (
                        <span className="text-orange-400/40">
                          &middot; {new Date(review.repliedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-orange-100/80">{review.reply}</p>
                  </div>
                ) : (
                  <div className="mt-5">
                    {replyingTo === review.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          rows={3}
                          className="w-full border border-orange-900/40 bg-orange-950/30 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500/50"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleReply(review.id)}
                            disabled={sending || !replyText.trim()}
                            className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckIcon className="h-4 w-4" />
                            {sending ? 'Posting...' : 'Post Reply'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                            className="border border-orange-800/40 px-4 py-2 text-sm text-orange-300/70 transition hover:border-orange-500/50 hover:text-orange-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReplyingTo(review.id)}
                        className="flex items-center gap-2 border border-orange-700/40 px-4 py-2 text-sm text-orange-300/70 transition hover:border-orange-500/40 hover:text-orange-200"
                      >
                        <ReplyIcon className="h-4 w-4" />
                        Reply to Review
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-4 border-t border-orange-900/30 pt-6">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="border border-orange-700/40 px-4 py-2 text-xs text-orange-300/70 transition hover:border-orange-500/40 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-orange-400/60">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="border border-orange-700/40 px-4 py-2 text-xs text-orange-300/70 transition hover:border-orange-500/40 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
