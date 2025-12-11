import { Router, Request, Response } from "express";
import { confirmOrderPayment, failOrderPayment, getOrderByNumber, getOrderByPaymentId } from "./db";
import { notifyOwner } from "./_core/notification";

const router = Router();

/**
 * Webhook endpoint for Paymaster payment notifications
 * URL: /api/payment/paymaster/webhook
 * 
 * When you integrate Paymaster, configure this URL as the notification URL
 * in your Paymaster merchant settings.
 */
router.post("/paymaster/webhook", async (req: Request, res: Response) => {
  try {
    console.log("[Paymaster Webhook] Received:", JSON.stringify(req.body));
    
    // Extract data from Paymaster notification
    // Note: Adjust field names according to actual Paymaster API documentation
    const {
      LMI_MERCHANT_ID,
      LMI_PAYMENT_NO,
      LMI_SYS_PAYMENT_ID,
      LMI_SYS_PAYMENT_DATE,
      LMI_PAYMENT_AMOUNT,
      LMI_CURRENCY,
      LMI_PAID_AMOUNT,
      LMI_PAID_CURRENCY,
      LMI_PAYMENT_SYSTEM,
      LMI_SIM_MODE,
      LMI_HASH,
      ORDER_ID, // Custom field - order number
    } = req.body;
    
    const orderNumber = ORDER_ID || LMI_PAYMENT_NO;
    const paymentId = LMI_SYS_PAYMENT_ID;
    
    if (!orderNumber) {
      console.error("[Paymaster Webhook] Missing order number");
      return res.status(400).json({ error: "Missing order number" });
    }
    
    // Verify the payment (in production, verify LMI_HASH signature)
    // TODO: Add signature verification when you have Paymaster secret key
    
    // Confirm the payment
    const order = await confirmOrderPayment(orderNumber, paymentId);
    
    if (order) {
      // Notify owner about successful payment
      await notifyOwner({
        title: `💳 Оплата получена: ${orderNumber}`,
        content: `Заказ ${orderNumber} оплачен через Paymaster.\n\nСумма: ${(order.total / 100).toFixed(2)} ₽\nКлиент: ${order.customerName}\nТелефон: ${order.customerPhone}`,
      });
      
      console.log(`[Paymaster Webhook] Order ${orderNumber} payment confirmed`);
    }
    
    // Return success response (Paymaster expects specific response)
    res.status(200).send("YES");
  } catch (error) {
    console.error("[Paymaster Webhook] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Webhook endpoint for Ckassa payment notifications
 * URL: /api/payment/ckassa/webhook
 * 
 * When you integrate Ckassa, configure this URL as the callback URL
 * in your Ckassa merchant settings.
 */
router.post("/ckassa/webhook", async (req: Request, res: Response) => {
  try {
    console.log("[Ckassa Webhook] Received:", JSON.stringify(req.body));
    
    // Extract data from Ckassa notification
    // Note: Adjust field names according to actual Ckassa API documentation
    const {
      orderId,
      paymentId,
      status,
      amount,
      currency,
      signature,
    } = req.body;
    
    if (!orderId) {
      console.error("[Ckassa Webhook] Missing order ID");
      return res.status(400).json({ error: "Missing order ID" });
    }
    
    // Verify the signature (in production, verify signature with Ckassa secret)
    // TODO: Add signature verification when you have Ckassa secret key
    
    if (status === "success" || status === "paid" || status === "completed") {
      // Confirm the payment
      const order = await confirmOrderPayment(orderId, paymentId);
      
      if (order) {
        // Notify owner about successful payment
        await notifyOwner({
          title: `💳 Оплата получена: ${orderId}`,
          content: `Заказ ${orderId} оплачен через Ckassa.\n\nСумма: ${(order.total / 100).toFixed(2)} ₽\nКлиент: ${order.customerName}\nТелефон: ${order.customerPhone}`,
        });
        
        console.log(`[Ckassa Webhook] Order ${orderId} payment confirmed`);
      }
    } else if (status === "failed" || status === "cancelled" || status === "error") {
      // Mark payment as failed
      await failOrderPayment(orderId, paymentId);
      console.log(`[Ckassa Webhook] Order ${orderId} payment failed`);
    }
    
    // Return success response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Ckassa Webhook] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Generic webhook endpoint for testing
 * URL: /api/payment/test/webhook
 */
router.post("/test/webhook", async (req: Request, res: Response) => {
  try {
    console.log("[Test Webhook] Received:", JSON.stringify(req.body));
    
    const { orderNumber, paymentId, status } = req.body;
    
    if (!orderNumber) {
      return res.status(400).json({ error: "Missing orderNumber" });
    }
    
    if (status === "paid") {
      const order = await confirmOrderPayment(orderNumber, paymentId || "test_payment_id");
      return res.json({ success: true, order });
    } else if (status === "failed") {
      const order = await failOrderPayment(orderNumber, paymentId);
      return res.json({ success: true, order });
    }
    
    res.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("[Test Webhook] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Check payment status endpoint
 * URL: /api/payment/status/:orderNumber
 */
router.get("/status/:orderNumber", async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await getOrderByNumber(orderNumber);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      total: order.total,
      status: order.status,
    });
  } catch (error) {
    console.error("[Payment Status] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
