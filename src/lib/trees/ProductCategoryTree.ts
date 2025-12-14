// import { Product, CategoryNodeRenderData } from '../../types';

import type { CategoryNodeRenderData, Product } from "../../types";

/**
 * N-ary Tree Node for Categories.
 * Each node acts as a category bucket containing products and sub-categories.
 */
class CategoryNode {
  name: string;
  children: Map<string, CategoryNode>;
  products: Product[];

  constructor(name: string) {
    this.name = name;
    this.children = new Map();
    this.products = [];
  }
}

export class ProductCategoryTree {
  root: CategoryNode;

  constructor() {
    this.root = new CategoryNode("Catalog");
  }

  /**
   * Inserts a product into the tree based on its category path.
   * e.g., Path: ["Electronics", "Audio"] -> Creates nodes if missing.
   */
  insertProduct(product: Product): void {
    let current = this.root;

    for (const category of product.categoryPath) {
      if (!current.children.has(category)) {
        current.children.set(category, new CategoryNode(category));
      }
      current = current.children.get(category)!;
    }

    // Leaf category node holds the product
    current.products.push(product);
  }

  /**
   * Retrieves all products in the entire tree (Flattened).
   */
  getAllProducts(): Product[] {
    const allProducts: Product[] = [];
    this._traverseAndCollect(this.root, allProducts);
    return allProducts;
  }

  private _traverseAndCollect(node: CategoryNode, collection: Product[]) {
    collection.push(...node.products);
    for (const child of node.children.values()) {
      this._traverseAndCollect(child, collection);
    }
  }

  /**
   * Visualization data structure.
   */
  toTreeData(): CategoryNodeRenderData {
    return this._nodeToData(this.root);
  }

  private _nodeToData(node: CategoryNode): CategoryNodeRenderData {
    const children: CategoryNodeRenderData[] = [];
    
    for (const child of node.children.values()) {
      children.push(this._nodeToData(child));
    }

    const data: CategoryNodeRenderData = {
      name: node.name,
      productCount: node.products.length,
    };

    if (children.length > 0) {
      data.children = children;
    }

    return data;
  }
}
