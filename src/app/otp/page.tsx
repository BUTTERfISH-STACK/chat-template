"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ApiResponse<T = any> {
  error?: string;
  success?: boolean;
  message?: string;
  valid?: boolean;
  otp?: string;
}

function OTPPageContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get("phone") || "";

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
    
    // Resend timer
    const timer = resendTimer > 0 ? setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000) : null;
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimer]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Safely parse JSON response with error handling
   */
  async function safeJsonParse(response: Response): Promise<ApiResponse> {
    const contentType = response.headers.get("content-type");
    
    // Check if response has JSON content-type
    if (!contentType || !contentType.includes("application/json")) {
      // Try to get text for error reporting
      const text = await response.text().catch(() => "Unknown error");
      return { error: `Server returned non-JSON response: ${text.substring(0, 100)}` };
    }
    
    try {
      return await response.json() as ApiResponse;
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        return { error: "Failed to parse server response" };
      }
      return { error: "An unexpected error occurred" };
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;
    
    setIsLoading(true);
    setError("");

    try {
      // Verify OTP via API
      const response = await fetch("/api/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp: otpCode }),
      });

      // Safely parse JSON response
      const data = await safeJsonParse(response);

      // Handle non-OK responses or parse errors
      if (!response.ok || data.error) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.valid) {
        // Check for development OTP
        const devOtp = sessionStorage.getItem("dev_otp");
        if (devOtp && devOtp !== otpCode) {
          // Development mode - still verify but warn
          console.warn("Development mode: OTP mismatch. Expected:", devOtp);
        }
        
        // Navigate to chat on success
        router.push("/chat");
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Invalid OTP. Please try again.";
      setError(errorMessage);
      console.error("OTP verification error:", err);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(30);
    setError("");
    
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      // Safely parse JSON response
      const data = await safeJsonParse(response);

      // Handle non-OK responses or parse errors
      if (!response.ok || data.error) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.otp) {
        console.log("Development OTP:", data.otp);
        sessionStorage.setItem("dev_otp", data.otp);
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to resend OTP");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to resend OTP";
      setError(errorMessage);
      console.error("OTP resend error:", err);
    }
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
        </div>

        {/* OTP Form */}
        <div className="card-premium animate-slide-up">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Verification</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code sent to<br />
              <span className="text-primary">{phoneNumber}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                ))}
              </div>

              <Button
                type="submit"
                disabled={otp.join("").length !== 6 || isLoading}
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

          <div className="mt-6 text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in <span className="text-primary">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-primary hover:underline"
              >
                Resend Code
              </button>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={() => router.back()}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to login
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Code expires in 5 minutes</span>
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
