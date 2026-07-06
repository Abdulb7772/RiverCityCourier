export type Review = {
  id: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  reply: string | null;
  createdAt: string;
  repliedAt: string | null;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function fetchReviews(page = 1, limit = 10): Promise<PaginatedResult<Review>> {
  const response = await fetch(`/api/admin/reviews?page=${page}&limit=${limit}`, { cache: 'no-store' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch reviews.');
  }

  const result = await response.json();

  if (Array.isArray(result)) {
    return {
      data: result.slice((page - 1) * limit, page * limit),
      total: result.length,
      page,
      limit,
      totalPages: Math.ceil(result.length / limit),
    };
  }

  return result;
}

export async function replyToReview(reviewId: string, reply: string): Promise<Review> {
  const response = await fetch(`/api/admin/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reply to review.');
  }

  return response.json();
}
