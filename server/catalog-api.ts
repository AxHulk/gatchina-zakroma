import { Router } from "express";
import { gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { products } from "../drizzle/schema";

const router = Router();

// Кэш для каталога
let catalogCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1 час в миллисекундах

/**
 * GET /api/catalog
 * Возвращает каталог товаров в JSON формате
 * Структура: [{ id, name, price }]
 * Возвращает только товары в наличии (quantity > 0)
 * Использует кэширование для ускорения ответа
 */
router.get("/", async (req, res) => {
  try {
    const now = Date.now();
    
    // Проверяем кэш
    if (catalogCache && (now - cacheTimestamp) < CACHE_DURATION) {
      // Устанавливаем заголовки для кэширования на стороне клиента
      res.set('Cache-Control', 'public, max-age=3600');
      res.set('X-Cache', 'HIT');
      res.json(catalogCache);
      return;
    }
    
    let db = null;
    if (process.env.DATABASE_URL) {
      db = drizzle(process.env.DATABASE_URL);
    }
    
    if (!db) {
      res.status(500).json({ error: "Database not available" });
      return;
    }
    
    // Получаем только товары в наличии (quantity > 0)
    // Оптимизация: выбираем только нужные поля
    const productList = await db
      .select({
        id: products.id,
        title: products.title,
        price: products.price
      })
      .from(products)
      .where(gt(products.quantity, 0));
    
    // Преобразуем в требуемый формат
    const catalog = productList.map(product => ({
      id: product.id,
      name: product.title,
      price: (product.price / 100).toFixed(2) // Цена в рублях с 2 знаками после запятой
    }));
    
    // Сохраняем в кэш
    catalogCache = catalog;
    cacheTimestamp = now;
    
    // Устанавливаем заголовки для кэширования
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('X-Cache', 'MISS');
    res.json(catalog);
  } catch (error) {
    console.error("[Catalog API] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
