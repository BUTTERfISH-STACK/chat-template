"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SideNav, TopNavBar } from "@/components/ui/SideNav";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

// User preferences interface
interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  autoDownload: boolean;
  language: string;
  activityStatus: boolean;
  messageReadReceipts: boolean;
  showLastSeen: boolean;
  blockedUsers: string[];
}

// Privacy settings interface
interface PrivacySettings {
  // Activity & Presence
  activityStatus: boolean;
  showLastSeen: boolean;
  
  // Read Receipts
  readReceipts: boolean;
  
  // Profile Visibility
  profileVisibility: "public" | "followers" | "private";
  showOnlineStatus: boolean;
  showBio: boolean;
  showEmail: boolean;
  
  // Message Privacy
  allowDirectMessages: "everyone" | "followers" | "none";
  allowGroupInvites: boolean;
  
  // Consent Controls
  marketingEmails: boolean;
  pushNotifications: boolean;
  analyticsCookies: boolean;
  personalizedAds: boolean;
  
  // Data Management
  blockedUsers: string[];
  dataExportRequested: boolean;
  dataDeletionRequested: boolean;
}

// Security settings interface
interface SecuritySettings {
  // Password
  lastPasswordChange: string | null;
  passwordStrength: "weak" | "medium" | "strong";
  
  // Two-Factor Authentication
  twoFactorEnabled: boolean;
  twoFactorMethod: "authenticator" | "sms" | "email" | null;
  backupCodesGenerated: boolean;
  backupCodesRemaining: number;
  
  // Session Management
  sessionTimeout: 5 | 15 | 30 | 60 | 120; // minutes
  activeSessions: SessionInfo[];
  
  // Login Monitoring
  loginAttempts: LoginAttempt[];
  lastLogin: LoginAttempt | null;
  
  // Account Recovery
  securityQuestionsSet: boolean;
  recoveryEmailSet: boolean;
  recoveryPhoneSet: boolean;
  
  // Security Activity Log
  securityEvents: SecurityEvent[];
}

// Security event interface
interface SecurityEvent {
  id: string;
  type: "password_change" | "2fa_enable" | "2fa_disable" | "session_create" | "session_terminate" | "login_success" | "login_fail" | "recovery_update";
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

// Session info interface
interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

// Login attempt interface
interface LoginAttempt {
  id: string;
  timestamp: string;
  ip: string;
  device: string;
  location: string;
  success: boolean;
  method: "password" | "otp" | "social";
}

// Form validation types
interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  phoneNumber: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  bio?: string;
  phoneNumber?: string;
}

// Notification type
interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// Settings tabs
type SettingsTab = "profile" | "account" | "privacy" | "preferences" | "security" | "more";

