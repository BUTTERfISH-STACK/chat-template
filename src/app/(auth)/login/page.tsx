"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        // Login using name and Gmail email
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setSuccess(result.message || "Login successful!");
          setTimeout(() => {
            router.push("/chat");
            router.refresh();
          }, 1000);
        } else {
          // Show more specific error message
          if (result.code === "INVALID_CREDENTIALS") {
            setError("No account found with this name and Gmail address. Please register first.");
          } else if (result.code === "RATE_LIMITED") {
            setError("Too many login attempts. Please try again later.");
          } else if (result.code === "DB_ERROR") {
            setError("Database error. Please contact support.");
          } else {
            setError(result.error || "Login failed. Please try again.");
          }
        }
      } else {
        // Registration still uses the existing API
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setSuccess(result.message || "Registration successful! You can now login.");
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ name: "", email: "" });
          }, 1500);
        } else {
          setError(result.message || result.error || "Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-[var(--background)] to-[var(--accent-purple)]/5" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-purple)]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-gold)]/5 rounded-full blur-3xl animate-pulse-soft" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5" />
      
      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary)]/10 mb-4">
            <svg className="w-8 h-8 text-[var(--primary)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Vellon</h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Gmail Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--muted-foreground)]">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="text-[var(--primary)] hover:underline font-medium"
              disabled={isLoading}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>

          {/* Direct link to dedicated registration page */}
          {isLogin && (
            <div className="mt-4 text-center">
              <Link 
                href="/register" 
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
              >
                Create a new account →
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
          Sign in with your name and Gmail address
        </p>
      </div>
    </div>
  );
}
