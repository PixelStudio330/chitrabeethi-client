// utils/api.ts
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api`;

export interface ArtistData {
  _id: string;
  name: string;
  email: string;
}

export interface ArtworkData {
  _id: string;
  name: string;
  bengaliTitle?: string;
  description: string;
  price: number;
  // Updated to perfectly align with your browse page's filtering categories
  category: "Painting" | "Acrylic Art" | "Sculpture" | "Photography" | "Canvas" | "Paper";
  img: string;
  tag: string;
  status: "available" | "sold" | "unpublished";
  artist: ArtistData;
  createdAt?: string;
}

// Enforces strict synchronization with your backend Comment model fields
export interface CommentData {
  _id: string;
  userId: string;
  userName: string;
  comment: string; // Changed from text -> comment to match backend requirements
  createdAt?: string;
}

export interface CommentsApiResponse {
  comments: CommentData[];
  hasPurchased: boolean;
}

export async function getArtworks(): Promise<ArtworkData[]> {
  try {
    const url = `${API_BASE_URL}/artworks`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not restore gallery assets.");
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("📋 Detailed Fetch Error:", error);
    throw error;
  }
}

export async function getArtworkById(id: string): Promise<ArtworkData> {
  try {
    const url = `${API_BASE_URL}/artworks/${id}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Could not locate artwork record with ID: ${id}`);
    const json = await res.json();
    return json.data ? json.data : json;
  } catch (error) {
    console.error(`📋 Detailed Single Artwork Fetch Error [ID: ${id}]:`, error);
    throw error;
  }
}

// Enforces secure payload querying passing down optional visitor context
export async function getCommentsByArtwork(artworkId: string, userId?: string): Promise<CommentsApiResponse> {
  try {
    const url = userId 
      ? `${API_BASE_URL}/artworks/${artworkId}/comments?userId=${userId}`
      : `${API_BASE_URL}/artworks/${artworkId}/comments`;
      
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { comments: [], hasPurchased: false };
    
    const json = await res.json();
    if (Array.isArray(json)) {
      return { comments: json, hasPurchased: false };
    }
    return {
      comments: json.comments || [],
      hasPurchased: !!json.hasPurchased
    };
  } catch (error) {
    console.error("📋 Detailed Comments Fetch Error:", error);
    return { comments: [], hasPurchased: false };
  }
}

export async function postComment(
  artworkId: string, 
  payload: { userId: string; userName: string; comment: string }
): Promise<CommentData> {
  try {
    const url = `${API_BASE_URL}/artworks/${artworkId}/comments`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Status: ${res.status}`);
    }

    const json = await res.json();
    return json.data ? json.data : json;
  } catch (error) {
    console.error("📋 Detailed Post Comment Error:", error);
    throw error;
  }
}

export async function toggleWishlist(artworkId: string, userId: string): Promise<any> {
  try {
    const url = `${API_BASE_URL}/wishlist/toggle`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artworkId, userId }),
    });
    if (!res.ok) throw new Error("Could not synchronize your wishlist item.");
    return res.json();
  } catch (error) {
    console.error("📋 Detailed Wishlist Toggle Error:", error);
    throw error;
  }
}

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