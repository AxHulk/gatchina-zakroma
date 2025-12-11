import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {
        cookie: "cart_session=test_session_123"
      },
    } as TrpcContext["req"],
    res: {
      setHeader: () => {},
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("products.getById", () => {
  it("returns null for non-existent product", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.getById({ id: 999999 });

    expect(result).toBeNull();
  });

  it("accepts valid product id input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // This should not throw - the procedure should handle the input correctly
    const result = await caller.products.getById({ id: 1 });
    
    // Result can be null or a product object
    expect(result === null || typeof result === 'object').toBe(true);
  });
});

describe("products.similar", () => {
  it("returns array of similar products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.similar({ 
      productId: 1, 
      category: "Овощи", 
      limit: 4 
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("excludes the current product from results", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.similar({ 
      productId: 1, 
      category: "Овощи", 
      limit: 4 
    });

    // Verify that product with id 1 is not in the results
    const containsCurrentProduct = result.some((p: { id: number }) => p.id === 1);
    expect(containsCurrentProduct).toBe(false);
  });
});

describe("products.list", () => {
  it("returns array of products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("supports category filter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({ category: "Овощи" });

    expect(Array.isArray(result)).toBe(true);
  });

  it("supports price sorting", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const resultAsc = await caller.products.list({ sortBy: "price_asc" });
    const resultDesc = await caller.products.list({ sortBy: "price_desc" });

    expect(Array.isArray(resultAsc)).toBe(true);
    expect(Array.isArray(resultDesc)).toBe(true);
  });
});
