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
