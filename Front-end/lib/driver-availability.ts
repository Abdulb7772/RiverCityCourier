export async function fetchAvailability(email: string): Promise<{ availability: string }> {
  const response = await fetch(`/api/driver/availability?email=${encodeURIComponent(email)}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch availability.');
  }
  return response.json();
}

export async function updateAvailability(email: string, availability: string): Promise<{ availability: string }> {
  const response = await fetch(`/api/driver/availability?email=${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availability }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update availability.');
  }
  return response.json();
}
