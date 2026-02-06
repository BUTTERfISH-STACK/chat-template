"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from "@/lib/validators/passwordValidator";
import { validateField, getUserFriendlyError } from "@/lib/validators/registrationValidator";

interface FormData {
  phoneNumber: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  phoneNumber?: string;
  email?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  feedback: string[];
}

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "Very Weak",
    color: "bg-red-500",
    feedback: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Real-time password strength calculation
  useEffect(() => {
    if (formData.password) {
      const result = validatePassword(formData.password);
      setPasswordStrength({
        score: result.score,
        label: getPasswordStrengthLabel(result.score),
        color: getPasswordStrengthColor(result.score),
        feedback: result.errors.length > 0 ? result.errors : result.suggestions,
      });
    } else {
      setPasswordStrength({
        score: 0,
        label: "Very Weak",
        color: "bg-red-500",
        feedback: [],
      });
    }
  }, [formData.password]);

  // Real-time field validation
  const validateFieldOnChange = useCallback((name: string, value: string) => {
    let error: string | undefined;

    switch (name) {
      case "phoneNumber":
        const phoneResult = validateField("phoneNumber", value);
        if (!phoneResult.isValid && phoneResult.error) {
          error = getUserFriendlyError(phoneResult.error);
        }
        break;
      case "email":
        const emailResult = validateField("email", value);
        if (!emailResult.isValid && emailResult.error) {
          error = getUserFriendlyError(emailResult.error);
        }
        break;
      case "name":
        const nameResult = validateField("name", value);
        if (!nameResult.isValid && nameResult.error) {
          error = getUserFriendlyError(nameResult.error);
        }
        break;
      case "password":
        const passwordResult = validateField("password", value);
        if (!passwordResult.isValid && passwordResult.error) {
          error = getUserFriendlyError(passwordResult.error);
        }
        // Clear confirm password error when password changes
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
        } else {
          setErrors(prev => ({ ...prev, confirmPassword: undefined }));
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input
    let sanitizedValue = value;
    if (name === "name") {
      sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, "");
    } else if (name === "phoneNumber") {
      sanitizedValue = value.replace(/[^\d+\-\s()]/g, "");
    }
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setGeneralError("");
    
    // Validate on change
    validateFieldOnChange(name, sanitizedValue);
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};
    let hasErrors = false;

    // Phone validation
    const phoneResult = validateField("phoneNumber", formData.phoneNumber);
    if (!phoneResult.isValid && phoneResult.error) {
      newErrors.phoneNumber = getUserFriendlyError(phoneResult.error);
      hasErrors = true;
    }

    // Email validation (optional)
    if (formData.email) {
      const emailResult = validateField("email", formData.email);
      if (!emailResult.isValid && emailResult.error) {
        newErrors.email = getUserFriendlyError(emailResult.error);
        hasErrors = true;
      }
    }

    // Name validation
    const nameResult = validateField("name", formData.name);
    if (!nameResult.isValid && nameResult.error) {
      newErrors.name = getUserFriendlyError(nameResult.error);
      hasErrors = true;
    }

    // Password validation
    const passwordResult = validateField("password", formData.password);
    if (!passwordResult.isValid && passwordResult.error) {
      newErrors.password = getUserFriendlyError(passwordResult.error);
      hasErrors = true;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors: FieldErrors = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            fieldErrors[err.field as keyof FieldErrors] = err.message;
          });
          setErrors(fieldErrors);
          setGeneralError(data.message || "Please fix the errors below");
        } else {
          setGeneralError(data.message || "Registration failed. Please try again.");
        }
        return;
      }

      // Success
      setSuccessMessage(data.message || "Account created successfully!");
      
      // Redirect to chat after short delay
      setTimeout(() => {
        router.push("/chat");
        router.refresh();
      }, 1500);

    } catch (error) {
      console.error("Registration error:", error);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = 
    formData.phoneNumber.length >= 7 &&
    formData.name.length >= 2 &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    passwordStrength.score >= 2;

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            className={`h-11 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            disabled={isLoading}
            maxLength={50}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Phone Number Field */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="+1234567890"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`h-11 ${errors.phoneNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            disabled={isLoading}
            maxLength={20}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-500">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Email Field (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            className={`h-11 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              className={`h-11 pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              disabled={isLoading}
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {passwordStrength.label}
                </span>
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="text-xs text-gray-500 space-y-1">
                  {passwordStrength.feedback.slice(0, 3).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`h-11 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            disabled={isLoading}
            maxLength={128}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {/* General Error Message */}
        {generalError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {generalError}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
            {successMessage}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 font-semibold"
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>

        {/* Password Requirements Hint */}
        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-medium">Password requirements:</p>
          <ul className="space-y-1">
            <li className={formData.password.length >= 8 ? "text-green-600" : ""}>
              ✓ At least 8 characters
            </li>
            <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
              ✓ One uppercase letter
            </li>
            <li className={/[a-z]/.test(formData.password) ? "text-green-600" : ""}>
              ✓ One lowercase letter
            </li>
            <li className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>
              ✓ One number
            </li>
            <li className={/[!@#$%^&*]/.test(formData.password) ? "text-green-600" : ""}>
              ✓ One special character (!@#$%^&*)
            </li>
          </ul>
        </div>
      </form>
    </div>
  );
}
