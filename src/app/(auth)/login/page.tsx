"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginMethod = "phone" | "email";

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
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

    if (method === "phone") {
      if (!phoneNumber || phoneNumber.length < 7) {
        setError("Please enter a valid phone number");
        return;
      }
    } else {
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        return;
      }
    }

    setIsLoading(true);

    try {
      const body = method === "phone" 
        ? { phoneNumber, action: "send" }
        : { email, action: "send" };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // Show success and move to OTP step
      setOtp("");
      setExpiresIn(data.expiresIn || 300);
      startResendTimer(60);

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
      const body = method === "phone"
        ? { phoneNumber, otp, action: "verify" }
        : { email, otp, action: "verify" };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      const body = method === "phone"
        ? { phoneNumber, action: "send" }
        : { email, action: "send" };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    setOtp("");
    setError("");
    setResendTimer(0);
  };

  const toggleMethod = () => {
    setMethod(method === "phone" ? "email" : "phone");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-[var(--card)] rounded-lg border shadow-lg">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">
          Vellon Chat
        </h1>

        {/* Method Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-[var(--muted)] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMethod("phone")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                method === "phone"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              📱 Phone
            </button>
            <button
              type="button"
              onClick={() => setMethod("email")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                method === "email"
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              ✉️ Email
            </button>
          </div>
        </div>

        {otp === "" ? (
          <>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 text-center">
              {method === "phone"
                ? "Enter your phone number to login or create an account"
                : "Enter your email to login or create an account"}
            </p>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={method === "phone" ? "phoneNumber" : "email"}>
                  {method === "phone" ? "Phone Number" : "Email Address"}
                </Label>
                <Input
                  id={method === "phone" ? "phoneNumber" : "email"}
                  type={method === "phone" ? "tel" : "email"}
                  placeholder={
                    method === "phone" ? "+1 234 567 8900" : "your@email.com"
                  }
                  value={method === "phone" ? phoneNumber : email}
                  onChange={method === "phone" ? handlePhoneChange : handleEmailChange}
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

              <Button type="submit" className="w-full" disabled={isLoading}>
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
              Enter the 6-digit code sent to{" "}
              <span className="font-medium">
                {method === "phone" ? phoneNumber : email}
              </span>
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
                OTP expires in {Math.floor(expiresIn / 60)}:
                {String(expiresIn % 60).padStart(2, "0")}
              </p>
            )}
          </>
        )}

        {/* Development Mode Hint */}
        {process.env.NODE_ENV === "development" && otp === "" && (
          <p className="text-xs text-[var(--muted-foreground)] text-center mt-4">
            💡 Tip: You can use either phone or email for OTP
          </p>
        )}
      </div>
    </div>
  );
}
