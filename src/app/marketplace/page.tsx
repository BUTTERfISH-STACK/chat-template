"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SideNav, TopNavBar } from "@/components/ui/SideNav";

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  aspectRatio: "square" | "portrait" | "landscape";
  seller: {
    username: string;
    avatar: string;
  };
  category: string;
  likes: number;
  isLiked: boolean;
}

const categories = [
  { id: "all", label: "All" },
  { id: "electronics", label: "Electronics" },
  { id: "fashion", label: "Fashion" },
  { id: "home", label: "Home" },
  { id: "beauty", label: "Beauty" },
  { id: "sports", label: "Sports" },
  { id: "art", label: "Art" },
];

const products: Product[] = [
  {
    id: "1",
    name: "Vintage Film Camera",
    price: 299,
    imageUrl: "/api/placeholder/400/500",
    aspectRatio: "portrait",
    seller: { username: "retro_finds", avatar: "/api/placeholder/32/32" },
    category: "electronics",
    likes: 45,
    isLiked: false,
  },
  {
    id: "2",
    name: "Leather Jacket",
    price: 189,
    imageUrl: "/api/placeholder/500/400",
    aspectRatio: "landscape",
    seller: { username: "fashion_hub", avatar: "/api/placeholder/32/32" },
    category: "fashion",
    likes: 128,
    isLiked: true,
  },
  {
    id: "3",
    name: "Plant Pot Set",
    price: 45,
    imageUrl: "/api/placeholder/400/400",
    aspectRatio: "square",
    seller: { username: "home_decor", avatar: "/api/placeholder/32/32" },
    category: "home",
    likes: 67,
    isLiked: false,
  },
  {
    id: "4",
    name: "Organic Skincare Set",
    price: 79,
    imageUrl: "/api/placeholder/400/500",
    aspectRatio: "portrait",
    seller: { username: "beauty_glow", avatar: "/api/placeholder/32/32" },
    category: "beauty",
    likes: 234,
    isLiked: false,
  },
  {
    id: "5",
    name: "Yoga Mat Premium",
    price: 35,
    imageUrl: "/api/placeholder/500/350",
    aspectRatio: "landscape",
    seller: { username: "fit_life", avatar: "/api/placeholder/32/32" },
    category: "sports",
    likes: 89,
    isLiked: true,
  },
  {
    id: "6",
    name: "Wireless Headphones",
    price: 149,
    imageUrl: "/api/placeholder/400/400",
    aspectRatio: "square",
    seller: { username: "tech_deals", avatar: "/api/placeholder/32/32" },
    category: "electronics",
    likes: 312,
    isLiked: false,
  },
  {
    id: "7",
    name: "Handmade Ceramic Vase",
    price: 65,
    imageUrl: "/api/placeholder/400/550",
    aspectRatio: "portrait",
    seller: { username: "artisan_studio", avatar: "/api/placeholder/32/32" },
    category: "home",
    likes: 156,
    isLiked: false,
  },
  {
    id: "8",
    name: "Denim Jacket",
    price: 95,
    imageUrl: "/api/placeholder/450/400",
    aspectRatio: "landscape",
    seller: { username: "fashion_hub", avatar: "/api/placeholder/32/32" },
    category: "fashion",
    likes: 78,
    isLiked: false,
  },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set(["2", "5"]));
  const [viewMode, setViewMode] = useState<"masonry" | "grid">("masonry");

  const toggleLike = (productId: string) => {
    setLikedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case "portrait":
        return "aspect-[3/4]";
      case "landscape":
        return "aspect-[4/3]";
      default:
        return "aspect-square";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop Side Navigation */}
      <SideNav />

      {/* Mobile Top Navigation */}
      <div className="md:hidden">
        <TopNavBar />
      </div>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)] px-4 md:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-[var(--foreground)]">
                  Marketplace
                </h1>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Discover unique items from local sellers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === "masonry"
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "hover:bg-[var(--secondary)] text-[var(--muted-foreground)]"
                  )}
                  onClick={() => setViewMode("masonry")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === "grid"
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "hover:bg-[var(--secondary)] text-[var(--muted-foreground)]"
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search & Categories */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="vellon-search flex-1">
                <svg className="vellon-search-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="vellon-search-input"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                    selectedCategory === category.id
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                      : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary)]/80"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </header>

          {/* Products Grid/Masonry */}
          <div className="p-4 md:p-6">
            {viewMode === "masonry" ? (
              <div className="vellon-grid-masonry">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/marketplace/product/${product.id}`}
                    className="vellon-card vellon-card-hover vellon-card-interactive block animate-fade-in"
                  >
                    {/* Product Image - Varying Aspect Ratios */}
                    <div
                      className={cn(
                        "bg-[var(--secondary)] relative overflow-hidden",
                        getAspectRatioClass(product.aspectRatio)
                      )}
                    >
                      {/* Placeholder for product image */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-[var(--muted-foreground)]/50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>

                      {/* Like button */}
                      <button
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all duration-200 active:scale-90"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleLike(product.id);
                        }}
                      >
                        <svg
                          className={cn(
                            "w-5 h-5 transition-transform duration-200",
                            likedProducts.has(product.id)
                              ? "fill-[var(--primary)] text-[var(--primary)]"
                              : "text-[var(--foreground)]"
                          )}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>

                      {/* Category badge */}
                      <div className="absolute top-3 left-3">
                        <span className="vellon-badge vellon-badge-secondary capitalize">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-lg font-semibold text-[var(--foreground)]">
                          ${product.price}
                        </p>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {product.likes}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--foreground)] mb-3 line-clamp-2">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 rounded-lg">
                          <AvatarImage src={product.seller.avatar} alt={product.seller.username} />
                          <AvatarFallback className="text-[10px]">
                            {product.seller.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          @{product.seller.username}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="vellon-grid-uniform">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/marketplace/product/${product.id}`}
                    className="vellon-card vellon-card-hover vellon-card-interactive block animate-fade-in"
                  >
                    <div className="aspect-square bg-[var(--secondary)] relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-[var(--muted-foreground)]/50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <button
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleLike(product.id);
                        }}
                      >
                        <svg
                          className={cn(
                            "w-4 h-4",
                            likedProducts.has(product.id)
                              ? "fill-[var(--primary)] text-[var(--primary)]"
                              : "text-[var(--foreground)]"
                          )}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-[var(--foreground)]">${product.price}</p>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 fill-[var(--primary)] text-[var(--primary)]" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <p className="text-xs text-[var(--muted-foreground)]">{product.likes}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{product.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredProducts.length === 0 && (
              <div className="vellon-empty">
                <div className="vellon-empty-icon">
                  <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="vellon-empty-title">No products found</p>
                <p className="vellon-empty-description">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile bottom spacer */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
