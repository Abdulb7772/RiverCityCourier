export type SavedLocation = {
  id: string;
  locationName: string;
  address: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchLocations(email: string): Promise<SavedLocation[]> {
  const response = await fetch(`/api/customer/locations?email=${encodeURIComponent(email)}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch locations.');
  }

  return response.json();
}

export async function createLocation(data: {
  locationName: string;
  address: string;
  customerEmail: string;
}): Promise<SavedLocation> {
  const response = await fetch('/api/customer/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create location.');
  }

  return response.json();
}

export async function updateLocation(
  id: string,
  data: { locationName?: string; address?: string },
): Promise<SavedLocation> {
  const response = await fetch(`/api/customer/locations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update location.');
  }

  return response.json();
}

export async function deleteLocation(id: string): Promise<void> {
  const response = await fetch(`/api/customer/locations/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete location.');
  }
}
