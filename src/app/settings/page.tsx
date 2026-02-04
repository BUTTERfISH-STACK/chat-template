"use client";

import { useState, useEffect, useCallback } from "react";
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
                <Button variant="outline" size="sm">
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
                      @{user?.name?.toLowerCase().replace(/\s+/g, "") || "username"}
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

            <div className="space-y-4">
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
                      preferences.activityStatus ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                    )}
                    onClick={() => handlePreferenceChange("activityStatus", !preferences.activityStatus)}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                        preferences.activityStatus ? "translate-x-6" : "translate-x-0.5"
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
                      preferences.showLastSeen ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                    )}
                    onClick={() => handlePreferenceChange("showLastSeen", !preferences.showLastSeen)}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                        preferences.showLastSeen ? "translate-x-6" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Read Receipts */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Read Receipts</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Send read receipts when messages are read
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors cursor-pointer",
                      preferences.messageReadReceipts ? "bg-[var(--primary)]" : "bg-gray-300 dark:bg-gray-600"
                    )}
                    onClick={() => handlePreferenceChange("messageReadReceipts", !preferences.messageReadReceipts)}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5",
                        preferences.messageReadReceipts ? "translate-x-6" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Blocked Users */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Blocked Users</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {preferences.blockedUsers.length} users blocked
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Security Settings</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Manage your account security and authentication
              </p>
            </div>

            <div className="space-y-4">
              {/* Password */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Last changed: Never
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {user?.isVerified ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {user?.isVerified ? "Manage" : "Enable"}
                  </Button>
                </div>
              </div>

              {/* Sessions */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Active Sessions</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      1 active session
                    </p>
                  </div>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
              </div>

              {/* Login History */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login History</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      View your recent login activity
                    </p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
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
