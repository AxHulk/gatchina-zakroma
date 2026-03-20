import { Request, Response, NextFunction } from "express";
import { drizzle } from "drizzle-orm/mysql2";
import { requestLogs } from "../drizzle/schema";

/**
 * Request Logger Middleware
 * 
 * Logs all API requests and callbacks to the database.
 * Does NOT interfere with existing request/response flow — 
 * it only captures a copy of the data.
 */

let _logDb: ReturnType<typeof drizzle> | null = null;

function getLogDb() {
  if (!_logDb && process.env.DATABASE_URL) {
    try {
      _logDb = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[RequestLogger] Failed to connect to DB:", error);
      _logDb = null;
    }
  }
  return _logDb;
}

/**
 * Determine the source/category of the request based on URL path
 */
function classifySource(path: string): string {
  if (path.includes("/api/payment/paymo")) return "paymo_callback";
  if (path.includes("/api/payment/paymaster")) return "paymaster_callback";
  if (path.includes("/api/payment/ckassa")) return "ckassa_callback";
  if (path.includes("/api/ckassa")) return "ckassa_callback";
  if (path.includes("/api/payment")) return "payment";
  if (path.includes("/api/trpc/orders")) return "order";
  if (path.includes("/api/trpc/cart")) return "cart";
  if (path.includes("/api/trpc/contact")) return "contact";
  if (path.includes("/api/trpc")) return "trpc";
  if (path.includes("/api/catalog")) return "catalog";
  if (path.includes("/api/oauth")) return "oauth";
  return "general";
}

/**
 * Safely stringify and truncate data for storage
 */
function safeStringify(data: unknown, maxLength: number = 65000): string | null {
  if (data === undefined || data === null) return null;
  try {
    const str = typeof data === "string" ? data : JSON.stringify(data);
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + "...[truncated]";
    }
    return str;
  } catch {
    return "[unable to serialize]";
  }
}

/**
 * Filter sensitive headers before logging
 */
function filterHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const filtered = { ...headers };
  const sensitiveKeys = ["authorization", "cookie", "set-cookie"];
  for (const key of sensitiveKeys) {
    if (filtered[key]) {
      filtered[key] = "[REDACTED]";
    }
  }
  return filtered;
}

/**
 * Save log entry to database (non-blocking, fire-and-forget)
 */
async function saveLog(logEntry: {
  method: string;
  url: string;
  path: string;
  statusCode: number | null;
  requestHeaders: string | null;
  requestBody: string | null;
  responseBody: string | null;
  ip: string | null;
  userAgent: string | null;
  source: string;
  duration: number | null;
}) {
  try {
    const db = getLogDb();
    if (!db) return;

    await db.insert(requestLogs).values({
      method: logEntry.method,
      url: logEntry.url.substring(0, 2048),
      path: logEntry.path.substring(0, 512),
      statusCode: logEntry.statusCode,
      requestHeaders: logEntry.requestHeaders,
      requestBody: logEntry.requestBody,
      responseBody: logEntry.responseBody,
      ip: logEntry.ip?.substring(0, 64) || null,
      userAgent: logEntry.userAgent?.substring(0, 512) || null,
      source: logEntry.source,
      duration: logEntry.duration,
    });
  } catch (error) {
    // Silent fail — logging should never break the app
    console.error("[RequestLogger] Failed to save log:", (error as Error).message);
  }
}

/**
 * Express middleware that logs API requests
 * Only logs /api/* routes to avoid logging static file requests
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only log API routes
  if (!req.path.startsWith("/api/")) {
    return next();
  }

  // Skip admin log endpoints to avoid infinite loops
  if (req.path.startsWith("/api/admin/")) {
    return next();
  }

  const startTime = Date.now();
  const source = classifySource(req.path);

  // Capture request data
  const requestHeaders = safeStringify(filterHeaders(req.headers as Record<string, unknown>));
  const requestBody = safeStringify(req.body);

  // Intercept response to capture response body
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  let responseBody: string | null = null;

  res.json = function (body: unknown) {
    responseBody = safeStringify(body, 16000);
    return originalJson(body);
  };

  res.send = function (body: unknown) {
    if (!responseBody) {
      responseBody = safeStringify(body, 16000);
    }
    return originalSend(body as any);
  };

  // On response finish, save the log
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const ip = req.headers["x-real-ip"] as string || 
               req.headers["x-forwarded-for"] as string || 
               req.socket.remoteAddress || null;

    saveLog({
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      statusCode: res.statusCode,
      requestHeaders,
      requestBody,
      responseBody,
      ip,
      userAgent: req.headers["user-agent"] || null,
      source,
      duration,
    });
  });

  next();
}
