import { Router, Request, Response } from "express";
import { confirmOrderPayment, failOrderPayment, getOrderByNumber, getOrderByPaymentId, updateOrderPayment } from "./db";
import { notifyOwner } from "./_core/notification";
import { verifyPaymoCallbackSignature } from "./paymo";
import { sendOrderEmails } from "./mailer";
import { getCkassaNewPayments, getCkassaOrderRef } from "./ckassa";

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
    
    // Forward callback to payin.edro.tech
    const PAYMO_FORWARD_URL = "https://payin.edro.tech/paymo/api/v1/payments/callback";
    try {
      const forwardResponse = await fetch(PAYMO_FORWARD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...req.body, callback_type: "start" }),
      });
      console.log(`[Paymo Start] Forwarded to payin.edro.tech, status: ${forwardResponse.status}`);
    } catch (fwdError: any) {
      console.error("[Paymo Start] Forward to payin.edro.tech failed:", fwdError.message);
    }
    
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
    
    // Forward callback to payin.edro.tech
    const PAYMO_FORWARD_URL_FINISH = "https://payin.edro.tech/paymo/api/v1/payments/callback";
    try {
      const forwardResponse = await fetch(PAYMO_FORWARD_URL_FINISH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...req.body, callback_type: "finish" }),
      });
      console.log(`[Paymo Finish] Forwarded to payin.edro.tech, status: ${forwardResponse.status}`);
    } catch (fwdError: any) {
      console.error("[Paymo Finish] Forward to payin.edro.tech failed:", fwdError.message);
    }
    
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
 * Paymo Callback Proxy
 * URL: /api/payment/paymo/callback
 * 
 * Direct proxy endpoint that forwards all Paymo callbacks to payin.edro.tech
 * Use this URL in Paymo settings if you want pure forwarding without local processing.
 */
