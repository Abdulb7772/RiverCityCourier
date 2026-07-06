export type AdminDriver = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'driver';
  verified: boolean;
  createdAt: string;
};

export type CreateDriverInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const adminApiBase = '/api/admin/drivers';

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to complete the request.');
  }

  return payload as T;
}

export async function fetchDrivers(page = 1, limit = 50): Promise<AdminDriver[]> {
  const result = await fetchJson<AdminDriver[] | PaginatedResult<AdminDriver>>(
    `${adminApiBase}?page=${page}&limit=${limit}`,
    { cache: 'no-store' },
  );

  if (Array.isArray(result)) {
    return result;
  }

  return result.data;
}

export async function createDriver(input: CreateDriverInput): Promise<AdminDriver> {
  return fetchJson<AdminDriver>(adminApiBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function fetchDriver(driverId: string): Promise<AdminDriver> {
  return fetchJson<AdminDriver>(`${adminApiBase}/${driverId}`, {
    cache: 'no-store',
  });
}

export async function verifyDriver(driverId: string): Promise<AdminDriver> {
  return fetchJson<AdminDriver>(`${adminApiBase}/${driverId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verified: true }),
  });
}

export async function unverifyDriver(driverId: string): Promise<AdminDriver> {
  return fetchJson<AdminDriver>(`${adminApiBase}/${driverId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verified: false }),
  });
}

export async function deleteDriver(driverId: string): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>(`${adminApiBase}/${driverId}`, {
    method: 'DELETE',
  });
}
