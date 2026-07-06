export type VerificationDocument = {
  type: string;
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  comment: string;
};

export type DriverVerification = {
  email: string;
  documents: VerificationDocument[];
  status: 'pending' | 'verified';
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchDriverVerification(email: string): Promise<DriverVerification> {
  const response = await fetch(`/api/admin/verification/${encodeURIComponent(email)}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch verification.');
  }
  return response.json();
}

export async function updateDocumentStatus(email: string, type: string, status: string, comment?: string): Promise<DriverVerification> {
  const response = await fetch(`/api/admin/verification/${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, status, comment }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update document status.');
  }
  return response.json();
}
