export type VerificationDocument = {
  type: 'license' | 'identification' | 'insurance' | 'picture' | 'vehicle_photo' | 'vehicle_registration';
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

const apiBase = '/api/driver/verification';

export async function fetchVerification(email: string): Promise<DriverVerification> {
  const response = await fetch(`${apiBase}?email=${encodeURIComponent(email)}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch verification status.');
  }
  return response.json();
}

export async function uploadDocument(email: string, type: string, url: string): Promise<DriverVerification> {
  const response = await fetch(`${apiBase}?email=${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, url }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload document.');
  }
  return response.json();
}
