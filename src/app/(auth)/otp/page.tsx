"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export default function OTPVerificationPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const storedPhoneNumber = sessionStorage.getItem("phoneNumber");
    if (!storedPhoneNumber) {
      router.push("/(auth)/login");
    } else {
      setPhoneNumber(storedPhoneNumber);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      // Login user
      login(phoneNumber, data.token);
      
      // Navigate to main app
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-[var(--card)] rounded-lg border shadow-lg">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">
          Verify Your Account
        </h1>
        
        <p className="text-sm text-[var(--muted-foreground)] mb-6 text-center">
          We sent a verification code to <span className="font-semibold">{phoneNumber}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="w-full text-center text-lg tracking-widest"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <span className="animate-spin mr-2">⟳</span>
            ) : null}
            Verify Code
          </Button>

          <p className="text-sm text-[var(--muted-foreground)] text-center">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-[var(--primary)] hover:text-[var(--primary-foreground)] font-medium"
            >
              Resend
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
