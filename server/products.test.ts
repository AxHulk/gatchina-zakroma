import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { cookie: "cart_session=test_session_vitest" },
    } as TrpcContext["req"],
    res: {
      setHeader: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("products.list", () => {
  it("returns an array of products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({});

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("title");
      expect(result[0]).toHaveProperty("price");
      expect(result[0]).toHaveProperty("category");
    }
  });

  it("filters products by category", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({ category: "Овощи" });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((product) => {
      expect(product.category).toBe("Овощи");
    });
  });

  it("sorts products by price ascending", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({ sortBy: "price_asc" });

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 1) {
      for (let i = 1; i < result.length; i++) {
        expect(result[i].price).toBeGreaterThanOrEqual(result[i - 1].price);
      }
    }
  });

  it("sorts products by price descending", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({ sortBy: "price_desc" });

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 1) {
      for (let i = 1; i < result.length; i++) {
        expect(result[i].price).toBeLessThanOrEqual(result[i - 1].price);
      }
    }
  });

  it("returns only in-stock products (quantity > 0)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({});

    expect(Array.isArray(result)).toBe(true);
    // Every product must have quantity > 0
    const outOfStock = result.filter((p) => p.quantity <= 0);
    expect(outOfStock).toHaveLength(0);
    // All products should be in stock
    result.forEach((product) => {
      expect(product.quantity).toBeGreaterThan(0);
    });
  });
});

describe("products.random", () => {
  it("returns limited random products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.random({ limit: 5 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("returns only in-stock random products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.random({ limit: 9 });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((product) => {
      expect(product.quantity).toBeGreaterThan(0);
    });
  });
});

describe("products.categories", () => {
  it("returns categories list with non-empty strings", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.categories();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((cat) => {
      expect(typeof cat).toBe("string");
      expect(cat.length).toBeGreaterThan(0);
    });
  });
});

describe("contact.submit", () => {
  it("creates a contact request", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Test User",
      email: "test@example.com",
      phone: "+79001234567",
      source: "test",
    });

    expect(result).toHaveProperty("success", true);
  });
});
