"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OTPInput } from "@/components/ui/OTPInput";

type DeliveryMethod = 'whatsapp' | 'sms' | 'email' | 'totp';
type AuthMode = 'otp' | 'backup';

function OTPPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get("phone") || "";
  const isNewUser = searchParams.get("new") === "true";

  // State
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown
  const [method, setMethod] = useState<DeliveryMethod>('whatsapp');
  const [authMode, setAuthMode] = useState<AuthMode>('otp');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [usedBackupCodes, setUsedBackupCodes] = useState<number>(0);
  const [showBackupInput, setShowBackupInput] = useState(false);
  const [backupCodeInput, setBackupCodeInput] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Refs for timers
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize
  useEffect(() => {
    if (!phoneNumber) {
      router.push("/login");
      return;
    }

    // Check for dev OTP in session storage
    const storedDevOtp = sessionStorage.getItem("dev_otp");
    if (storedDevOtp) {
      setDevOtp(storedDevOtp);
    }

    // Focus first input
    setTimeout(() => {
      const input = document.querySelector('input[inputmode="numeric"]') as HTMLInputElement;
      input?.focus();
    }, 100);

    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [phoneNumber, router]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      resendTimerRef.current = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, [resendTimer]);

  // Countdown timer
  useEffect(() => {
    if (!success && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [success, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async (selectedMethod: DeliveryMethod = method) => {
    setIsLoading(true);
    setError("");
    setResendTimer(60);
    setCountdown(300);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          method: selectedMethod,
          isNewUser,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // Show OTP in development mode
      if (data.otp) {
        setDevOtp(data.otp);
        sessionStorage.setItem("dev_otp", data.otp);
      }

      if (data.backupCodes) {
        setBackupCodes(data.backupCodes);
      }

      setMethod(selectedMethod);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
      console.error("Send OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Invalid OTP");
      }

      // Success!
      setSuccess(true);
      sessionStorage.removeItem("dev_otp");

      // Store auth data
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      // Redirect after brief delay
      setTimeout(() => {
        router.push("/chat");
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.message || "Invalid OTP";
      setError(errorMessage);
      setOtp("");
      setAttemptsRemaining((prev) => Math.max(0, prev - 1));

      if (attemptsRemaining <= 1) {
        setResendTimer(60);
        setOtp("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodeVerify = async () => {
    if (backupCodeInput.length < 8) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          useBackupCode: true,
          backupCode: backupCodeInput,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Invalid backup code");
      }

      // Success!
      setSuccess(true);
      sessionStorage.removeItem("dev_otp");

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      setTimeout(() => {
        router.push("/chat");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Invalid backup code");
      setBackupCodeInput("");
      setUsedBackupCodes((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodIcon = (m: DeliveryMethod) => {
    switch (m) {
      case 'whatsapp':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        );
      case 'sms':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'totp':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        );
    }
  };

  const getMethodName = (m: DeliveryMethod) => {
    switch (m) {
      case 'whatsapp': return 'WhatsApp';
      case 'sms': return 'SMS';
      case 'email': return 'Email';
      case 'totp': return 'Authenticator';
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mb-6 animate-scale-in">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Verified!</h2>
          <p className="text-muted-foreground">Redirecting to chat...</p>
        </div>
      </div>
    );
  }

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
          <p className="text-muted-foreground mt-1">Premium Security</p>
        </div>

        {/* OTP Form */}
        <div className="card-premium animate-slide-up">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Verification</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code sent to<br />
              <span className="text-primary font-medium">{phoneNumber}</span>
            </p>
          </div>

          {/* Dev OTP Display */}
          {devOtp && (
            <div className="mb-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-yellow-500 font-medium text-sm">Development Mode</span>
              </div>
              <p className="text-yellow-500 text-center text-xs mb-2">Enter this OTP to verify:</p>
              <p className="text-yellow-500 text-center text-2xl font-mono font-bold tracking-widest">{devOtp}</p>
            </div>
          )}

          {!devOtp && (
            <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-500 text-xs text-center">
                OTP will be sent to your phone via WhatsApp
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center animate-shake">
              {error}
              {attemptsRemaining > 0 && attemptsRemaining < 3 && (
                <p className="mt-1 text-xs">{attemptsRemaining} attempts remaining</p>
              )}
            </div>
          )}

          {/* Auth Mode Toggle */}
          <div className="flex gap-1 p-1 rounded-lg bg-secondary/50 mb-6">
            <button
              onClick={() => { setAuthMode('otp'); setShowBackupInput(false); }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                authMode === 'otp' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              OTP Code
            </button>
            <button
              onClick={() => { setAuthMode('backup'); setShowBackupInput(true); }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                authMode === 'backup' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Backup Code
              {backupCodes.length > 0 && (
                <span className="ml-1 text-xs opacity-75">({backupCodes.length - usedBackupCodes})</span>
              )}
            </button>
          </div>

          {/* OTP Input */}
          {authMode === 'otp' && (
            <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
              <div className="space-y-6">
                <OTPInput
                  length={6}
                  onChange={setOtp}
                  onComplete={handleVerify}
                  disabled={isLoading}
                  error={error}
                />

                {/* Countdown */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-muted-foreground animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-muted-foreground">
                    Expires in <span className="text-primary font-medium">{formatTime(countdown)}</span>
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={otp.length !== 6 || isLoading}
                  className="w-full btn-gold h-11"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Backup Code Input */}
          {authMode === 'backup' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={backupCodeInput}
                  onChange={(e) => setBackupCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter backup code"
                  className="w-full px-4 py-3 text-center text-lg font-mono tracking-wider bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Use a backup code from your recovery list
                </p>
              </div>

              <Button
                onClick={handleBackupCodeVerify}
                disabled={backupCodeInput.length < 8 || isLoading}
                className="w-full btn-gold h-11"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Use Backup Code"
                )}
              </Button>

              {/* Backup Codes Display */}
              {backupCodes.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Your backup codes:</p>
                  <div className="grid grid-cols-2 gap-1">
                    {backupCodes.slice(0, 6).map((code, i) => (
                      <code key={i} className="text-xs font-mono text-foreground">{code}</code>
                    ))}
                    {backupCodes.length > 6 && (
                      <span className="text-xs text-muted-foreground">+{backupCodes.length - 6} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delivery Method Selection */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Change delivery method</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                key="whatsapp"
                onClick={() => handleSendOTP('whatsapp')}
                disabled={isLoading || resendTimer > 0}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  method === 'whatsapp'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                } disabled:opacity-50`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              <button
                key="sms"
                onClick={() => handleSendOTP('sms')}
                disabled={isLoading || resendTimer > 0}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  method === 'sms'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                } disabled:opacity-50`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                SMS
              </button>
              <button
                key="totp"
                onClick={() => handleSendOTP('totp')}
                disabled={isLoading || resendTimer > 0}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  method === 'totp'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                } disabled:opacity-50`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Authenticator
              </button>
            </div>
          </div>

          {/* Resend */}
          <div className="mt-6 text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend in <span className="text-primary font-medium">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={() => handleSendOTP()}
                className="text-sm text-primary hover:underline transition-all hover:scale-105 inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resend Code
              </button>
            )}
          </div>

          {/* Back */}
          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={() => router.back()}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to login
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <OTPPageContent />
    </Suspense>
  );
}

// Button component (inline to avoid import issues)
function Button({ children, onClick, type, disabled, className }: any) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
}
