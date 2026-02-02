"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhoneNumber } from "@/lib/whatsapp";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    setGeneratedOtp("");

    try {
      // Format phone number consistently
      const formattedPhone = formatPhoneNumber(phoneNumber.trim());
      console.log(`[Login] Sending OTP request for: ${formattedPhone}`);
      
      // Send OTP via API - using unified auth endpoint
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formattedPhone }),
      });

      // Parse response
      const data = await response.json();

      // Handle non-OK responses
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // In development mode, show OTP
      if (data.otp) {
        console.log("Development OTP:", data.otp);
        sessionStorage.setItem("dev_otp", data.otp);
        setGeneratedOtp(data.otp);
        setSuccessMessage("OTP sent! Check the code below:");
      } else {
        // Navigate to OTP verification page
        router.push(`/otp?phone=${encodeURIComponent(formattedPhone)}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      console.error("OTP send error:", err);
      setIsLoading(false);
    }
  };

  const handleUseOtp = () => {
    if (generatedOtp) {
      const formattedPhone = formatPhoneNumber(phoneNumber.trim());
      router.push(`/otp?phone=${encodeURIComponent(formattedPhone)}`);
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
          <p className="text-muted-foreground mt-2">Premium Chat & Marketplace</p>
        </div>

        {/* Login Form */}
        <div className="card-premium animate-slide-up">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Welcome Back</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your phone number to continue</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-500 text-sm text-center mb-2">{successMessage}</p>
              <div className="bg-green-500/20 rounded-lg p-3 text-center">
                <p className="text-3xl font-bold text-green-500 tracking-widest">{generatedOtp}</p>
              </div>
              <Button
                onClick={handleUseOtp}
                className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white"
              >
                Enter OTP
              </Button>
            </div>
          )}

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 82 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input-premium pl-12"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!phoneNumber.trim() || isLoading}
              className="w-full btn-gold h-11"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending OTP...
                </span>
              ) : (
                "Continue with Phone"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button className="text-primary hover:underline">Sign up</button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our{" "}
              <button className="text-primary hover:underline">Terms of Service</button>
              {" "}and{" "}
              <button className="text-primary hover:underline">Privacy Policy</button>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}