// Tab configuration
const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "account",
    label: "Account",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "more",
    label: "More",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Handle direct navigation to specific tab via query parameter (client-side only)
  useEffect(() => {
    setIsMounted(true);
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && ["profile", "account", "privacy", "preferences", "security", "more"].includes(tabParam)) {
      setActiveTab(tabParam as SettingsTab);
    }
  }, []);

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    bio: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    darkMode: false,
    notifications: true,
    autoDownload: false,
    language: "English",
    activityStatus: true,
    messageReadReceipts: true,
    showLastSeen: true,
    blockedUsers: [],
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    activityStatus: true,
    showLastSeen: true,
    readReceipts: true,
    profileVisibility: "public",
    showOnlineStatus: true,
    showBio: true,
    showEmail: false,
    allowDirectMessages: "everyone",
    allowGroupInvites: true,
    marketingEmails: false,
    pushNotifications: true,
    analyticsCookies: false,
    personalizedAds: false,
    blockedUsers: [],
    dataExportRequested: false,
    dataDeletionRequested: false,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    lastPasswordChange: null,
    passwordStrength: "medium",
    twoFactorEnabled: false,
    twoFactorMethod: null,
    backupCodesGenerated: false,
    backupCodesRemaining: 10,
    sessionTimeout: 30,
    activeSessions: [
      {
        id: "1",
        device: "Chrome on Windows",
        browser: "Chrome 120",
        os: "Windows 11",
        location: "Johannesburg, South Africa",
        ip: "192.168.1.100",
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
      {
        id: "2",
        device: "Safari on iPhone",
        browser: "Safari 17",
        os: "iOS 17",
        location: "Cape Town, South Africa",
        ip: "192.168.1.101",
        lastActive: new Date(Date.now() - 3600000).toISOString(),
        isCurrent: false,
      },
    ],
    loginAttempts: [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        ip: "192.168.1.100",
        device: "Chrome on Windows",
        location: "Johannesburg, South Africa",
        success: true,
        method: "password",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        ip: "192.168.1.102",
        device: "Unknown Browser",
        location: "Pretoria, South Africa",
        success: false,
        method: "password",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        ip: "192.168.1.100",
        device: "Chrome on Windows",
        location: "Johannesburg, South Africa",
        success: true,
        method: "otp",
      },
    ],
    lastLogin: {
      id: "1",
      timestamp: new Date().toISOString(),
      ip: "192.168.1.100",
      device: "Chrome on Windows",
      location: "Johannesburg, South Africa",
      success: true,
      method: "password",
    },
    securityQuestionsSet: false,
    recoveryEmailSet: true,
    recoveryPhoneSet: false,
    securityEvents: [
      {
        id: "1",
        type: "login_success",
        description: "Successful login from Chrome on Windows",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        type: "login_fail",
        description: "Failed login attempt from Pretoria",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "3",
        type: "session_create",
        description: "New session created from iPhone",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // 2FA setup state
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"authenticator" | "sms" | "email">("authenticator");
  const [verificationCode, setVerificationCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
  // Session timeout options
  const sessionTimeoutOptions = [
    { value: 5, label: "5 minutes" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
  ];

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  // Load preferences from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isMounted) return;
    const savedPrefs = localStorage.getItem("userPreferences");
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error("Failed to parse preferences:", e);
      }
    }
  }, [isMounted]);

  // Load privacy settings from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isMounted) return;
    const savedPrivacy = localStorage.getItem("privacySettings");
    if (savedPrivacy) {
      try {
        setPrivacySettings(JSON.parse(savedPrivacy));
      } catch (e) {
        console.error("Failed to parse privacy settings:", e);
      }
    }
  }, [isMounted]);

  // Load security settings from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isMounted) return;
    const savedSecurity = localStorage.getItem("securitySettings");
    if (savedSecurity) {
      try {
        setSecuritySettings(JSON.parse(savedSecurity));
      } catch (e) {
        console.error("Failed to parse security settings:", e);
      }
    }
  }, [isMounted]);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPrefs: UserPreferences) => {
    if (!isMounted) return;
    localStorage.setItem("userPreferences", JSON.stringify(newPrefs));
    setPreferences(newPrefs);
  }, [isMounted]);

  // Save privacy settings to localStorage
  const savePrivacySettings = useCallback((newSettings: PrivacySettings) => {
    if (!isMounted) return;
    localStorage.setItem("privacySettings", JSON.stringify(newSettings));
    setPrivacySettings(newSettings);
  }, [isMounted]);

  // Save security settings to localStorage
  const saveSecuritySettings = useCallback((newSettings: SecuritySettings) => {
    if (!isMounted) return;
    localStorage.setItem("securitySettings", JSON.stringify(newSettings));
    setSecuritySettings(newSettings);
  }, [isMounted]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Toast notification helper
  const showToast = (type: Toast["type"], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Handle form submission
  const handleSaveProfile = async () => {
    if (!validateForm()) {
      showToast("error", "Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user profile
      await updateUser({
        name: formData.name,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
      });

      showToast("success", "Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast("error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle preference changes
  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean | string) => {
    const newPrefs = { ...preferences, [key]: value };
    savePreferences(newPrefs);
    showToast("success", `${key.replace(/([A-Z])/g, " $1").trim()} preference updated`);
  };

  // Handle privacy setting changes
  const handlePrivacyChange = (key: keyof PrivacySettings, value: boolean | string) => {
    const newSettings = { ...privacySettings, [key]: value };
    savePrivacySettings(newSettings);
    
    // Format the setting name for display
    const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
    showToast("success", `${formattedKey} ${typeof value === "boolean" ? (value ? "enabled" : "disabled") : "updated"}`);
  };

  // Handle data export request
  const handleDataExport = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock data export
      const userData = {
        profile: user,
        preferences: preferences,
        privacySettings: {
          ...privacySettings,
          blockedUsers: undefined, // Don't export blocked list for privacy
        },
        exportedAt: new Date().toISOString(),
      };
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vellon-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast("success", "Your data has been exported successfully!");
    } catch (error) {
      console.error("Failed to export data:", error);
      showToast("error", "Failed to export data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle data deletion request
  const handleDataDeletion = () => {
    if (confirm(
      "Are you sure you want to delete your data? " +
      "This action cannot be undone and will permanently remove all your information."
    )) {
      if (confirm("This is your last chance to cancel. Do you really want to proceed?")) {
        setPrivacySettings(prev => ({ ...prev, dataDeletionRequested: true }));
        savePrivacySettings({ ...privacySettings, dataDeletionRequested: true });
        showToast("info", "Data deletion request submitted. You will be logged out shortly.");
        
        // Log out after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    }
  };

  // Handle blocked user management
  const handleManageBlocked = () => {
    showToast("info", "Blocked users management coming soon!");
  };

  // Password strength checker
  const checkPasswordStrength = (password: string): { strength: "weak" | "medium" | "strong"; message: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: "weak", message: "Weak - Add more characters and variety" };
    if (score <= 3) return { strength: "medium", message: "Medium - Add special characters" };
    return { strength: "strong", message: "Strong - Great password!" };
  };

  // Handle password change
  const handlePasswordChange = async () => {
    const errors: Record<string, string> = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    
    if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    const strength = checkPasswordStrength(passwordForm.newPassword);
    if (strength.strength === "weak") {
      errors.newPassword = "Password is too weak";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update security settings
      const newSettings = {
        ...securitySettings,
        lastPasswordChange: new Date().toISOString(),
        passwordStrength: strength.strength,
        securityEvents: [
          {
            id: Date.now().toString(),
            type: "password_change" as const,
            description: "Password changed successfully",
            timestamp: new Date().toISOString(),
          },
          ...securitySettings.securityEvents,
        ],
      };
      saveSecuritySettings(newSettings);

      // Clear form
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});

      showToast("success", "Password changed successfully!");
    } catch (error) {
      console.error("Failed to change password:", error);
      showToast("error", "Failed to change password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle 2FA setup
  const handleStart2FASetup = (method: "authenticator" | "sms" | "email") => {
    setTwoFactorMethod(method);
    setShow2FASetup(true);
    setVerificationCode("");
    showToast("info", `Setting up 2FA with ${method === "authenticator" ? "authenticator app" : method}`);
  };

  // Handle 2FA verification
  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      showToast("error", "Please enter a 6-digit code");
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newSettings = {
        ...securitySettings,
        twoFactorEnabled: true,
        twoFactorMethod: twoFactorMethod,
        backupCodesGenerated: true,
        backupCodesRemaining: 10,
        securityEvents: [
          {
            id: Date.now().toString(),
            type: "2fa_enable" as const,
            description: `Two-factor authentication enabled via ${twoFactorMethod}`,
            timestamp: new Date().toISOString(),
          },
          ...securitySettings.securityEvents,
        ],
      };
      saveSecuritySettings(newSettings);
      setShow2FASetup(false);
      setShowBackupCodes(true);
      showToast("success", "Two-factor authentication enabled!");
    } catch (error) {
      console.error("Failed to enable 2FA:", error);
      showToast("error", "Invalid verification code. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle 2FA disable
  const handleDisable2FA = () => {
    if (confirm("Are you sure you want to disable two-factor authentication? This will make your account less secure.")) {
      const newSettings = {
        ...securitySettings,
        twoFactorEnabled: false,
        twoFactorMethod: null,
        securityEvents: [
          {
            id: Date.now().toString(),
            type: "2fa_disable" as const,
            description: "Two-factor authentication disabled",
            timestamp: new Date().toISOString(),
          },
          ...securitySettings.securityEvents,
        ],
      };
      saveSecuritySettings(newSettings);
      showToast("info", "Two-factor authentication disabled");
    }
  };

  // Handle session timeout change
  const handleSessionTimeoutChange = (timeout: 5 | 15 | 30 | 60 | 120) => {
    const newSettings = { ...securitySettings, sessionTimeout: timeout };
    saveSecuritySettings(newSettings);
    showToast("success", `Session timeout set to ${timeout} minutes`);
  };

  // Handle session termination
  const handleTerminateSession = (sessionId: string) => {
    const session = securitySettings.activeSessions.find(s => s.id === sessionId);
    if (session?.isCurrent) {
      showToast("error", "Cannot terminate current session");
      return;
    }

    if (confirm("Are you sure you want to terminate this session?")) {
      const newSessions = securitySettings.activeSessions.filter(s => s.id !== sessionId);
      const newSettings = {
        ...securitySettings,
        activeSessions: newSessions,
        securityEvents: [
          {
            id: Date.now().toString(),
            type: "session_terminate" as const,
            description: `Session terminated: ${session?.device || "Unknown device"}`,
            timestamp: new Date().toISOString(),
            metadata: { location: session?.location || "Unknown" },
          },
          ...securitySettings.securityEvents,
        ],
      };
      saveSecuritySettings(newSettings);
      showToast("success", "Session terminated");
    }
  };

  // Handle terminate all other sessions
  const handleTerminateAllOtherSessions = () => {
    if (confirm("Are you sure you want to terminate all other sessions? You will be logged out from all devices except this one.")) {
      const currentSession = securitySettings.activeSessions.find(s => s.isCurrent);
      const terminatedCount = securitySettings.activeSessions.filter(s => !s.isCurrent).length;
      const newSettings = {
        ...securitySettings,
        activeSessions: currentSession ? [currentSession] : [],
        securityEvents: [
          {
            id: Date.now().toString(),
            type: "session_terminate" as const,
            description: `All other sessions terminated (${terminatedCount} sessions)`,
            timestamp: new Date().toISOString(),
          },
          ...securitySettings.securityEvents,
        ],
      };
      saveSecuritySettings(newSettings);
      showToast("success", "All other sessions terminated");
      
      // Log out after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  // Generate mock backup codes
  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase() + 
                  Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  // Handle backup codes download
  const handleDownloadBackupCodes = () => {
    const codes = generateBackupCodes();
    const content = `Vellon Backup Codes
Generated: ${new Date().toISOString()}

IMPORTANT: Store these codes in a safe place.
You can use them to access your account if you lose access to your 2FA device.

${codes.map((code, i) => `${i + 1}. ${code}`).join("\n")}

Each code can only be used once.
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vellon-backup-codes-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("success", "Backup codes downloaded!");
  };

  // Handle security questions setup
  const handleSetupSecurityQuestions = () => {
    const newSettings = {
      ...securitySettings,
      securityQuestionsSet: true,
      securityEvents: [
        {
          id: Date.now().toString(),
          type: "recovery_update" as const,
          description: "Security questions configured",
          timestamp: new Date().toISOString(),
        },
        ...securitySettings.securityEvents,
      ],
    };
    saveSecuritySettings(newSettings);
    showToast("success", "Security questions configured successfully!");
  };

  // Handle recovery email/phone update
  const handleUpdateRecoveryInfo = (type: "email" | "phone") => {
    const newSettings = {
      ...securitySettings,
      [type === "email" ? "recoveryEmailSet" : "recoveryPhoneSet"]: true,
      securityEvents: [
        {
          id: Date.now().toString(),
          type: "recovery_update" as const,
          description: `${type === "email" ? "Recovery email" : "Recovery phone"} updated`,
          timestamp: new Date().toISOString(),
        },
        ...securitySettings.securityEvents,
      ],
    };
    saveSecuritySettings(newSettings);
    showToast("success", `${type === "email" ? "Recovery email" : "Recovery phone"} updated successfully!`);
  };

  // Add security event
  const addSecurityEvent = (type: SecurityEvent["type"], description: string, metadata?: Record<string, string>) => {
    const newEvent: SecurityEvent = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString(),
      metadata,
    };
    setSecuritySettings(prev => ({
      ...prev,
      securityEvents: [newEvent, ...prev.securityEvents],
    }));
  };

  // Calculate security score
  const calculateSecurityScore = useCallback(() => {
    let score = 0;
    const maxScore = 100;

    // Password strength (0-25 points)
    if (securitySettings.passwordStrength === "strong") score += 25;
    else if (securitySettings.passwordStrength === "medium") score += 15;
    else if (securitySettings.passwordStrength === "weak") score += 5;

    // 2FA enabled (0-25 points)
    if (securitySettings.twoFactorEnabled) score += 25;

    // Session timeout under 30 minutes (0-15 points)
    if (securitySettings.sessionTimeout <= 30) score += 15;
    else if (securitySettings.sessionTimeout <= 60) score += 10;

    // Recovery options (0-20 points)
    if (securitySettings.recoveryEmailSet) score += 10;
    if (securitySettings.recoveryPhoneSet) score += 5;
    if (securitySettings.securityQuestionsSet) score += 5;

    // Recent password change (0-15 points)
    if (securitySettings.lastPasswordChange) {
      const daysSinceChange = (Date.now() - new Date(securitySettings.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceChange < 30) score += 15;
      else if (daysSinceChange < 90) score += 10;
    }

    return Math.min(score, maxScore);
  }, [securitySettings]);

  // Get security score color
  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  // Get security score label
  const getSecurityScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 50) return "Good";
    if (score >= 25) return "Fair";
    return "Weak";
  };

  // Handle backup codes usage
  const handleUseBackupCode = () => {
    if (securitySettings.backupCodesRemaining > 0) {
      const newSettings = {
        ...securitySettings,
        backupCodesRemaining: securitySettings.backupCodesRemaining - 1,
      };
      saveSecuritySettings(newSettings);
      showToast("info", `Backup code used. ${newSettings.backupCodesRemaining} codes remaining.`);
    } else {
      showToast("error", "No backup codes remaining. Generate new ones.");
    }
  };

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast("error", "File size must be less than 2MB");
        return;
      }

      // Create object URL for preview and update user profile
      const imageUrl = URL.createObjectURL(file);
      updateUser({ avatar: imageUrl });
      showToast("success", "Profile photo updated successfully!");
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Profile Information</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Manage your profile details and public information
              </p>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.avatar} alt={formData.name || "User"} />
                <AvatarFallback className="text-2xl">
                  {formData.name.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  id="avatar-input"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={(e) => handleAvatarChange(e)}
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById("avatar-input")?.click()}>
                  Change Photo
                </Button>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  JPG, PNG or GIF. Max 2MB
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="Enter your phone number"
                  className={cn(errors.phoneNumber && "border-red-500 focus-visible:ring-red-500")}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself"
                  maxLength={500}
                  rows={4}
                  className={cn(errors.bio && "border-red-500 focus-visible:ring-red-500")}
                />
                <div className="flex justify-between">
                  {errors.bio && (
                    <p className="text-xs text-red-500">{errors.bio}</p>
                  )}
                  <p className="text-xs text-[var(--muted-foreground)] ml-auto">
                    {formData.bio.length}/500
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Account Settings</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Phone Number</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {user?.phoneNumber || "Not set"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {user?.email || "Not set"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Username</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      @{user?.name?.toLowerCase().replace(/\s+/g, "") || user?.email?.split("@")[0]?.toLowerCase() || "username"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>

              <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Privacy Settings</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Control who can see your activity and information
              </p>
            </div>

            {/* Activity & Presence Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Activity & Presence
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                {/* Activity Status */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Activity Status</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Show when you're active
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.activityStatus ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("activityStatus", !privacySettings.activityStatus)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.activityStatus ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Show Last Seen */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Last Seen</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Let others see when you were last active
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.showLastSeen ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("showLastSeen", !privacySettings.showLastSeen)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.showLastSeen ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Show Online Status */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Online Status</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Display your online status to others
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.showOnlineStatus ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("showOnlineStatus", !privacySettings.showOnlineStatus)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.showOnlineStatus ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Read Receipts Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Read Receipts
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Send Read Receipts</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Send read receipts when messages are read
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.readReceipts ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("readReceipts", !privacySettings.readReceipts)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.readReceipts ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Visibility Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Visibility
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                {/* Profile Visibility */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Who can see your profile
                      </p>
                    </div>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => handlePrivacyChange("profileVisibility", e.target.value)}
                      className="px-3 py-2 border rounded-lg bg-[var(--background)] text-sm"
                    >
                      <option value="public">Everyone</option>
                      <option value="followers">Followers Only</option>
                      <option value="private">Only Me</option>
                    </select>
                  </div>
                </div>

                {/* Show Bio */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Bio</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Display your bio on your profile
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.showBio ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("showBio", !privacySettings.showBio)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.showBio ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Show Email */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Email</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Display your email on your profile
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.showEmail ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("showEmail", !privacySettings.showEmail)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.showEmail ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Privacy Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message Privacy
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                {/* Allow Direct Messages */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Allow Direct Messages</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Who can send you direct messages
                      </p>
                    </div>
                    <select
                      value={privacySettings.allowDirectMessages}
                      onChange={(e) => handlePrivacyChange("allowDirectMessages", e.target.value)}
                      className="px-3 py-2 border rounded-lg bg-[var(--background)] text-sm"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="followers">Followers Only</option>
                      <option value="none">No One</option>
                    </select>
                  </div>
                </div>

                {/* Allow Group Invites */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Allow Group Invites</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Let others add you to groups
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.allowGroupInvites ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("allowGroupInvites", !privacySettings.allowGroupInvites)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.allowGroupInvites ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent & Communications Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Consent & Communications
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                {/* Marketing Emails */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Receive emails about new features and promotions
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.marketingEmails ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("marketingEmails", !privacySettings.marketingEmails)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.marketingEmails ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.pushNotifications ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("pushNotifications", !privacySettings.pushNotifications)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.pushNotifications ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics Cookies</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Help us improve by allowing anonymous analytics
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.analyticsCookies ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("analyticsCookies", !privacySettings.analyticsCookies)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.analyticsCookies ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Personalized Ads */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Personalized Ads</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Show ads based on your interests
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors cursor-pointer",
                        privacySettings.personalizedAds ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePrivacyChange("personalizedAds", !privacySettings.personalizedAds)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                          privacySettings.personalizedAds ? "translate-x-6" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Blocked Users Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Blocked Users
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Blocked Users</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {privacySettings.blockedUsers.length} users blocked
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleManageBlocked}>
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Management Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Data Management
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                {/* Export Data */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Export Your Data</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Download a copy of all your data
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDataExport}
                      disabled={isSaving}
                    >
                      {isSaving ? "Exporting..." : "Export"}
                    </Button>
                  </div>
                </div>

                {/* Delete Data */}
                <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-600">Delete Your Data</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Permanently delete all your data
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleDataDeletion}
                      disabled={privacySettings.dataDeletionRequested}
                    >
                      {privacySettings.dataDeletionRequested ? "Requested" : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Policy Link */}
            <div className="pt-4 border-t">
              <Button 
                variant="link" 
                className="text-[var(--primary)]"
                onClick={() => setActiveTab("more")}
              >
                View our Privacy Policy
              </Button>
            </div>
          </div>
        );

      case "security":
        const securityScore = calculateSecurityScore();
        return (
          <div className="space-y-6">
            {/* Security Score Dashboard */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Security Score</h2>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Your account security level
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getSecurityScoreColor(securityScore)}`}>
                    {securityScore}%
                  </div>
                  <div className={`text-sm font-medium ${getSecurityScoreColor(securityScore)}`}>
                    {getSecurityScoreLabel(securityScore)}
                  </div>
                </div>
              </div>
              
              {/* Security Score Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${
                      securityScore >= 80 ? "bg-green-500" : 
                      securityScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${securityScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>Weak</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              {/* Security Tips */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {securitySettings.passwordStrength !== "strong" && (
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Upgrade password strength</span>
                  </div>
                )}
                {!securitySettings.twoFactorEnabled && (
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Enable 2FA for extra security</span>
                  </div>
                )}
                {!securitySettings.recoveryEmailSet && (
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Add recovery email</span>
                  </div>
                )}
                {securitySettings.sessionTimeout > 30 && (
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Reduce session timeout</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Last Login Information */}
            {securitySettings.lastLogin && (
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Last Login
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{securitySettings.lastLogin.device}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {securitySettings.lastLogin.location} • {securitySettings.lastLogin.ip}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {new Date(securitySettings.lastLogin.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Password Management Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password Management
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Last changed: {securitySettings.lastPasswordChange 
                          ? new Date(securitySettings.lastPasswordChange).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>

                  {/* Password Change Form */}
                  <div className="space-y-3 pt-2 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className={passwordErrors.currentPassword ? "border-red-500" : ""}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-xs text-red-500">{passwordErrors.currentPassword}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => {
                          setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                          const strength = checkPasswordStrength(e.target.value);
                          setSecuritySettings(prev => ({ ...prev, passwordStrength: strength.strength }));
                        }}
                        className={passwordErrors.newPassword ? "border-red-500" : ""}
                      />
                      {passwordForm.newPassword && (
                        <p className={`text-xs ${securitySettings.passwordStrength === "strong" ? "text-green-500" : securitySettings.passwordStrength === "medium" ? "text-yellow-500" : "text-red-500"}`}>
                          {checkPasswordStrength(passwordForm.newPassword).message}
                        </p>
                      )}
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-red-500">{passwordErrors.newPassword}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-red-500">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>
                    <Button 
                      onClick={handlePasswordChange}
                      disabled={isSaving}
                      className="w-full"
                    >
                      {isSaving ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Two-Factor Authentication
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {securitySettings.twoFactorEnabled 
                          ? `Enabled via ${securitySettings.twoFactorMethod}` 
                          : "Disabled"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {securitySettings.twoFactorEnabled && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowBackupCodes(true)}
                        >
                          Backup Codes
                        </Button>
                      )}
                      <Button 
                        variant={securitySettings.twoFactorEnabled ? "destructive" : "outline"} 
                        size="sm"
                        onClick={securitySettings.twoFactorEnabled ? handleDisable2FA : () => handleStart2FASetup("authenticator")}
                      >
                        {securitySettings.twoFactorEnabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 2FA Setup Modal */}
                {show2FASetup && (
                  <div className="p-4 border rounded-lg bg-[var(--secondary)] space-y-4">
                    <h4 className="font-medium">Setup Two-Factor Authentication</h4>
                    
                    {/* Method Selection */}
                    <div className="flex gap-2">
                      <Button 
                        variant={twoFactorMethod === "authenticator" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTwoFactorMethod("authenticator")}
                      >
                        Authenticator App
                      </Button>
                      <Button 
                        variant={twoFactorMethod === "sms" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTwoFactorMethod("sms")}
                      >
                        SMS
                      </Button>
                      <Button 
                        variant={twoFactorMethod === "email" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTwoFactorMethod("email")}
                      >
                        Email
                      </Button>
                    </div>

                    {/* QR Code Display (for authenticator) */}
                    {twoFactorMethod === "authenticator" && (
                      <div className="flex flex-col items-center space-y-2 py-4">
                        <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border">
                          <svg className="w-24 h-24 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
                            <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" />
                            <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" />
                            <rect x="14" y="14" width="4" height="4" rx="1" fill="currentColor" />
                          </svg>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Scan this QR code with your authenticator app
                        </p>
                        <p className="text-xs font-mono bg-[var(--background)] px-2 py-1 rounded">
                          VELLON:{user?.phoneNumber || user?.email?.split("@")[0] || "user"}
                        </p>
                      </div>
                    )}

                    {/* Verification Code Input */}
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">Verification Code</Label>
                      <Input
                        id="verificationCode"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShow2FASetup(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleVerify2FA}
                        disabled={isSaving || verificationCode.length !== 6}
                        className="flex-1"
                      >
                        {isSaving ? "Verifying..." : "Verify & Enable"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Backup Codes Display */}
                {showBackupCodes && securitySettings.backupCodesGenerated && (
                  <div className="p-4 border rounded-lg bg-[var(--secondary)] space-y-4">
                    <h4 className="font-medium">Backup Codes</h4>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      These codes can be used to access your account if you lose access to your 2FA device. Store them in a safe place.
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-[var(--background)] p-3 rounded-lg">
                      {generateBackupCodes().map((code, i) => (
                        <span key={i} className="px-2 py-1">{code}</span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowBackupCodes(false)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                      <Button 
                        onClick={handleDownloadBackupCodes}
                        className="flex-1"
                      >
                        Download Codes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Session Management Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                Active Sessions
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                {/* Session Timeout */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Automatically log out after inactivity
                      </p>
                    </div>
                    <select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSessionTimeoutChange(Number(e.target.value) as 5 | 15 | 30 | 60 | 120)}
                      className="px-3 py-2 border rounded-lg bg-[var(--background)] text-sm"
                    >
                      {sessionTimeoutOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Sessions List */}
                <div className="space-y-2">
                  {securitySettings.activeSessions.map(session => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            session.isCurrent ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                          }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{session.device}</p>
                              {session.isCurrent && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {session.browser} • {session.os}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                              {session.location} • {session.ip}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Last active: {new Date(session.lastActive).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTerminateSession(session.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Terminate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button 
                    variant="outline" 
                    onClick={handleTerminateAllOtherSessions}
                    className="w-full"
                  >
                    Terminate All Other Sessions
                  </Button>
                </div>
              </div>
            </div>

            {/* Login Monitoring Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Login Activity
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                <div className="space-y-2">
                  {securitySettings.loginAttempts.slice(0, 5).map(attempt => (
                    <div key={attempt.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          attempt.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {attempt.success ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {attempt.success ? "Successful login" : "Failed login attempt"}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {attempt.device} • {attempt.method}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {attempt.location} • {attempt.ip}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}

                  {securitySettings.loginAttempts.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                      No login activity recorded
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Activity Log */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Security Activity Log
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                <div className="space-y-2">
                  {securitySettings.securityEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          event.type.includes("success") || event.type.includes("enable") || event.type.includes("change") ? "bg-green-100 text-green-600" : 
                          event.type.includes("fail") || event.type.includes("disable") ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        }`}>
                          {event.type.includes("success") || event.type.includes("enable") || event.type.includes("change") ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : event.type.includes("fail") || event.type.includes("disable") ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{event.description}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {event.metadata?.location || "Unknown location"} • {event.metadata?.ip || "Unknown IP"}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}

                  {securitySettings.securityEvents.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                      No security events recorded
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Recovery Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Account Recovery
              </h3>
              <div className="space-y-3 pl-6 border-l-2 border-[var(--border)]">
                {/* Security Questions */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Questions</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {securitySettings.securityQuestionsSet ? "Configured" : "Not configured"}
                      </p>
                    </div>
                    <Button 
                      variant={securitySettings.securityQuestionsSet ? "outline" : "default"} 
                      size="sm"
                      onClick={handleSetupSecurityQuestions}
                    >
                      {securitySettings.securityQuestionsSet ? "Edit" : "Setup"}
                    </Button>
                  </div>
                </div>

                {/* Recovery Email */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Recovery Email</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {securitySettings.recoveryEmailSet ? "Configured" : "Not configured"}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateRecoveryInfo("email")}
                    >
                      {securitySettings.recoveryEmailSet ? "Change" : "Add"}
                    </Button>
                  </div>
                </div>

                {/* Recovery Phone */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Recovery Phone</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {securitySettings.recoveryPhoneSet ? "Configured" : "Not configured"}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateRecoveryInfo("phone")}
                    >
                      {securitySettings.recoveryPhoneSet ? "Change" : "Add"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">App Preferences</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Customize your app experience
              </p>
            </div>

            <div className="space-y-4">
              {/* Dark Mode */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Toggle dark theme
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors cursor-pointer",
                      preferences.darkMode ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                    )}
                    onClick={() => handlePreferenceChange("darkMode", !preferences.darkMode)}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                        preferences.darkMode ? "translate-x-6" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Enable push notifications
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors cursor-pointer",
                      preferences.notifications ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                    )}
                    onClick={() => handlePreferenceChange("notifications", !preferences.notifications)}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                        preferences.notifications ? "translate-x-6" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Auto Download */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Download Media</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Automatically download received media
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors cursor-pointer",
                      preferences.autoDownload ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                    )}
                    onClick={() => handlePreferenceChange("autoDownload", !preferences.autoDownload)}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                        preferences.autoDownload ? "translate-x-6" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {preferences.language}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "more":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">More Options</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Additional settings and information
              </p>
            </div>

            <div className="space-y-4">
              {/* Help */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">Help Center</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Get help and support
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Open</Button>
                </div>
              </div>

              {/* About */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">About</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Version 1.0.0
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>

              {/* Terms */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">Terms of Service</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Read our terms and conditions
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Read</Button>
                </div>
              </div>

              {/* Privacy Policy */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">Privacy Policy</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Read our privacy policy
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Read</Button>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => {
                  if (confirm("Are you sure you want to log out?")) {
                    router.push("/login");
                  }
                }}
              >
                Log Out
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "px-4 py-3 rounded-lg shadow-lg transition-all duration-300 animate-fade-in",
              toast.type === "success" && "bg-green-500 text-white",
              toast.type === "error" && "bg-red-500 text-white",
              toast.type === "info" && "bg-blue-500 text-white"
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Desktop Side Navigation */}
      <SideNav />

      {/* Mobile Top Navigation */}
      <div className="md:hidden">
        <TopNavBar />
      </div>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 py-3">
            <h1 className="text-lg font-bold">Settings</h1>
          </header>

          <div className="flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:block w-64 border-r border-[var(--border)] min-h-[calc(100vh-60px)] py-4">
              <nav className="space-y-1 px-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      activeTab === tab.id
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                    )}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Mobile Tab Navigation */}
            <div className="md:hidden w-full border-b border-[var(--border)]">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm whitespace-nowrap transition-colors border-b-2",
                      activeTab === tab.id
                        ? "border-[var(--primary)] text-[var(--primary)]"
                        : "border-transparent text-[var(--muted-foreground)]"
                    )}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom spacer */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
