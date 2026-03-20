import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import paymentWebhooks from "../payment-webhooks";
import catalogApi from "../catalog-api";
import adminApi from "../admin-api";
import { requestLoggerMiddleware } from "../request-logger";
import { getCkassaNewPayments, getCkassaOrderRef } from "../ckassa";
import { confirmOrderPayment, failOrderPayment, getOrderByPaymentId } from "../db";
import { notifyOwner } from "./notification";
import { sendOrderEmails } from "../mailer";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Request logger middleware — logs all API requests (non-blocking, fire-and-forget)
  app.use(requestLoggerMiddleware);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Admin panel API under /api/admin
  app.use("/api/admin", adminApi);
  // Payment webhooks under /api/payment
  app.use("/api/payment", paymentWebhooks);
  // Catalog API under /api/catalog
  app.use("/api/catalog", catalogApi);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // CKassa: автоматический polling новых платежей каждые 2 минуты
  startCkassaPolling();
}

async function processCkassaPayments() {
  try {
    const payments = await getCkassaNewPayments();
    if (!payments || payments.length === 0) return;

    console.log(`[CKassa Polling] Processing ${payments.length} payment(s)`);

    for (const payment of payments) {
      try {
        const orderRef = payment.properties?.[0]?.value;
        if (!orderRef) continue;

        const regPayNum = payment.regPayNum;
        const state = payment.state;

        // Ищем заказ по regPayNum (если уже привязан) или по orderRef
        let order = await getOrderByPaymentId(regPayNum);

        if (!order) {
          // Ищем среди pending CKassa заказов
          const { getDb } = await import("../db");
          const { orders } = await import("../../drizzle/schema");
          const { eq, and } = await import("drizzle-orm");
          const db = await getDb();
          if (db) {
            const rows = await db
              .select()
              .from(orders)
              .where(and(eq(orders.paymentProvider, "ckassa"), eq(orders.paymentStatus, "pending")));
            for (const row of rows) {
              if (getCkassaOrderRef(row.orderNumber) === orderRef) {
                order = await import("../db").then(m => m.getOrderByNumber(row.orderNumber));
                break;
              }
            }
          }
        }

        if (!order) {
          console.warn(`[CKassa Polling] Cannot find order for orderRef=${orderRef}, regPayNum=${regPayNum}`);
          continue;
        }

        if (state === "PAYED") {
          await confirmOrderPayment(order.orderNumber, regPayNum);
          await notifyOwner({
            title: `Оплата получена: ${order.orderNumber}`,
            content: `Заказ ${order.orderNumber} оплачен через CKassa.\n\nСумма: ${(payment.amount / 100).toFixed(2)} ₽\nНомер платежа: ${regPayNum}\nКлиент: ${order.customerName}\nТелефон: ${order.customerPhone}`,
          }).catch(err => console.error("[CKassa Polling] Notify error:", err.message));

          sendOrderEmails({
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
          }).catch(err => console.error("[CKassa Polling] Email error:", err));

          console.log(`[CKassa Polling] Order ${order.orderNumber} confirmed`);
        } else if (state === "FAILED" || state === "CANCELLED" || state === "DECLINED") {
          await failOrderPayment(order.orderNumber, regPayNum);
          console.log(`[CKassa Polling] Order ${order.orderNumber} failed`);
        }
      } catch (err: any) {
        console.error(`[CKassa Polling] Error processing payment ${payment.regPayNum}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error("[CKassa Polling] Error:", err.message);
  }
}

function startCkassaPolling() {
  const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 минуты
  console.log(`[CKassa Polling] Started, interval: ${POLL_INTERVAL_MS / 1000}s`);
  setInterval(processCkassaPayments, POLL_INTERVAL_MS);
}

startServer().catch(console.error);
