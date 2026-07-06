export type Activity = {
  id: string;
  type: 'login' | 'update' | 'create' | 'delete' | 'settings';
  description: string;
  user: string;
  location: string;
  duration: string;
  timestamp: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function fetchActivity(page = 1, limit = 10): Promise<PaginatedResult<Activity>> {
  const response = await fetch(`/api/admin/activity?page=${page}&limit=${limit}`, { cache: 'no-store' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch activity log.');
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
