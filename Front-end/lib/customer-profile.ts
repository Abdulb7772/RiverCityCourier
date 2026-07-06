export type CustomerProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
};

export async function fetchProfile(email: string): Promise<CustomerProfile> {
  const response = await fetch(`/api/customer/profile?email=${encodeURIComponent(email)}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch profile.');
  }

  return response.json();
}

export async function updateProfile(
  id: string,
  data: { fullName?: string; phone?: string },
): Promise<CustomerProfile> {
  const response = await fetch('/api/customer/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile.');
  }

  return response.json();
}
