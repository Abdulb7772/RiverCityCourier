export type DriverProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  verified: boolean;
  status: string;
  createdAt: string;
};

export async function fetchDriverProfile(email: string): Promise<DriverProfile> {
  const response = await fetch(`/api/driver/profile?email=${encodeURIComponent(email)}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch profile.');
  }
  return response.json();
}
