export type AppNotification = {
  id: string;
  recipientRole: string;
  recipientEmail?: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: AppNotification[];
  unreadCount: number;
};

export async function fetchAdminNotifications(): Promise<NotificationsResponse> {
  const response = await fetch('/api/admin/notifications', { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch notifications.');
  }
  return response.json();
}

export async function fetchCustomerNotifications(email: string): Promise<NotificationsResponse> {
  const response = await fetch(`/api/customer/notifications?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch notifications.');
  }
  return response.json();
}

export async function fetchDriverNotifications(email: string): Promise<NotificationsResponse> {
  const response = await fetch(`/api/driver/notifications?email=${encodeURIComponent(email)}`, { cache: 'no-store' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch notifications.');
  }
  return response.json();
}

export async function markNotificationRead(id: string): Promise<void> {
  const response = await fetch(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark notification as read.');
  }
}

export async function markAllNotificationsRead(role: string, email?: string): Promise<void> {
  const response = await fetch('/api/admin/notifications/read-all', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, email }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark notifications as read.');
  }
}
