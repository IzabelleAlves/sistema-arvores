// import { TrieNodeRenderData } from '../../types';

import type { TrieNodeRenderData } from "../../types";

/**
 * Custom Trie Node Implementation.
 * Unlike a standard Trie, this one stores weights (frequency/relevance)
 * at the end of words to represent user interest intensity.
 */
class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  weight: number; // Represents interest score
  lastUpdated: number; // For time-decay logic

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.weight = 0;
    this.lastUpdated = Date.now();
  }
}

export class UserProfileTrie {
  root: TrieNode;
  totalTokens: number;

  constructor() {
    this.root = new TrieNode();
    this.totalTokens = 0;
  }

  /**
   * Inserts a token (keyword) into the Trie.
   * If it exists, increments weight.
   * @param word The keyword to track (e.g., "nike", "running")
   * @param weightBoost Optional manual boost for significant actions (like Purchase)
   */
  insert(word: string, weightBoost: number = 1): void {
    let current = this.root;
    const cleanWord = word.toLowerCase().trim();

    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i];
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    current.isEndOfWord = true;
    
    // Time Decay Logic: Before adding new weight, apply decay to existing weight
    // If user hasn't interacted with this term in a while, it matters less.
    const now = Date.now();
    const hoursSinceLastUpdate = (now - current.lastUpdated) / (1000 * 60 * 60);
    if (current.weight > 0 && hoursSinceLastUpdate > 1) {
       // Decay 5% per hour passed, floor at 0
       current.weight = Math.max(0, current.weight * Math.pow(0.95, hoursSinceLastUpdate));
    }

    current.weight += weightBoost;
    current.lastUpdated = now;
    this.totalTokens++;
  }

  /**
   * Retrieves all tracked keywords with their weights.
   */
  getAllInterests(): Map<string, number> {
    const interests = new Map<string, number>();
    this._collectWords(this.root, "", interests);
    return interests;
  }

  private _collectWords(node: TrieNode, prefix: string, result: Map<string, number>) {
    if (node.isEndOfWord) {
      result.set(prefix, node.weight);
    }

    for (const [char, childNode] of node.children.entries()) {
      this._collectWords(childNode, prefix + char, result);
    }
  }

  /**
   * Converts the Trie structure into a JSON-serializable format for D3 visualization.
   * To prevent massive graphs, we can limit depth or prune low weights in a real app,
   * but here we show the structure.
   */
  toTreeData(): TrieNodeRenderData {
    return this._nodeToData(this.root, "ROOT");
  }

  private _nodeToData(node: TrieNode, char: string): TrieNodeRenderData {
    const children: TrieNodeRenderData[] = [];
    
    for (const [key, child] of node.children.entries()) {
      children.push(this._nodeToData(child, key));
    }

    const data: TrieNodeRenderData = {
      name: char,
    };

    if (node.isEndOfWord) {
      data.value = node.weight;
      // Append weight to name for visualization clarity
      data.name = `${char} (${node.weight.toFixed(1)})`;
    }

    if (children.length > 0) {
      data.children = children;
    }

    return data;
  }
}
