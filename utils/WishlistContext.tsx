"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserWishlistIds, toggleWishlist as apiToggleWishlist } from "../utils/api";
import { useAuth } from "../app/context/AuthContext"; // <-- Import your existing Auth context hook here

interface WishlistContextType {
  wishlist: string[];
  handleWishlistToggle: (artworkId: string) => Promise<void>;
  isLoadingWishlist: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);
  
  // Connect directly to your live authorization lifecycle wrapper
  const { user } = useAuth(); 

  // Dynamically load user favorites whenever the logged-in user changes
  useEffect(() => {
    async function initWishlist() {
      // If no active user profile session context is resolved, reset and halt setup
      if (!user?.id) {
        setWishlist([]);
        setIsLoadingWishlist(false);
        return;
      }

      try {
        setIsLoadingWishlist(true);
        const savedWishIds = await getUserWishlistIds(user.id);
        setWishlist(savedWishIds);
      } catch (err) {
        console.error("Global context failed to synchronize user favorites:", err);
      } finally {
        setIsLoadingWishlist(false);
      }
    }
    
    initWishlist();
  }, [user?.id]); // Re-run this effect instantly whenever a new session logs in or out

  // Shared optimistic toggle pipeline accessible anywhere
  const handleWishlistToggle = async (artworkId: string) => {
    if (!user?.id) {
      console.warn("Wishlist Action Blocked: Unauthenticated transaction session state.");
      return;
    }

    const isCurrentlyAdded = wishlist.includes(artworkId);
    
    // Snap updates across UI paths instantly (Optimistic UI Update)
    setWishlist(prev =>
      isCurrentlyAdded ? prev.filter(id => id !== artworkId) : [...prev, artworkId]
    );

    try {
      // Pass the real, dynamically resolved user session ID instead of a static string map
      await apiToggleWishlist(artworkId, user.id);
    } catch (err) {
      console.error("Pipeline failure on global wishlist validation mutation:", err);
      // Revert instantly if the server transaction gets rejected or fails
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