"use client"

/**
 * Login Page Component
 * Phone-based authentication with OTP verification
 * 
 * Features:
 * - Client-side input validation
 * - Real-time error handling
 * - Loading states
 * - User-friendly feedback
 * - Accessibility support
 */

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

// ============================================================================
// CONSTANTS
// ============================================================================

const PHONE_REGEX = /^[0-9+\-\s()]{10,}$/
const OTP_LENGTH = 6
const OTP_REGEX = /^\d{6}$/

// ============================================================================
// TYPES
// ============================================================================

interface LoginError {
  message: string
  code?: string
  retryAfter?: number
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  
  // Form state
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  
  // OTP timer state
  const [otpTimer, setOtpTimer] = useState(0)
  const [canResendOtp, setCanResendOtp] = useState(true)
  
  // Refs
  const otpInputRef = useRef<HTMLInputElement>(null)

  // Check for redirect parameter
  const redirectPath = searchParams.get("redirect") || "/chat"

  // Handle OTP timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [otpTimer])

  // Auto-focus OTP input when OTP is sent
  useEffect(() => {
    if (isOtpSent && otpInputRef.current) {
      otpInputRef.current.focus()
    }
  }, [isOtpSent])

  // ============================================================================
  // VALIDATION FUNCTIONS
  // ============================================================================

  /**
   * Validate phone number format
   * @param phone - Phone number to validate
   * @returns True if valid, false otherwise
   */
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone || phone.trim().length === 0) {
      setError({ message: "Phone number is required" })
      return false
    }
    
    if (!PHONE_REGEX.test(phone)) {
      setError({ message: "Please enter a valid phone number (e.g., +1 234 567 8900)" })
      return false
    }
    
    return true
  }

  /**
   * Validate OTP format
   * @param otpValue - OTP to validate
   * @returns True if valid, false otherwise
   */
  const validateOTP = (otpValue: string): boolean => {
    if (!otpValue || otpValue.trim().length === 0) {
      setError({ message: "OTP is required" })
      return false
    }
    
    if (!OTP_REGEX.test(otpValue)) {
      setError({ message: "Please enter a valid 6-digit OTP" })
      return false
    }
    
    return true
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage("")

    // Validate input based on current step
    if (!isOtpSent) {
      if (!validatePhoneNumber(phoneNumber)) {
        return
      }
    } else {
      if (!validateOTP(otp)) {
        return
      }
    }

    setIsLoading(true)

    try {
      if (!isOtpSent) {
        // Request OTP
        await handleSendOTP()
      } else {
        // Verify OTP
        await handleVerifyOTP()
      }
    } catch (err) {
      console.error("Login error:", err)
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle OTP request
   */
  const handleSendOTP = async () => {
    console.log("Requesting OTP for:", phoneNumber)
    
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, action: "send" }),
    })

    const data = await res.json()

    if (!res.ok) {
      // Handle rate limit errors
      if (res.status === 429) {
        throw {
          message: data.error || "Too many requests. Please try again later.",
          code: data.code,
          retryAfter: data.retryAfter,
        }
      }
      throw { message: data.error || "Failed to send OTP", code: data.code }
    }

    console.log("OTP sent successfully:", data)
    setIsOtpSent(true)
    setSuccessMessage("OTP sent successfully!")
    
    // Start OTP timer (5 minutes)
    setOtpTimer(300)
    setCanResendOtp(false)
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  /**
   * Handle OTP verification
   */
  const handleVerifyOTP = async () => {
    console.log("Verifying OTP for:", phoneNumber)
    
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, otp, action: "verify" }),
    })

    const data = await res.json()

    if (!res.ok) {
      // Handle rate limit errors
      if (res.status === 429) {
        throw {
          message: data.error || "Too many verification attempts. Please try again later.",
          code: data.code,
          retryAfter: data.retryAfter,
        }
      }
      throw { message: data.error || "Invalid OTP", code: data.code }
    }

    console.log("Login successful:", data)
    
    // Store auth data using context
    login(phoneNumber, data.token, data.user)
    
    // Redirect to the intended page or default to chat
    router.push(redirectPath)
    router.refresh()
  }

  /**
   * Handle errors from API calls
   */
  const handleError = (err: unknown) => {
    if (err && typeof err === "object") {
      const errorObj = err as { message?: string; code?: string; retryAfter?: number }
      setError({
        message: errorObj.message || "Failed to login. Please try again.",
        code: errorObj.code,
        retryAfter: errorObj.retryAfter,
      })
    } else {
      setError({ message: "Failed to login. Please try again." })
    }
  }

  /**
   * Reset the form to phone number input
   */
  const resetForm = () => {
    setIsOtpSent(false)
    setOtp("")
    setError(null)
    setSuccessMessage("")
    setOtpTimer(0)
    setCanResendOtp(true)
  }

  /**
   * Handle OTP resend
   */
  const handleResendOTP = async () => {
    if (!canResendOtp) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await handleSendOTP()
    } catch (err) {
      handleError(err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Format timer as MM:SS
   */
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-[var(--card)] rounded-lg border shadow-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Vellon Chat
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {isOtpSent 
              ? "Enter the OTP sent to your phone"
              : "Enter your phone number to login or register"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isOtpSent ? (
            /* Phone Number Input */
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  setError(null)
                }}
                className="w-full"
                disabled={isLoading}
                autoComplete="tel"
                aria-invalid={!!error}
                aria-describedby={error ? "phone-error" : undefined}
              />
            </div>
          ) : (
            /* OTP Input */
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input
                id="otp"
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH)
                  setOtp(value)
                  setError(null)
                }}
                className="w-full text-center text-2xl tracking-widest font-mono"
                disabled={isLoading}
                autoComplete="one-time-code"
                aria-invalid={!!error}
                aria-describedby={error ? "otp-error" : undefined}
              />
              <p className="text-xs text-[var(--muted-foreground)] text-center">
                {process.env.NODE_ENV === "development" 
                  ? "Check the server console for the OTP"
                  : "Enter the 6-digit code sent to your phone"
                }
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 text-center">
                {successMessage}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div 
              className="p-3 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              id={isOtpSent ? "otp-error" : "phone-error"}
            >
              <p className="text-sm text-red-800 text-center">
                {error.message}
                {error.retryAfter && (
                  <span className="block mt-1 text-xs">
                    Please wait {Math.ceil(error.retryAfter)} seconds before trying again.
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isOtpSent && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={resetForm}
                disabled={isLoading}
                aria-label="Go back to phone number input"
              >
                Back
              </Button>
            )}
            
            <Button
              type="submit"
              className="flex-1"
              disabled={
                isLoading || 
                (!isOtpSent && !phoneNumber) || 
                (isOtpSent && otp.length !== OTP_LENGTH)
              }
              aria-label={isOtpSent ? "Verify OTP" : "Send OTP"}
            >
              {isLoading ? (
                <span className="animate-spin mr-2" aria-hidden="true">⟳</span>
              ) : null}
              {isOtpSent ? "Verify OTP" : "Send OTP"}
            </Button>
          </div>
        </form>

        {/* Resend OTP Link */}
        {isOtpSent && (
          <div className="mt-6 text-center">
            {canResendOtp ? (
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline"
                disabled={isLoading}
              >
                Didn't receive OTP? Request again
              </button>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                Resend OTP in <span className="font-mono">{formatTimer(otpTimer)}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
