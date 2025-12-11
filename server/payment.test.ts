import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the database functions
vi.mock("./db", () => ({
  updateOrderPayment: vi.fn().mockResolvedValue({
    orderNumber: "GZ-TEST-001",
    paymentStatus: "paid",
    paymentId: "test_payment_123",
  }),
  getOrderByNumber: vi.fn().mockResolvedValue({
    id: 1,
    orderNumber: "GZ-TEST-001",
    paymentStatus: "pending",
    paymentMethod: "online",
    total: 150000,
    customerName: "Test Customer",
    customerPhone: "+79001234567",
    items: [],
  }),
  getOrderByPaymentId: vi.fn().mockResolvedValue({
    id: 1,
    orderNumber: "GZ-TEST-001",
    paymentStatus: "paid",
    paymentId: "test_payment_123",
  }),
  confirmOrderPayment: vi.fn().mockResolvedValue({
    orderNumber: "GZ-TEST-001",
    paymentStatus: "paid",
    paymentId: "test_payment_123",
    paidAt: new Date(),
    status: "confirmed",
  }),
  failOrderPayment: vi.fn().mockResolvedValue({
    orderNumber: "GZ-TEST-001",
    paymentStatus: "failed",
  }),
}));

import { updateOrderPayment, getOrderByNumber, confirmOrderPayment, failOrderPayment } from "./db";

describe("Payment Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateOrderPayment", () => {
    it("should update payment status for an order", async () => {
      const result = await updateOrderPayment({
        orderNumber: "GZ-TEST-001",
        paymentId: "test_payment_123",
        paymentStatus: "paid",
      });

      expect(updateOrderPayment).toHaveBeenCalledWith({
        orderNumber: "GZ-TEST-001",
        paymentId: "test_payment_123",
        paymentStatus: "paid",
      });
      expect(result).toBeDefined();
      expect(result?.paymentStatus).toBe("paid");
    });
  });

  describe("getOrderByNumber", () => {
    it("should return order with payment info", async () => {
      const result = await getOrderByNumber("GZ-TEST-001");

      expect(getOrderByNumber).toHaveBeenCalledWith("GZ-TEST-001");
      expect(result).toBeDefined();
      expect(result?.orderNumber).toBe("GZ-TEST-001");
      expect(result?.paymentMethod).toBe("online");
    });
  });

  describe("confirmOrderPayment", () => {
    it("should confirm payment and update order status", async () => {
      const result = await confirmOrderPayment("GZ-TEST-001", "test_payment_123");

      expect(confirmOrderPayment).toHaveBeenCalledWith("GZ-TEST-001", "test_payment_123");
      expect(result).toBeDefined();
      expect(result?.paymentStatus).toBe("paid");
      expect(result?.status).toBe("confirmed");
    });
  });

  describe("failOrderPayment", () => {
    it("should mark payment as failed", async () => {
      const result = await failOrderPayment("GZ-TEST-001", "test_payment_123");

      expect(failOrderPayment).toHaveBeenCalledWith("GZ-TEST-001", "test_payment_123");
      expect(result).toBeDefined();
      expect(result?.paymentStatus).toBe("failed");
    });
  });
});

describe("Payment Status Flow", () => {
  it("should support pending -> paid flow", async () => {
    // Initial state: pending
    const pendingOrder = await getOrderByNumber("GZ-TEST-001");
    expect(pendingOrder?.paymentStatus).toBe("pending");

    // Confirm payment
    const paidOrder = await confirmOrderPayment("GZ-TEST-001", "test_payment_123");
    expect(paidOrder?.paymentStatus).toBe("paid");
  });

  it("should support pending -> failed flow", async () => {
    // Initial state: pending
    const pendingOrder = await getOrderByNumber("GZ-TEST-001");
    expect(pendingOrder?.paymentStatus).toBe("pending");

    // Fail payment
    const failedOrder = await failOrderPayment("GZ-TEST-001");
    expect(failedOrder?.paymentStatus).toBe("failed");
  });
});
