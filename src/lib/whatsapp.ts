// Simplified WhatsApp service for development
// OTP functionality has been removed

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

// Stub functions for WhatsApp connection (not used in development mode)
export function initWhatsApp(): Promise<void> {
  return Promise.resolve();
}

export function getQRCode(): string | null {
  return null;
}

export function isWhatsAppConnected(): boolean {
  return false;
}

export function disconnectWhatsApp(): void {
  // No-op
}

export default {
  formatPhoneNumber,
  initWhatsApp,
  getQRCode,
  isWhatsAppConnected,
  disconnectWhatsApp,
};
