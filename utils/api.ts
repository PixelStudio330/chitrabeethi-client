// utils/api.ts
// Safely builds the base URL to prevent route path breaking
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api`;

export interface ArtistData {
  _id: string;
  name: string;
  email: string;
}

export interface ArtworkData {
  _id: string;
  name: string;
  bengaliTitle?: string; // Kept for the beautiful dual-language design
  description: string;
  price: number;
  category: "Canvas" | "Paper";
  img: string;
  tag: string;
  status: "available" | "sold" | "unpublished";
  artist: ArtistData;
  createdAt?: string;
}

export interface CommentData {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt?: string;
}

// 🎨 Fetch dynamically from server
export async function getArtworks(): Promise<ArtworkData[]> {
  try {
    const url = `${API_BASE_URL}/artworks`;
    console.log("📡 Chitrabeethi is fetching from:", url);
    
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) {
      console.error(`❌ HTTP Error Status: ${res.status} (${res.statusText})`);
      throw new Error("Could not restore gallery assets.");
    }
    
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("📋 Detailed Fetch Error:", error);
    throw error;
  }
}

// 🔍 Fetch a single artwork file by its unique MongoDB Identifier
export async function getArtworkById(id: string): Promise<ArtworkData> {
  try {
    const url = `${API_BASE_URL}/artworks/${id}`;
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) {
      console.error(`❌ HTTP Error Status: ${res.status} (${res.statusText})`);
      throw new Error(`Could not locate artwork record with ID: ${id}`);
    }
    
    const json = await res.json();
    // Safely checks if your backend data object nests under a "data" property key
    return json.data ? json.data : json;
  } catch (error) {
    console.error(`📋 Detailed Single Artwork Fetch Error [ID: ${id}]:`, error);
    throw error;
  }
}

// 💬 Get public comment feedback thread assigned to this artwork block
export async function getCommentsByArtwork(artworkId: string): Promise<CommentData[]> {
  try {
    const url = `${API_BASE_URL}/artworks/${artworkId}/comments`;
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) return [];
    
    const json = await res.json();
    return json.data ? json.data : json;
  } catch (error) {
    console.error("📋 Detailed Comments Fetch Error:", error);
    return [];
  }
}

// 📝 Commit a brand new visitor thought onto a specific canvas layout
export async function postComment(
  artworkId: string, 
  comment: { userId: string; userName: string; text: string }
): Promise<CommentData> {
  try {
    const url = `${API_BASE_URL}/artworks/${artworkId}/comments`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    });

    if (!res.ok) {
      throw new Error(`Failed to post community comment item. Status: ${res.status}`);
    }

    const json = await res.json();
    return json.data ? json.data : json;
  } catch (error) {
    console.error("📋 Detailed Post Comment Error:", error);
    throw error;
  }
}

// ❤️ Toggle wishlist array pairing
export async function toggleWishlist(artworkId: string, userId: string): Promise<any> {
  try {
    const url = `${API_BASE_URL}/wishlist/toggle`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artworkId, userId }),
    });

    if (!res.ok) {
      console.error(`❌ Wishlist Toggle Error Status: ${res.status}`);
      throw new Error("Could not synchronize your wishlist item.");
    }

    return res.json();
  } catch (error) {
    console.error("📋 Detailed Wishlist Toggle Error:", error);
    throw error;
  }
}

// 🔍 Get user's active wishlist setup
export async function getUserWishlistIds(userId: string): Promise<string[]> {
  try {
    const url = `${API_BASE_URL}/wishlist?userId=${userId}`;
    const res = await fetch(url);
    
    if (!res.ok) return [];
    
    const json = await res.json();
    const items = json.data || [];
    return items.map((item: any) => 
      typeof item.artwork === 'object' ? item.artwork._id : item.artwork
    );
  } catch (error) {
    console.error("📋 Detailed Wishlist Fetch Error:", error);
    return [];
  }
}