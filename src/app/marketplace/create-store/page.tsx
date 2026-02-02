"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateStorePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Creating store:", formData);
      setIsLoading(false);
      router.push("/marketplace");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="chat-header flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-foreground">Create Store</h1>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Logo Upload */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center mb-4 hover:border-primary transition-colors cursor-pointer">
              <div className="text-center">
                <svg className="w-8 h-8 text-muted-foreground mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-xs text-muted-foreground">Upload Logo</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Store Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="My Awesome Store"
                value={formData.name}
                onChange={handleChange}
                className="input-premium"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell customers about your store..."
                value={formData.description}
                onChange={handleChange}
                className="input-premium min-h-[100px]"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+27 82 123 4567"
                value={formData.phone}
                onChange={handleChange}
                className="input-premium"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contact@mystore.com"
                value={formData.email}
                onChange={handleChange}
                className="input-premium"
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-foreground">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Your store address..."
                value={formData.address}
                onChange={handleChange}
                className="input-premium min-h-[80px]"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!formData.name || !formData.phone || !formData.email || isLoading}
              className="w-full btn-gold h-11"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Store...
                </span>
              ) : (
                "Create Store"
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">One store per account</p>
                <p>You can only create one store per account. Make sure all information is accurate as it will be displayed to customers.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
