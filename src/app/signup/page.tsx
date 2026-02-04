"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SignupFormData {
  phoneNumber: string;
  username: string;
  fullName: string;
  email: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"phone" | "details">("phone");
  const [formData, setFormData] = useState<SignupFormData>({
    phoneNumber: "",
    username: "",
    fullName: "",
    email: "",
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, phoneNumber: value });
    setError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const validateForm = () => {
    if (formData.phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return false;
    }
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (formData.username.length > 30) {
      setError("Username must be less than 30 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
      setError("Username can only contain letters, numbers, dots, and underscores");
      return false;
    }
    if (formData.fullName.trim().length < 2) {
      setError("Please enter your full name");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === "phone") {
      const digits = formData.phoneNumber.replace(/\D/g, "");
      if (digits.length < 10) {
        setError("Please enter a valid phone number");
        return;
      }
      setStep("details");
    } else {
      if (!validateForm()) return;
      
      setIsLoading(true);
      try {
        // Check if username and email are available
        const response = await fetch("/api/auth/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Something went wrong");
          setIsLoading(false);
          return;
        }

        // Send OTP for signup
        const otpResponse = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: `+${formData.phoneNumber}`,
          }),
        });

        if (otpResponse.ok) {
          // Store form data in session for after OTP verification
          sessionStorage.setItem("signupData", JSON.stringify(formData));
          sessionStorage.setItem("phoneNumber", `+${formData.phoneNumber}`);
          sessionStorage.setItem("isSignup", "true");
          router.push("/otp");
        } else {
          setError("Failed to send OTP. Please try again.");
        }
      } catch (err) {
        setError("Connection error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
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

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className={`w-8 h-1 rounded-full transition-colors ${step === "phone" ? "bg-primary" : "bg-primary/30"}`} />
        <div className={`w-8 h-1 rounded-full transition-colors ${step === "details" ? "bg-primary" : "bg-muted"}`} />
      </div>

      {/* Step 1: Phone Number */}
      {step === "phone" && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2">Create your account</h1>
            <p className="text-muted-foreground">Enter your phone number to get started</p>
          </div>

          <form onSubmit={handleNextStep} className="w-full max-w-sm">
            <div className="mb-4">
              <input
                type="tel"
                placeholder="+27 82 123 4567"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                className="w-full px-4 py-4 bg-secondary border border-border rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </div>
            
            <Button
              type="submit"
              className="w-full font-semibold py-6"
              disabled={isLoading || formData.phoneNumber.length < 10}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="ig-loader" />
                  <span>Next</span>
                </div>
              ) : (
                "Next"
              )}
            </Button>
          </form>
        </>
      )}

      {/* Step 2: Details */}
      {step === "details" && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2">Complete your profile</h1>
            <p className="text-muted-foreground">Add your details to create your account</p>
          </div>

          <form onSubmit={handleNextStep} className="w-full max-w-sm">
            <div className="space-y-4 mb-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="username"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be your unique identifier on Vellon X
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive mb-4">{error}</p>}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 py-6"
                onClick={() => setStep("phone")}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 font-semibold py-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="ig-loader" />
                    <span>Sending code...</span>
                  </div>
                ) : (
                  "Send Code"
                )}
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Back to login */}
      <div className="mt-8">
        <button 
          onClick={() => router.push("/login")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Already have an account? <span className="text-primary font-semibold">Log in</span>
        </button>
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
