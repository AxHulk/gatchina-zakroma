import { Router, Request, Response } from "express";
import { confirmOrderPayment, failOrderPayment, getOrderByNumber, getOrderByPaymentId, updateOrderPayment } from "./db";
import { notifyOwner } from "./_core/notification";
import { verifyPaymoCallbackSignature } from "./paymo";
import { sendOrderEmails } from "./mailer";

const router = Router();

/**
 * Paymo Start Callback
 * URL: /api/payment/paymo/start
 * 
 * Called by Paymo BEFORE creating and processing the transaction.
 * Must return {"result": true} to allow the payment to proceed.
 */
router.post("/paymo/start", async (req: Request, res: Response) => {
  try {
    console.log("[Paymo Start] Received:", JSON.stringify(req.body));
    
    const { tx_id, user, signature, test_payment, extra } = req.body;
    
    const orderNumber = extra?.orderNumber || tx_id;
    
    if (!orderNumber) {
      console.error("[Paymo Start] Missing order number");
      return res.json({ result: false, error: "Missing order number" });
    }
    
    // Check that order exists
    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      console.error(`[Paymo Start] Order ${orderNumber} not found`);
      return res.json({ result: false, error: "Order not found" });
    }
    
    // Update payment status to processing
    await updateOrderPayment({
      orderNumber,
      paymentStatus: "processing",
      paymentProvider: "paymo",
    });
    
    console.log(`[Paymo Start] Order ${orderNumber} - payment started`);
    
    // Must return {"result": true} to allow payment
    res.json({ result: true });
  } catch (error) {
    console.error("[Paymo Start] Error:", error);
    // Return true anyway to not block the payment
    res.json({ result: true });
  }
});

/**
 * Paymo Finish Callback
 * URL: /api/payment/paymo/finish
 * 
 * Called by Paymo AFTER the transaction is completed.
 * Must return {"result": true} to confirm receipt.
 * If response is not {"result": true}, Paymo will retry 5 times
 * at 5, 10, 20, 40, 60 minutes intervals.
 */
router.post("/paymo/finish", async (req: Request, res: Response) => {
  try {
    console.log("[Paymo Finish] Received:", JSON.stringify(req.body));
    
    const {
      tx_id,
      user,
      signature,
      status,
      result,
      payment_id,
      payment_time,
      base_amount,
      pan_mask,
      is_rebill,
      test_payment,
      error_code,
      extra,
    } = req.body;
    
    const orderNumber = extra?.orderNumber || tx_id;
    
    if (!orderNumber) {
      console.error("[Paymo Finish] Missing order number");
      return res.json({ result: true });
    }
    
    // Verify signature if provided
    if (signature && base_amount) {
      const isValid = verifyPaymoCallbackSignature(tx_id, parseInt(base_amount), signature);
      if (!isValid) {
        console.warn(`[Paymo Finish] Invalid signature for order ${orderNumber}, proceeding anyway`);
      }
    }
    
    if (status === "deposited" && result === true) {
      // Payment successful
      const order = await confirmOrderPayment(orderNumber, payment_id?.toString() || tx_id);
      
      if (order) {
        // Update additional payment info
        await updateOrderPayment({
          orderNumber,
          paymentProvider: "paymo",
          paymentId: payment_id?.toString() || tx_id,
          paymentStatus: "paid",
          paidAt: new Date(),
        });
        
        // Notify owner about successful payment
        notifyOwner({
          title: `Оплата получена: ${orderNumber}`,
          content: `Заказ ${orderNumber} оплачен через Paymo.\n\nСумма: ${(order.total / 100).toFixed(2)} руб.\nКлиент: ${order.customerName}\nТелефон: ${order.customerPhone}${pan_mask ? `\nКарта: ${pan_mask}` : ""}${test_payment ? "\n\n(ТЕСТОВЫЙ ПЛАТЕЖ)" : ""}`,
        }).catch(err => {
          console.error("[Paymo Finish] Failed to notify owner:", err.message);
        });
        
        // Send payment confirmation emails
        const emailData = {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          deliveryMethod: order.deliveryMethod as "pickup" | "delivery",
          deliveryAddress: order.deliveryAddress || undefined,
          deliveryCity: order.deliveryCity || undefined,
          deliveryComment: order.deliveryComment || undefined,
          paymentMethod: "online" as const,
          items: order.items?.map((item: any) => ({
            productTitle: item.productTitle,
            quantity: item.quantity,
            unit: item.unit ?? null,
            price: item.price,
            subtotal: item.subtotal,
          })) || [],
          subtotal: order.subtotal ?? 0,
          deliveryFee: order.deliveryFee ?? 0,
          total: order.total ?? 0,
        };
        
        sendOrderEmails(emailData).then(emailResult => {
          console.log(`[Paymo Finish] Email results for ${orderNumber}: customer=${emailResult.customer}, manager=${emailResult.manager}`);
        }).catch(err => {
          console.error(`[Paymo Finish] Email sending failed for ${orderNumber}:`, err);
        });
        
        console.log(`[Paymo Finish] Order ${orderNumber} payment confirmed (payment_id: ${payment_id})`);
      } else {
        console.error(`[Paymo Finish] Order ${orderNumber} not found in database`);
      }
    } else if (status === "declined" || result === false) {
      // Payment failed
      await failOrderPayment(orderNumber, payment_id?.toString());
      console.log(`[Paymo Finish] Order ${orderNumber} payment declined${error_code ? ` (error: ${error_code})` : ""}`);
    } else {
      // Other status (processing, wait_external, etc.)
      await updateOrderPayment({
        orderNumber,
        paymentStatus: "processing",
        paymentProvider: "paymo",
        paymentId: payment_id?.toString(),
      });
      console.log(`[Paymo Finish] Order ${orderNumber} status: ${status}`);
    }
    
    // Must return {"result": true}
    res.json({ result: true });
  } catch (error) {
    console.error("[Paymo Finish] Error:", error);
    res.json({ result: true });
  }
});

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
