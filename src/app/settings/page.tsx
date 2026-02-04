"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    bio: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    darkMode: false,
    notifications: true,
    autoDownload: false,
    language: "English",
    activityStatus: true,
  });

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

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem("userPreferences");
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error("Failed to parse preferences:", e);
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPrefs: UserPreferences) => {
    localStorage.setItem("userPreferences", JSON.stringify(newPrefs));
    setPreferences(newPrefs);
  }, []);

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

      // Update user in auth context and sessionStorage
      updateUser({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
      });

      showToast("success", "Profile updated successfully!");
      setIsEditing(false);
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
    showToast("success", `${key.charAt(0).toUpperCase() + key.slice(1)} preference updated`);
  };

  // Handle input changes
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Setting item interface
  interface SettingItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    description?: string;
    action?: string | React.ReactNode;
    onClick?: () => void;
  }

  const accountSettings: SettingItem[] = [
    {
      id: "edit-profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: "Edit Profile",
      description: "Update your personal information",
      onClick: () => setIsEditing(true),
    },
    {
      id: "change-password",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: "Change Password",
      description: "Update your password for security",
      onClick: () => router.push("/settings/password"),
    },
    {
      id: "two-factor",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      label: "Two-Factor Authentication",
      description: "Add an extra layer of security",
      action: user?.isVerified ? "Enabled" : "Disabled",
      onClick: () => router.push("/settings/two-factor"),
    },
  ];

  const preferencesSettings: SettingItem[] = [
    {
      id: "notifications",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      label: "Notifications",
      description: "Manage your notification preferences",
      action: (
        <div
          className={cn(
            "w-12 h-6 rounded-full transition-colors cursor-pointer",
            preferences.notifications ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
          )}
          onClick={(e) => {
            e.stopPropagation();
            handlePreferenceChange("notifications", !preferences.notifications);
          }}
        >
          <div
            className={cn(
              "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
              preferences.notifications ? "translate-x-6" : "translate-x-0.5"
            )}
          />
        </div>
      ),
    },
    {
      id: "dark-mode",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      label: "Dark Mode",
      description: "Toggle dark theme",
      action: (
        <div
          className={cn(
            "w-12 h-6 rounded-full transition-colors cursor-pointer",
            preferences.darkMode ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
          )}
          onClick={(e) => {
            e.stopPropagation();
            handlePreferenceChange("darkMode", !preferences.darkMode);
          }}
        >
          <div
            className={cn(
              "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
              preferences.darkMode ? "translate-x-6" : "translate-x-0.5"
            )}
          />
        </div>
      ),
    },
    {
      id: "language",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      label: "Language",
      description: "Choose your preferred language",
      action: preferences.language,
      onClick: () => router.push("/settings/language"),
    },
  ];

  const privacySettings: SettingItem[] = [
    {
      id: "activity-status",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: "Activity Status",
      description: "Show when you're active",
      action: (
        <div
          className={cn(
            "w-12 h-6 rounded-full transition-colors cursor-pointer",
            preferences.activityStatus ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
          )}
          onClick={(e) => {
            e.stopPropagation();
            handlePreferenceChange("activityStatus", !preferences.activityStatus);
          }}
        >
          <div
            className={cn(
              "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
              preferences.activityStatus ? "translate-x-6" : "translate-x-0.5"
            )}
          />
        </div>
      ),
    },
    {
      id: "auto-download",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      label: "Auto-Download Media",
      description: "Automatically download received media",
      action: (
        <div
          className={cn(
            "w-12 h-6 rounded-full transition-colors cursor-pointer",
            preferences.autoDownload ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
          )}
          onClick={(e) => {
            e.stopPropagation();
            handlePreferenceChange("autoDownload", !preferences.autoDownload);
          }}
        >
          <div
            className={cn(
              "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
              preferences.autoDownload ? "translate-x-6" : "translate-x-0.5"
            )}
          />
        </div>
      ),
    },
  ];

  const moreSettings: SettingItem[] = [
    {
      id: "help",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Help",
      description: "Get help and support",
      onClick: () => router.push("/settings/help"),
    },
    {
      id: "about",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "About",
      description: "Version 1.0.0",
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold">Settings</h1>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="text-[var(--muted-foreground)]"
                >
                  Cancel
                </Button>
              )}
            </div>
          </header>

          {/* Profile Section */}
          <div className="border-b border-[var(--border)]">
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                {isEditing ? "Edit Profile" : "Profile"}
              </p>
            </div>

            {isEditing ? (
              // Edit Profile Form
              <div className="px-4 py-4 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-2xl">
                      {formData.name.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      JPG, PNG or GIF. Max 2MB
                    </p>
                  </div>
                </div>

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
            ) : (
              // View Profile
              <Link
                href="/profile"
                className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--secondary)] transition-colors cursor-pointer"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{user?.name || "Guest User"}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{user?.email || "No email set"}</p>
                  {user?.bio && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1">
                      {user.bio}
                    </p>
                  )}
                </div>
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* Account Settings */}
          <div className="border-b border-[var(--border)]">
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Account</p>
            </div>
            {accountSettings.map((setting) => (
              <button
                key={setting.id}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--secondary)] transition-colors cursor-pointer text-left"
                onClick={setting.onClick}
              >
                <div className="text-[var(--muted-foreground)]">{setting.icon}</div>
                <div className="flex-1">
                  <p className="text-sm">{setting.label}</p>
                  {setting.description && (
                    <p className="text-xs text-[var(--muted-foreground)]">{setting.description}</p>
                  )}
                </div>
                {setting.action && typeof setting.action === "string" && (
                  <p className="text-sm text-[var(--muted-foreground)]">{setting.action}</p>
                )}
                <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* Privacy Settings */}
          <div className="border-b border-[var(--border)]">
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Privacy</p>
            </div>
            {privacySettings.map((setting) => (
              <button
                key={setting.id}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--secondary)] transition-colors cursor-pointer text-left"
                onClick={setting.onClick}
              >
                <div className="text-[var(--muted-foreground)]">{setting.icon}</div>
                <div className="flex-1">
                  <p className="text-sm">{setting.label}</p>
                  {setting.description && (
                    <p className="text-xs text-[var(--muted-foreground)]">{setting.description}</p>
                  )}
                </div>
                {setting.action && typeof setting.action !== "string" && setting.action}
                {setting.action && typeof setting.action === "string" && (
                  <p className="text-sm text-[var(--muted-foreground)]">{setting.action}</p>
                )}
                {!setting.action && (
                  <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Preferences Settings */}
          <div className="border-b border-[var(--border)]">
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Preferences</p>
            </div>
            {preferencesSettings.map((setting) => (
              <button
                key={setting.id}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--secondary)] transition-colors cursor-pointer text-left"
                onClick={setting.onClick}
              >
                <div className="text-[var(--muted-foreground)]">{setting.icon}</div>
                <div className="flex-1">
                  <p className="text-sm">{setting.label}</p>
                  {setting.description && (
                    <p className="text-xs text-[var(--muted-foreground)]">{setting.description}</p>
                  )}
                </div>
                {setting.action && typeof setting.action !== "string" && setting.action}
                {setting.action && typeof setting.action === "string" && (
                  <p className="text-sm text-[var(--muted-foreground)]">{setting.action}</p>
                )}
                {setting.id === "notifications" || setting.id === "dark-mode" ? (
                  setting.action
                ) : (
                  !setting.onClick && (
                    <p className="text-sm text-[var(--muted-foreground)]">{setting.action}</p>
                  )
                )}
                {setting.onClick && (
                  <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* More Settings */}
          <div className="border-b border-[var(--border)]">
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">More</p>
            </div>
            {moreSettings.map((setting) => (
              <button
                key={setting.id}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--secondary)] transition-colors cursor-pointer text-left"
                onClick={setting.onClick}
              >
                <div className="text-[var(--muted-foreground)]">{setting.icon}</div>
                <div className="flex-1">
                  <p className="text-sm">{setting.label}</p>
                  {setting.description && (
                    <p className="text-xs text-[var(--muted-foreground)]">{setting.description}</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="p-4">
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

          {/* Version */}
          <div className="pb-8 text-center">
            <p className="text-xs text-[var(--muted-foreground)]">Version 1.0.0</p>
          </div>
        </div>
      </main>

      {/* Mobile bottom spacer */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
