"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format as phone number
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `+${digits}`;
    if (digits.length <= 6) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    // Simulate sending OTP
    setTimeout(() => {
      // Store phone number in session storage for OTP verification
      sessionStorage.setItem("phoneNumber", phoneNumber);
      router.push("/otp");
    }, 1500);
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

      {/* Welcome Text */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Sign in with your phone number</p>
      </div>

      {/* Phone Login Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <div className="mb-4">
          <Input
            type="tel"
            placeholder="+1 234 567 8900"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className="bg-secondary border-border text-center text-lg py-6"
          />
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
        
        <Button
          type="submit"
          className="w-full font-semibold py-6"
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

      {/* Divider */}
      <div className="flex items-center w-full max-w-sm my-6">
        <div className="flex-1 border-t border-border" />
        <p className="px-4 text-sm text-muted-foreground font-semibold">OR</p>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Email Login Link */}
      <Link 
        href="/login/email" 
        className="text-primary font-semibold text-sm mb-6"
      >
        Sign in with email instead
      </Link>

      {/* Sign Up Link */}
      <div className="w-full max-w-sm p-4 bg-card rounded-lg border border-border text-center">
        <p className="text-sm">
          Don't have an account?{" "}
          <Link href="/otp" className="text-primary font-semibold">
            Sign up
          </Link>
        </p>
      </div>

      {/* Get the app */}
      <div className="mt-8 text-center">
        <p className="text-sm mb-4">Get the app.</p>
        <div className="flex items-center justify-center gap-2">
          <button className="bg-black rounded-lg overflow-hidden">
            <img 
              src="https://www.instagram.com/static/images/appstore-install-badges/badge-ios-english-en.png/180ae7a0bcf7.png" 
              alt="Download on the App Store"
              className="h-10"
            />
          </button>
          <button className="bg-black rounded-lg overflow-hidden">
            <img 
              src="https://www.instagram.com/static/images/appstore-install-badges/badge-android-english-en.png/e9cd846dc748.png" 
              alt="Get it on Google Play"
              className="h-10"
            />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          © 2024 Vellon X
        </p>
      </div>
    </div>
  );
}
