export type SettingsResult = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
};

export async function updateSettings(data: {
  id: string;
  currentPassword?: string;
  newPassword?: string;
  fullName?: string;
  email?: string;
}): Promise<SettingsResult> {
  const response = await fetch('/api/customer/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update settings.');
  }

  return response.json();
}
