"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number (at least 10 digits)
    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    // Send OTP request to server
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: `+${phoneNumber}`,
        }),
      });

      if (response.ok) {
        // Store phone number in session storage for OTP verification
        sessionStorage.setItem("phoneNumber", `+${phoneNumber}`);
        router.push("/otp");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-3 sm:px-4">
      {/* Logo */}
      <div className="mb-6 sm:mb-8">
        <svg className="h-10 w-auto sm:h-12" viewBox="0 0 200 50" fill="none">
          <text x="0" y="38" fontFamily="inherit" fontSize="28" fontWeight="bold" fill="currentColor">
            Vellon X
          </text>
        </svg>
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-6 sm:mb-8 px-2">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">Welcome to Vellon X</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Enter your phone number to continue</p>
      </div>

      {/* Phone Login Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <div className="mb-4">
          <input
            type="tel"
            placeholder="+27 82 123 4567"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className="w-full px-4 py-3 sm:py-4 bg-secondary border border-border rounded-lg text-center text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
        
        <Button
          type="submit"
          className="w-full font-semibold py-3 sm:py-6"
          disabled={isLoading || phoneNumber.length < 10}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="ig-loader" />
              <span>Sending code...</span>
            </div>
          ) : (
            "Continue"
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="w-full max-w-sm p-3 sm:p-4 bg-card rounded-lg border border-border text-center mt-4 sm:mt-6">
        <p className="text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-xs sm:text-sm text-muted-foreground">
          © 2024 Vellon X
        </p>
      </div>
    </div>
  );
}
