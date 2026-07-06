export async function updateDriverSettings(body: {
  id?: string;
  currentPassword?: string;
  newPassword?: string;
  fullName?: string;
  email?: string;
}): Promise<{ id: string; fullName: string; email: string }> {
  const response = await fetch('/api/driver/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update settings.');
  }
  return response.json();
}
