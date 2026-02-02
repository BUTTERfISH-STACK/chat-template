"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-gold" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-gold" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 text-center animate-fade-in">
        {/* 404 Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-glow">
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* 404 Number */}
        <h1 className="text-8xl font-bold text-gradient-gold mb-4 animate-slide-up">404</h1>

        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-foreground mb-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Page Not Found
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Button
            onClick={() => router.push("/login")}
            className="btn-gold h-11 px-8"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Go to Sign In
          </Button>
          
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="h-11 px-8 border-primary/50 text-primary hover:bg-primary/10"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>End-to-end encrypted</span>
        </div>
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
