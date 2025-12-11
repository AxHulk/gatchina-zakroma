import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table for the store catalog
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sku: varchar("sku", { length: 32 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fullText: text("fullText"),
  imageUrl: text("imageUrl"),
  price: int("price").notNull().default(0),
  quantity: int("quantity").notNull().default(0),
  unit: varchar("unit", { length: 16 }).default("KGM"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Contact form submissions
 */
export const contactRequests = mysqlTable("contact_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  source: varchar("source", { length: 64 }).notNull().default("home"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactRequest = typeof contactRequests.$inferSelect;
export type InsertContactRequest = typeof contactRequests.$inferInsert;

/**
 * Cart items for shopping cart functionality
 */
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders table for order management
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  
  // Customer info
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 32 }).notNull(),
  
  // Delivery info
  deliveryMethod: mysqlEnum("deliveryMethod", ["pickup", "delivery"]).notNull().default("delivery"),
  deliveryAddress: text("deliveryAddress"),
  deliveryCity: varchar("deliveryCity", { length: 128 }),
  deliveryComment: text("deliveryComment"),
  
  // Payment info
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "invoice"]).notNull().default("cash"),
  
  // Order totals
  subtotal: int("subtotal").notNull().default(0),
  deliveryFee: int("deliveryFee").notNull().default(0),
  total: int("total").notNull().default(0),
  
  // Status
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).notNull().default("pending"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items - products in an order
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productTitle: varchar("productTitle", { length: 255 }).notNull(),
  productSku: varchar("productSku", { length: 32 }).notNull(),
  price: int("price").notNull(),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 16 }).default("KGM"),
  subtotal: int("subtotal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
