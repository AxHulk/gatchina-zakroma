import { Router } from "express";
import { gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { products } from "../drizzle/schema";

const router = Router();

/**
 * GET /api/catalog
 * Возвращает каталог товаров в JSON формате
 * Структура: [{ id, name, price }]
 * Возвращает только товары в наличии (quantity > 0)
 */
router.get("/", async (req, res) => {
  try {
    let db = null;
    if (process.env.DATABASE_URL) {
      db = drizzle(process.env.DATABASE_URL);
    }
    
    if (!db) {
      res.status(500).json({ error: "Database not available" });
      return;
    }
    
    // Получаем только товары в наличии (quantity > 0)
    const productList = await db.select().from(products).where(gt(products.quantity, 0));
    
    // Преобразуем в требуемый формат
    const catalog = productList.map(product => ({
      id: product.id,
      name: product.title,
      price: (product.price / 100).toFixed(2) // Цена в рублях с 2 знаками после запятой
    }));
    
    res.json(catalog);
  } catch (error) {
    console.error("[Catalog API] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
