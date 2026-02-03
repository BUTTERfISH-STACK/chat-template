"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InstagramNavBar } from "@/components/ui/InstagramNav";

export default function CreatePage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"post" | "reel" | "story">("post");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-16">
      {/* Navigation */}
      <InstagramNavBar />

      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        {/* Header */}
        <header className="sticky top-16 z-10 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">Create</h1>
            <Button size="sm" className="font-semibold">Share</Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4">
          {/* Tab Selection */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSelectedTab("post")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === "post" ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">Post</span>
            </button>
            <button
              onClick={() => setSelectedTab("reel")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === "reel" ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">Reel</span>
            </button>
            <button
              onClick={() => setSelectedTab("story")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === "story" ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="font-semibold">Story</span>
            </button>
          </div>

          {/* Media Selection */}
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-semibold mb-2">Select from device</p>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedTab === "post" && " JPG, PNG files up to 10MB"}
              {selectedTab === "reel" && " MP4 files up to 90 seconds"}
              {selectedTab === "story" && " JPG, PNG, or MP4 files up to 10MB"}
            </p>
            <Button className="font-semibold">Choose File</Button>
          </div>

          {/* Caption */}
          <div className="mt-6">
            <label className="block text-sm font-semibold mb-2">Caption</label>
            <textarea
              className="ig-textarea"
              placeholder="Write a caption..."
              rows={4}
            />
          </div>

          {/* Location */}
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">Location</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-lg border border-border">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                placeholder="Add location"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Accessibility */}
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">Accessibility</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-lg border border-border">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <input
                type="text"
                placeholder="Alt text"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
