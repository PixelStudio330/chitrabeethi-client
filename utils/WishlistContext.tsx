"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserWishlistIds, toggleWishlist as apiToggleWishlist } from "../utils/api";

interface WishlistContextType {
  wishlist: string[];
  handleWishlistToggle: (artworkId: string) => Promise<void>;
  isLoadingWishlist: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Shared Static fallback user id (matching your current configuration)
const CURRENT_USER_ID = "65cb3a2f8f1a2c001f8d4e92"; 

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);

  // Initialize and load user data once globally
  useEffect(() => {
    async function initWishlist() {
      try {
        const savedWishIds = await getUserWishlistIds(CURRENT_USER_ID);
        setWishlist(savedWishIds);
      } catch (err) {
        console.error("Global context failed to synchronize user favorites:", err);
      } finally {
        setIsLoadingWishlist(false);
      }
    }
    initWishlist();
  }, []);

  // Shared optimistic toggle pipeline accessible anywhere
  const handleWishlistToggle = async (artworkId: string) => {
    const isCurrentlyAdded = wishlist.includes(artworkId);
    
    // Snap updates across UI paths instantly
    setWishlist(prev =>
      isCurrentlyAdded ? prev.filter(id => id !== artworkId) : [...prev, artworkId]
    );

    try {
      await apiToggleWishlist(artworkId, CURRENT_USER_ID);
    } catch (err) {
      console.error("Pipeline failure on global wishlist validation mutation:", err);
      // Revert if the write transaction drops
      setWishlist(prev =>
        isCurrentlyAdded ? [...prev, artworkId] : prev.filter(id => id !== artworkId)
      );
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, handleWishlistToggle, isLoadingWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useSharedWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useSharedWishlist must be nested gracefully within a WishlistProvider wrapper context.");
  }
  return context;
}