"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InstagramNavBar } from "@/components/ui/InstagramNav";

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
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
];

const products: Product[] = [
  {
    id: "1",
    name: "Vintage Camera",
    price: 299,
    imageUrl: "/api/placeholder/400/400",
    seller: { username: "retro_finds", avatar: "/api/placeholder/32/32" },
    category: "electronics",
    likes: 45,
    isLiked: false,
  },
  {
    id: "2",
    name: "Leather Jacket",
    price: 189,
    imageUrl: "/api/placeholder/400/400",
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
    seller: { username: "home_decor", avatar: "/api/placeholder/32/32" },
    category: "home",
    likes: 67,
    isLiked: false,
  },
  {
    id: "4",
    name: "Skincare Set",
    price: 79,
    imageUrl: "/api/placeholder/400/400",
    seller: { username: "beauty_glow", avatar: "/api/placeholder/32/32" },
    category: "beauty",
    likes: 234,
    isLiked: false,
  },
  {
    id: "5",
    name: "Yoga Mat",
    price: 35,
    imageUrl: "/api/placeholder/400/400",
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
    seller: { username: "tech_deals", avatar: "/api/placeholder/32/32" },
    category: "electronics",
    likes: 312,
    isLiked: false,
  },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set(["2", "5"]));

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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-16">
      {/* Navigation */}
      <InstagramNavBar />

      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        {/* Header */}
        <header className="sticky top-16 z-10 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Marketplace</h1>
            <Button variant="ghost" size="icon" className="rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
          </div>
        </header>

        {/* Categories */}
        <div className="border-b border-border">
          <div className="flex gap-3 overflow-x-auto py-3 px-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-2">
          <div className="grid grid-cols-2 gap-2">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/marketplace/product/${product.id}`}
                className="group bg-card rounded-lg overflow-hidden"
              >
                {/* Product Image */}
                <div className="aspect-square bg-secondary relative">
                  {/* Placeholder for product image */}
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  {/* Like button */}
                  <button
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(product.id);
                    }}
                  >
                    <svg
                      className={cn("w-5 h-5", likedProducts.has(product.id) ? "fill-red-500 text-red-500" : "text-white")}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">${product.price}</p>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 fill-red-500 text-red-500" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <p className="text-xs text-muted-foreground">{product.likes}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{product.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={product.seller.avatar} alt={product.seller.username} />
                      <AvatarFallback className="text-[8px]">{product.seller.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">@{product.seller.username}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-muted-foreground">No products found in this category</p>
          </div>
        )}
      </main>

      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

import { cn } from "@/lib/utils";
