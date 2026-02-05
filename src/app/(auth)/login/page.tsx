"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const startResendTimer = (duration: number) => {
    setResendTimer(duration);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phoneNumber || phoneNumber.length < 7) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // Show success and move to OTP step
      setStep("otp");
      setExpiresIn(data.expiresIn || 300);
      startResendTimer(60);

      // Log OTP in development for testing
      if (data.debugOtp) {
        console.log("OTP for testing:", data.debugOtp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp, action: "verify" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      // Store auth data in sessionStorage
      sessionStorage.setItem("authToken", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      // Set cookie for middleware access
      document.cookie = `authToken=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      // Navigate to chat page
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setExpiresIn(data.expiresIn || 300);
      startResendTimer(60);

      if (data.debugOtp) {
        console.log("OTP for testing:", data.debugOtp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep("phone");
    setOtp("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-[var(--card)] rounded-lg border shadow-lg">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">
          {step === "phone" ? "Vellon Chat" : "Enter OTP"}
        </h1>

        {step === "phone" ? (
          <>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 text-center">
              Enter your phone number to login or create an account
            </p>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="w-full"
                  disabled={isLoading}
                  required
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-spin mr-2">⟳</span>
                ) : null}
                Send OTP
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 text-center">
              Enter the 6-digit code sent to {phoneNumber}
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full text-center text-2xl tracking-widest"
                  disabled={isLoading}
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <span className="animate-spin mr-2">⟳</span>
                  ) : null}
                  Verify & Login
                </Button>

                <div className="flex justify-between items-center text-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="text-[var(--muted-foreground)]"
                  >
                    ← Back
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOtp}
                    disabled={isLoading || resendTimer > 0}
                    className={`${resendTimer > 0 ? "opacity-50" : ""}`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </Button>
                </div>
              </div>
            </form>

            {expiresIn > 0 && (
              <p className="text-xs text-[var(--muted-foreground)] text-center mt-4">
                OTP expires in {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, "0")}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
