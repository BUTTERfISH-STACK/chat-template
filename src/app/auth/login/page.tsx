"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("+1234567890"); // Pre-filled for testing
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        throw new Error(data.error || "Failed to login");
      }

      // Store auth data in sessionStorage
      sessionStorage.setItem("authToken", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      
      // Set cookie for middleware access
      document.cookie = `authToken=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      
      // Navigate to chat page
      router.push("/chat");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-[var(--card)] rounded-lg border shadow-lg">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">
          Vellon Chat
        </h1>
        
        <p className="text-sm text-[var(--muted-foreground)] mb-6 text-center">
          Enter your phone number to login or create an account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 234 567 8900"
              value={phoneNumber}
              onChange={handleInputChange}
              className="w-full"
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
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin mr-2">⟳</span>
            ) : null}
            Login / Register
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Phone number length: {phoneNumber.length}
          </p>
        </form>
      </div>
    </div>
  );
}
