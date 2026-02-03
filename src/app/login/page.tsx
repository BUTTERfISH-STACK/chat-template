"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      router.push("/");
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

      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <Input
          type="text"
          placeholder="Phone number, username, or email"
          value={phoneOrEmail}
          onChange={(e) => setPhoneOrEmail(e.target.value)}
          className="mb-2 bg-secondary border-border"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 bg-secondary border-border"
        />
        
        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={isLoading || !phoneOrEmail || !password}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="ig-loader" />
              <span>Logging in...</span>
            </div>
          ) : (
            "Log in"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center w-full max-w-sm my-6">
        <div className="flex-1 border-t border-border" />
        <p className="px-4 text-sm text-muted-foreground font-semibold">OR</p>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Facebook Login */}
      <button className="flex items-center gap-2 text-primary font-semibold mb-6">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
        Log in with Facebook
      </button>

      {/* Forgot Password */}
      <button className="text-sm text-primary mb-6">
        Forgot password?
      </button>

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
          © 2024 Vellon X from Meta
        </p>
      </div>
    </div>
  );
}