router.post("/paymo/callback", async (req: Request, res: Response) => {
  const FORWARD_URL = "https://payin.edro.tech/paymo/api/v1/payments/callback";
  try {
    console.log("[Paymo Callback Proxy] Received:", JSON.stringify(req.body));
    
    const forwardResponse = await fetch(FORWARD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    
    const responseText = await forwardResponse.text();
    console.log(`[Paymo Callback Proxy] Forwarded to payin.edro.tech, status: ${forwardResponse.status}, response: ${responseText}`);
    
    res.status(forwardResponse.status);
    res.send(responseText);
  } catch (error: any) {
    console.error("[Paymo Callback Proxy] Forward failed:", error.message);
    
    notifyOwner({
      title: "Ошибка проброса callback Paymo",
      content: `Ошибка: ${error.message}\nДанные: ${JSON.stringify(req.body)}`,
    }).catch(() => {});
    
    // Return success to Paymo to prevent retries
    res.json({ result: true, warning: "Forward failed" });
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
 * CKassa: Polling новых платежей
 * URL: /api/payment/ckassa/poll
 *
 * CKassa не отправляет webhook — вместо этого используется polling метода GET /payments/new.
 * Этот endpoint вызывается по расписанию (cron) или вручную.
 * Также можно настроить вызов из внешнего cron-сервиса.
 */
router.post("/ckassa/poll", async (req: Request, res: Response) => {
  try {
    console.log("[CKassa Poll] Fetching new payments...");

    const payments = await getCkassaNewPayments();

    if (!payments || payments.length === 0) {
      console.log("[CKassa Poll] No new payments");
      return res.json({ processed: 0 });
    }

    console.log(`[CKassa Poll] Got ${payments.length} payment(s)`);
    let processed = 0;

    for (const payment of payments) {
      try {
        // Извлекаем orderRef из properties (первый элемент массива)
        const orderRef = payment.properties?.[0]?.value;
        if (!orderRef) {
          console.warn("[CKassa Poll] Payment without orderRef:", payment.regPayNum);
          continue;
        }

        const regPayNum = payment.regPayNum;
        const state = payment.state;

        console.log(`[CKassa Poll] Payment ${regPayNum}: orderRef=${orderRef}, state=${state}`);

        // Ищем заказ по orderRef — он совпадает с getCkassaOrderRef(order.orderNumber)
        // Перебираем все заказы со статусом pending и сравниваем
        // Используем getOrderByPaymentId как fallback, если уже сохранён regPayNum
        let order = await getOrderByPaymentId(regPayNum);

        if (!order) {
          // Ищем по paymentUrl или через прямой поиск по orderRef
          // Поскольку orderRef — это последние 12 символов orderNumber без дефисов,
          // нам нужно найти заказ, у которого getCkassaOrderRef(orderNumber) === orderRef
          // Используем вспомогательный поиск через getOrderByNumber с разными форматами
          // Пробуем восстановить полный номер заказа из orderRef
          // Формат: GZ-XXXXXXXX-XXXX -> stripped = GZXXXXXXXXXXXX -> last 12 = XXXXXXXXXX (без GZ)
          // Поэтому ищем заказы, у которых orderNumber.replace(/[^A-Z0-9]/gi,'').slice(-12) === orderRef
          console.log(`[CKassa Poll] Order not found by paymentId, trying orderRef search for: ${orderRef}`);
        }

        if (state === "PAYED") {
          if (order) {
            // Уже найден по regPayNum — просто подтверждаем
            await confirmOrderPayment(order.orderNumber, regPayNum);
            console.log(`[CKassa Poll] Order ${order.orderNumber} confirmed (already linked)`);
          } else {
            // Ищем заказ через специальный endpoint
            const foundOrder = await findOrderByRef(orderRef);
            if (foundOrder) {
              await confirmOrderPayment(foundOrder.orderNumber, regPayNum);
              await notifyOwner({
                title: `Оплата получена: ${foundOrder.orderNumber}`,
                content: `Заказ ${foundOrder.orderNumber} оплачен через CKassa.\n\nСумма: ${(payment.amount / 100).toFixed(2)} ₽\nНомер платежа: ${regPayNum}\nКлиент: ${foundOrder.customerName}\nТелефон: ${foundOrder.customerPhone}`,
              }).catch(err => console.error("[CKassa Poll] Notify error:", err.message));

              // Отправляем email
              sendOrderEmails({
                orderNumber: foundOrder.orderNumber,
                customerName: foundOrder.customerName,
                customerEmail: foundOrder.customerEmail,
                customerPhone: foundOrder.customerPhone,
                deliveryMethod: foundOrder.deliveryMethod as "pickup" | "delivery",
                deliveryAddress: foundOrder.deliveryAddress || undefined,
                deliveryCity: foundOrder.deliveryCity || undefined,
                deliveryComment: foundOrder.deliveryComment || undefined,
                paymentMethod: "online" as const,
                items: foundOrder.items?.map((item: any) => ({
                  productTitle: item.productTitle,
                  quantity: item.quantity,
                  unit: item.unit ?? null,
                  price: item.price,
                  subtotal: item.subtotal,
                })) || [],
                subtotal: foundOrder.subtotal ?? 0,
                deliveryFee: foundOrder.deliveryFee ?? 0,
                total: foundOrder.total ?? 0,
              }).catch(err => console.error("[CKassa Poll] Email error:", err));

              console.log(`[CKassa Poll] Order ${foundOrder.orderNumber} payment confirmed via CKassa`);
              processed++;
            } else {
              console.warn(`[CKassa Poll] Cannot find order for orderRef=${orderRef}`);
            }
          }
        } else if (state === "FAILED" || state === "CANCELLED" || state === "DECLINED") {
          if (order) {
            await failOrderPayment(order.orderNumber, regPayNum);
            console.log(`[CKassa Poll] Order ${order.orderNumber} payment failed`);
          } else {
            const foundOrder = await findOrderByRef(orderRef);
            if (foundOrder) {
              await failOrderPayment(foundOrder.orderNumber, regPayNum);
              console.log(`[CKassa Poll] Order ${foundOrder.orderNumber} payment failed via CKassa`);
            }
          }
        }
      } catch (paymentError: any) {
        console.error(`[CKassa Poll] Error processing payment ${payment.regPayNum}:`, paymentError.message);
      }
    }

    res.json({ processed, total: payments.length });
  } catch (error) {
    console.error("[CKassa Poll] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Вспомогательная функция: найти заказ по orderRef (короткому номеру для CKassa)
 */
async function findOrderByRef(orderRef: string) {
  // Получаем все заказы с paymentProvider=ckassa и paymentStatus=pending
  // и ищем тот, у которого getCkassaOrderRef(orderNumber) === orderRef
  const { getDb } = await import("./db");
  const { orders } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");

  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.paymentProvider, "ckassa"), eq(orders.paymentStatus, "pending")));

  for (const row of rows) {
    if (getCkassaOrderRef(row.orderNumber) === orderRef) {
      return getOrderByNumber(row.orderNumber);
    }
  }
  return null;
}

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
