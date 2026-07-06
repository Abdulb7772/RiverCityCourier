export type AdminCustomer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'customer';
  status: 'active' | 'suspended' | 'blocked' | string;
  createdAt: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const adminApiBase = '/api/admin/customers';

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to complete the request.');
  }

  return payload as T;
}

export async function fetchCustomers(page = 1, limit = 10): Promise<PaginatedResult<AdminCustomer>> {
  const result = await fetchJson<AdminCustomer[] | PaginatedResult<AdminCustomer>>(`${adminApiBase}?page=${page}&limit=${limit}`, {
    cache: 'no-store',
  });

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

export async function fetchCustomer(customerId: string): Promise<AdminCustomer> {
  return fetchJson<AdminCustomer>(`${adminApiBase}/${customerId}`, {
    cache: 'no-store',
  });
}

export async function updateCustomerStatus(customerId: string, status: string): Promise<AdminCustomer> {
  return fetchJson<AdminCustomer>(`${adminApiBase}/${customerId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
}
