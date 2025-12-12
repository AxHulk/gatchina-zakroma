import { Router } from "express";
import { getAllProducts } from "./db";

const router = Router();

/**
 * GET /api/catalog
 * Возвращает каталог товаров в JSON формате
 * Структура: [{ id, name, price }]
 */
router.get("/", async (req, res) => {
  try {
    const products = await getAllProducts();
    
    // Преобразуем в требуемый формат
    const catalog = products.map(product => ({
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
