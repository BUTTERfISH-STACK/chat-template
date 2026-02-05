"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    const phoneRegex = /^[0-9+\-\s()]{10,}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number")
      return
    }

    setIsLoading(true)

    try {
      if (!isOtpSent) {
        // Request OTP
        console.log("Requesting OTP for:", phoneNumber)
        
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, action: "sendOTP" }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to send OTP")
        }

        console.log("OTP sent successfully:", data)
        setIsOtpSent(true)
        setError("")
      } else {
        // Verify OTP
        console.log("Verifying OTP:", otp)
        
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, otp, action: "verify" }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Invalid OTP")
        }

        console.log("Login successful:", data)
        
        // Store auth data using context
        login(phoneNumber, data.token, data.user)
        
        router.push("/chat")
        router.refresh()
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Failed to login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setIsOtpSent(false)
    setOtp("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-[var(--card)] rounded-lg border shadow-lg">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">
          Vellon Chat
        </h1>
        
        <p className="text-sm text-[var(--muted-foreground)] mb-6 text-center">
          {isOtpSent 
            ? "Enter the OTP sent to your phone"
            : "Enter your phone number to login or register"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isOtpSent ? (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-2xl tracking-widest"
                maxLength={6}
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-[var(--muted-foreground)] text-center">
                Check the server console for the OTP
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            {isOtpSent && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={resetForm}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || (!isOtpSent && !phoneNumber) || (isOtpSent && otp.length !== 6)}
            >
              {isLoading ? (
                <span className="animate-spin mr-2">⟳</span>
              ) : null}
              {isOtpSent ? "Verify OTP" : "Send OTP"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={resetForm}
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {isOtpSent ? "Didn't receive OTP? Request again" : ""}
          </button>
        </div>
      </div>
    </div>
  )
}
