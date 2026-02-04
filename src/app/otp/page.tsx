"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get phone number and signup flag from session storage
    const storedPhone = sessionStorage.getItem("phoneNumber");
    const signupFlag = sessionStorage.getItem("isSignup");
    
    if (storedPhone) {
      setPhoneNumber(storedPhone);
      setIsSignup(signupFlag === "true");
    } else {
      // Redirect to login if no phone number
      router.push("/login");
    }
  }, [router]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    // Verify OTP with server
    try {
      const endpoint = isSignup ? "/api/auth/verify-signup-otp" : "/api/auth/verify-otp";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          otpCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("authToken", data.token);
        sessionStorage.setItem("userPhone", phoneNumber);
        // Clear signup flag
        sessionStorage.removeItem("isSignup");
        router.push("/");
      } else {
        setError("Invalid code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setResendTimer(60);

    // Resend OTP via API
    try {
      const digits = phoneNumber.replace(/\D/g, "");
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: `+${digits}`,
        }),
      });
    } catch (error) {
      console.error("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8">
        <svg className="h-12 w-auto" viewBox="0 0 200 50" fill="none">
          <text x="0" y="38" fontFamily="inherit" fontSize="28" fontWeight="bold" fill="currentColor">
            Vellon X
          </text>
        </svg>
      </div>

      {/* OTP Info */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">
          {isSignup ? "Create your account" : "Enter code"}
        </h1>
        <p className="text-muted-foreground">
          We've sent a code to <span className="font-semibold">{phoneNumber}</span>
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="flex justify-center gap-2 mb-6">
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
              className="w-12 h-14 text-center text-xl font-semibold bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="0"
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive text-center mb-4">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full font-semibold py-6"
          disabled={isLoading || otp.join("").length !== 6}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="ig-loader" />
              <span>Verifying...</span>
            </div>
          ) : isSignup ? (
            "Create Account"
          ) : (
            "Verify"
          )}
        </Button>
      </form>

      {/* Resend Option */}
      <div className="mt-6 text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend code in <span className="font-semibold">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-primary font-semibold text-sm hover:underline"
          >
            Resend code
          </button>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <button 
          onClick={() => {
            sessionStorage.removeItem("isSignup");
            router.push("/login");
          }}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    </div>
  );
}
