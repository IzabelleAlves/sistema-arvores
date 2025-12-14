export interface Product {
  id: string;
  name: string;
  brand: string;
  categoryPath: string[]; // e.g., ["Electronics", "Audio", "Headphones"]
  description: string;
  keywords: string[];
  price: number;
}

export interface ScoredProduct extends Product {
  score: number;
  matchReasons: string[];
}

export interface UserAction {
  type: 'SEARCH' | 'VIEW' | 'SOCIAL_POST' | 'PURCHASE' | 'STREAMING';
  content: string;
  timestamp: number;
}

// --- Custom Tree Interfaces ---

// For the User Profile (Weighted Trie)
export interface TrieNodeRenderData {
  name: string;
  value?: number;
  children?: TrieNodeRenderData[];
}

// For the Product Catalog (N-ary Tree)
export interface CategoryNodeRenderData {
  name: string;
  productCount: number;
  children?: CategoryNodeRenderData[];
}