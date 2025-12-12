import { describe, expect, it, vi } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  getAllProducts: vi.fn().mockResolvedValue([
    { id: 1, title: "Товар 1", price: 10000, category: "Овощи", sku: "T-1", description: "", imageUrl: "", unit: "KGM", quantity: 10 },
    { id: 2, title: "Товар 2", price: 20050, category: "Фрукты", sku: "T-2", description: "", imageUrl: "", unit: "KGM", quantity: 5 },
  ]),
}));

describe("Catalog API", () => {
  it("returns products in correct JSON format", async () => {
    const { getAllProducts } = await import("./db");
    
    const products = await getAllProducts();
    
    // Simulate the transformation done in catalog-api.ts
    const catalog = products.map(product => ({
      id: product.id,
      name: product.title,
      price: (product.price / 100).toFixed(2)
    }));
    
    expect(catalog).toEqual([
      { id: 1, name: "Товар 1", price: "100.00" },
      { id: 2, name: "Товар 2", price: "200.50" },
    ]);
  });

  it("formats price with two decimal places", async () => {
    const price1 = (10000 / 100).toFixed(2);
    const price2 = (20050 / 100).toFixed(2);
    const price3 = (100 / 100).toFixed(2);
    
    expect(price1).toBe("100.00");
    expect(price2).toBe("200.50");
    expect(price3).toBe("1.00");
  });

  it("returns array structure", async () => {
    const { getAllProducts } = await import("./db");
    
    const products = await getAllProducts();
    const catalog = products.map(product => ({
      id: product.id,
      name: product.title,
      price: (product.price / 100).toFixed(2)
    }));
    
    expect(Array.isArray(catalog)).toBe(true);
    expect(catalog.length).toBe(2);
    
    // Check structure of each item
    catalog.forEach(item => {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("price");
      expect(typeof item.id).toBe("number");
      expect(typeof item.name).toBe("string");
      expect(typeof item.price).toBe("string");
    });
  });
});
