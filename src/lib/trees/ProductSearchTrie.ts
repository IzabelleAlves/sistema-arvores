// import { Product } from '../../types';

import type { Product } from "../../types";

class SearchTrieNode {
  children: Map<string, SearchTrieNode>;
  productIds: Set<string>; // Armazena IDs de produtos que correspondem a este caminho
  isEndOfWord: boolean;

  constructor() {
    this.children = new Map();
    this.productIds = new Set();
    this.isEndOfWord = false;
  }
}

/**
 * Árvore Trie especializada para indexação invertida de produtos.
 * Permite busca rápida: Palavra-chave -> Lista de Produtos.
 */
export class ProductSearchTrie {
  root: SearchTrieNode;

  constructor() {
    this.root = new SearchTrieNode();
  }

  /**
   * Indexa um produto na árvore baseando-se em suas palavras-chave.
   */
  insertProduct(product: Product): void {
    // Indexa palavras-chave, marca e categorias
    const tokens = [
      ...product.keywords,
      product.brand.toLowerCase(),
      ...product.categoryPath.map(c => c.toLowerCase()),
      ...product.name.toLowerCase().split(' ')
    ];

    tokens.forEach(token => this._insertToken(token, product.id));
  }

  private _insertToken(token: string, productId: string): void {
    let current = this.root;
    const cleanToken = token.trim().toLowerCase();

    for (let i = 0; i < cleanToken.length; i++) {
      const char = cleanToken[i];
      if (!current.children.has(char)) {
        current.children.set(char, new SearchTrieNode());
      }
      current = current.children.get(char)!;
    }
    
    current.isEndOfWord = true;
    current.productIds.add(productId);
  }

  /**
   * Busca produtos que contenham a palavra (prefixo ou exata).
   * Retorna um Set de IDs de produtos.
   */
  search(query: string): Set<string> {
    let current = this.root;
    const cleanQuery = query.trim().toLowerCase();

    for (let i = 0; i < cleanQuery.length; i++) {
      const char = cleanQuery[i];
      if (!current.children.has(char)) {
        return new Set();
      }
      current = current.children.get(char)!;
    }

    // Coleta todos os produtos deste ponto para baixo na árvore (autocomplete logic)
    const results = new Set<string>();
    this._collectProductIds(current, results);
    return results;
  }

  private _collectProductIds(node: SearchTrieNode, results: Set<string>) {
    if (node.isEndOfWord) {
      node.productIds.forEach(id => results.add(id));
    }

    for (const child of node.children.values()) {
      this._collectProductIds(child, results);
    }
  }
}