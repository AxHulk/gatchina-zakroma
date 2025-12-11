import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  const cookies: Record<string, string> = {};
  
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {
        cookie: "cart_session=test_session_orders",
      },
    } as TrpcContext["req"],
    res: {
      setHeader: (name: string, value: string) => {
        if (name === "Set-Cookie") {
          const match = value.match(/cart_session=([^;]+)/);
          if (match) {
            cookies["cart_session"] = match[1];
          }
        }
      },
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("orders.getByNumber", () => {
  it("returns null for non-existent order", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.getByNumber({ orderNumber: "NON_EXISTENT_ORDER" });

    expect(result).toBeNull();
  });
});

describe("orders.myOrders", () => {
  it("returns array of orders for session", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.myOrders();

    expect(Array.isArray(result)).toBe(true);
  });
});
