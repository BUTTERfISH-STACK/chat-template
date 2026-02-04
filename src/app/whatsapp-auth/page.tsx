"use client";

import { useState, useEffect } from "react";

export default function WhatsAppAuthPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [serverUrl, setServerUrl] = useState("");

  useEffect(() => {
    // Poll for QR code and connection status
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/whatsapp/qr");
        const data = await response.json();

        if (response.ok) {
          setQrCode(data.qrCode);
          setConnected(data.connected);
          setError("");
          if (data.serverUrl) {
            setServerUrl(data.serverUrl);
          }
        } else {
          setError(data.error || "Failed to get QR code");
        }
      } catch (err: any) {
        setError("Failed to connect to server");
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 3 seconds
    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  const refreshQR = async () => {
    setIsLoading(true);
    setQrCode(null);
    // Force re-initialization by refreshing
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gradient-gold">Vellon</h1>
          <p className="text-muted-foreground mt-2">WhatsApp Authentication</p>
        </div>

        {/* Server Status Card */}
        {serverUrl && !error && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-500">OTP Server Required</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start the Express OTP server to use WhatsApp OTP:
                </p>
                <code className="text-xs bg-yellow-500/20 px-2 py-1 rounded mt-2 inline-block">
                  npm run otp:dev
                </code>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Card */}
        <div className="card-premium animate-slide-up">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {connected ? "Connected!" : "Scan QR Code"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {connected 
                ? "WhatsApp is connected and ready to send OTPs"
                : "Scan this QR code with WhatsApp to authorize OTP delivery"
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-6">
            {isLoading ? (
              <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full" />
            ) : connected ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-500 font-medium">WhatsApp Connected ✓</p>
                <p className="text-sm text-muted-foreground mt-1">OTPs will be sent via WhatsApp</p>
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                  alt="WhatsApp QR Code"
                  className="w-48 h-48 rounded-lg border border-border"
                />
                <button
                  onClick={refreshQR}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Refresh QR Code
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-muted-foreground animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm">Generating QR code...</p>
                {!serverUrl && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Make sure the OTP server is running:<br/>
                    <code className="bg-secondary px-1 rounded">npm run otp:dev</code>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-primary hover:underline">
              ← Back to Login
            </a>
          </div>
        </div>

        {/* Instructions */}
        {!connected && qrCode && (
          <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
            <h3 className="text-sm font-medium text-foreground mb-2">How to connect:</h3>
            <ol className="text-xs text-muted-foreground space-y-1">
              <li>1. Open WhatsApp on your phone</li>
              <li>2. Tap Menu (⋮) or Settings</li>
              <li>3. Tap "Linked Devices"</li>
              <li>4. Tap "Link a Device"</li>
              <li>5. Point your phone at this screen</li>
            </ol>
          </div>
        )}

        {/* Free WhatsApp Info */}
        <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-500">Free WhatsApp OTP</p>
              <p className="text-xs text-muted-foreground mt-1">
                Using Baileys - an open-source library that connects directly to WhatsApp Web.
                No API keys or subscriptions required!
              </p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secure WhatsApp connection</span>
        </div>
      </div>
    </div>
  );
}
