"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  seller: string;
  sellerId: string;
  category: string;
  description: string;
  stock: number;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Mock product data
  const mockProduct: Product = {
    id: productId,
    name: "Premium Wireless Headphones",
    price: 299.99,
    seller: "TechStore",
    sellerId: "s1",
    category: "Electronics",
    description: "High-quality wireless headphones with noise cancellation. Features include:\n\n• Active noise cancellation\n• 30-hour battery life\n• Premium comfort padding\n• Bluetooth 5.0 connectivity\n• Built-in microphone for calls",
    stock: 15,
    createdAt: "2024-01-15",
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProduct(mockProduct);
      setIsLoading(false);
    }, 500);
  }, [productId]);

  const handleAddToCart = () => {
    console.log(`Added ${quantity} item(s) to cart`);
    // TODO: Implement cart functionality
  };

  const handleContactSeller = () => {
    // TODO: Navigate to chat with seller
    router.push(`/chat/${product?.sellerId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
            <h1 className="text-lg font-semibold text-foreground">Product Details</h1>
          </div>
        </header>
        <main className="p-4">
          <div className="animate-pulse">
            <div className="aspect-square bg-secondary rounded-lg mb-4" />
            <div className="h-6 bg-secondary rounded w-3/4 mb-2" />
            <div className="h-8 bg-secondary rounded w-1/4 mb-4" />
            <div className="h-4 bg-secondary rounded w-full mb-2" />
            <div className="h-4 bg-secondary rounded w-full mb-2" />
            <div className="h-4 bg-secondary rounded w-2/3" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
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
          <h1 className="text-lg font-semibold text-foreground">Product Details</h1>
          <div className="flex-1" />
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Product Image */}
        <div className="aspect-square bg-secondary flex items-center justify-center">
          <svg className="w-24 h-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="p-4">
          {/* Category Badge */}
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs rounded-full mb-2">
            {product.category}
          </span>

          {/* Product Name */}
          <h1 className="text-xl font-bold text-foreground mb-2">{product.name}</h1>

          {/* Price */}
          <p className="text-2xl font-bold text-primary mb-4">${product.price.toFixed(2)}</p>

          {/* Seller Info */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {product.seller.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{product.seller}</p>
              <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleContactSeller}>
              Contact
            </Button>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h2 className="font-semibold text-foreground mb-2">Description</h2>
            <div className="text-muted-foreground text-sm whitespace-pre-line">
              {product.description}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="chat-footer flex-shrink-0 p-4 border-t border-border">
        <div className="flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="flex-1 btn-gold h-11"
            onClick={handleAddToCart}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Add to Cart - ${(product.price * quantity).toFixed(2)}
          </Button>
        </div>
      </footer>
    </div>
  );
}
