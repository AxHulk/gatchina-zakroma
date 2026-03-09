import { Router, Request, Response } from "express";
import { drizzle } from "drizzle-orm/mysql2";
import { desc, eq, like, and, gte, lte, sql, count } from "drizzle-orm";
import { requestLogs, orders, orderItems, contactRequests } from "../drizzle/schema";
import crypto from "crypto";

const router = Router();

// Simple admin authentication via token
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "gz-admin-2024-secret";

/**
 * Middleware to check admin authentication
 */
function requireAdmin(req: Request, res: Response, next: Function) {
  const token = req.headers["x-admin-token"] || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function getDb() {
  if (!process.env.DATABASE_URL) return null;
  try {
    return drizzle(process.env.DATABASE_URL);
  } catch {
    return null;
  }
}

/**
 * POST /api/admin/login
 * Authenticate admin and return token
 */
router.post("/login", async (req: Request, res: Response) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "zakroma2024admin";
  
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

/**
 * GET /api/admin/logs
 * Get paginated request logs with filtering
 */
router.get("/logs", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not available" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = (page - 1) * limit;
    const source = req.query.source as string;
    const method = req.query.method as string;
    const search = req.query.search as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;

    // Build conditions
    const conditions = [];
    if (source && source !== "all") {
      conditions.push(eq(requestLogs.source, source));
    }
    if (method && method !== "all") {
      conditions.push(eq(requestLogs.method, method));
    }
    if (search) {
      conditions.push(like(requestLogs.url, `%${search}%`));
    }
    if (dateFrom) {
      conditions.push(gte(requestLogs.timestamp, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(requestLogs.timestamp, new Date(dateTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ total: count() })
      .from(requestLogs)
      .where(whereClause);
    const total = countResult[0]?.total || 0;

    // Get logs
    const logs = await db
      .select()
      .from(requestLogs)
      .where(whereClause)
      .orderBy(desc(requestLogs.timestamp))
      .limit(limit)
      .offset(offset);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Admin API] Error fetching logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/admin/logs/:id
 * Get a single log entry with full details
 */
router.get("/logs/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not available" });

    const id = parseInt(req.params.id);
    const result = await db.select().from(requestLogs).where(eq(requestLogs.id, id)).limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("[Admin API] Error fetching log:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/admin/logs/stats
 * Get log statistics for dashboard
 */
router.get("/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not available" });

    // Total logs
    const totalResult = await db.select({ total: count() }).from(requestLogs);
    const totalLogs = totalResult[0]?.total || 0;

    // Logs by source
    const bySource = await db
      .select({
        source: requestLogs.source,
        count: count(),
      })
      .from(requestLogs)
      .groupBy(requestLogs.source)
      .orderBy(desc(count()));

    // Logs in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24hResult = await db
      .select({ total: count() })
      .from(requestLogs)
      .where(gte(requestLogs.timestamp, oneDayAgo));
    const last24h = last24hResult[0]?.total || 0;

    // Payment callbacks count
    const paymentCallbacksResult = await db
      .select({ total: count() })
      .from(requestLogs)
      .where(like(requestLogs.source, "%callback%"));
    const paymentCallbacks = paymentCallbacksResult[0]?.total || 0;

    // Total orders
    const ordersResult = await db.select({ total: count() }).from(orders);
    const totalOrders = ordersResult[0]?.total || 0;

    // Paid orders
    const paidOrdersResult = await db
      .select({ total: count() })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));
    const paidOrders = paidOrdersResult[0]?.total || 0;

    // Contact requests
    const contactsResult = await db.select({ total: count() }).from(contactRequests);
    const totalContacts = contactsResult[0]?.total || 0;

    // Recent errors (5xx status codes)
    const errorsResult = await db
      .select({ total: count() })
      .from(requestLogs)
      .where(gte(requestLogs.statusCode, 500));
    const totalErrors = errorsResult[0]?.total || 0;

    res.json({
      totalLogs,
      last24h,
      paymentCallbacks,
      totalOrders,
      paidOrders,
      totalContacts,
      totalErrors,
      bySource,
    });
  } catch (error) {
    console.error("[Admin API] Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/admin/orders
 * Get all orders for admin view
 */
router.get("/orders", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not available" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const paymentStatus = req.query.paymentStatus as string;

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(orders.status, status as any));
    }
    if (paymentStatus && paymentStatus !== "all") {
      conditions.push(eq(orders.paymentStatus, paymentStatus as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countResult = await db.select({ total: count() }).from(orders).where(whereClause);
    const total = countResult[0]?.total || 0;

    const ordersList = await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      ordersList.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    res.json({
      orders: ordersWithItems,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[Admin API] Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/admin/contacts
 * Get all contact requests
 */
router.get("/contacts", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not available" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = (page - 1) * limit;

    const countResult = await db.select({ total: count() }).from(contactRequests);
    const total = countResult[0]?.total || 0;

    const contacts = await db
      .select()
      .from(contactRequests)
      .orderBy(desc(contactRequests.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      contacts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[Admin API] Error fetching contacts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/admin/logs/clear
 * Clear old logs (keep last 7 days)
 */
router.delete("/logs/clear", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not available" });

    const daysToKeep = parseInt(req.query.days as string) || 7;
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    await db.delete(requestLogs).where(lte(requestLogs.timestamp, cutoff));

    res.json({ success: true, message: `Cleared logs older than ${daysToKeep} days` });
  } catch (error) {
    console.error("[Admin API] Error clearing logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
