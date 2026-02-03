"use client";

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  onChange?: (otp: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function OTPInput({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  error,
  className = '',
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange?.(otpString);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are filled
    if (otpString.length === length) {
      onComplete?.(otpString);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = [...otp];

    pastedData.split('').forEach((char, index) => {
      if (index < length) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);
    const otpString = newOtp.join('');
    onChange?.(otpString);
    onComplete?.(otpString);

    // Focus on the next empty input or the last input
    const nextIndex = pastedData.length < length ? pastedData.length : length - 1;
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-lg border-2
            transition-all duration-200 ease-out
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5'
              : 'border-border focus:border-primary focus:ring-primary/20 bg-background'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            animate-fade-in
          `}
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  );
}

export default OTPInput;
