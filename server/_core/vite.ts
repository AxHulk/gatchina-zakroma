import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}`
      );

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// SEO meta map: URL path -> { title, description }
const seoMeta: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Гатчинские закрома — свежие фермерские продукты с доставкой",
    description: "Интернет-магазин фермерских продуктов в Гатчине. Свежие овощи, фрукты, молочные продукты и мясо от местных производителей. Доставка по Гатчинскому району.",
  },
  "/shop": {
    title: "Каталог товаров — Гатчинские закрома",
    description: "Купите свежие фермерские продукты с доставкой в Гатчине. Овощи, фрукты, ягоды, мясо, молочные продукты от местных производителей.",
  },
  "/about": {
    title: "О нас — Гатчинские закрома",
    description: "Гатчинские закрома — платформа для покупки фермерских продуктов напрямую у производителей Гатчинского района. Наша миссия, ценности и команда.",
  },
  "/delivery": {
    title: "Доставка и оплата — Гатчинские закрома",
    description: "Условия доставки фермерских продуктов по Гатчине и Ленинградской области. Способы оплаты: наличными, картой или онлайн.",
  },
  "/contacts": {
    title: "Контакты — Гатчинские закрома",
    description: "Свяжитесь с нами: адрес, телефон, email. Задайте вопрос или оставьте заявку на покупку фермерских продуктов.",
  },
  "/buyback": {
    title: "Скупка продукции — Гатчинские закрома",
    description: "Закупаем ягоды, грибы, овощи, фрукты и другие сельскохозяйственные продукты у населения Гатчинского района. Узнайте условия сдачи.",
  },
  "/cart": {
    title: "Корзина — Гатчинские закрома",
    description: "Ваша корзина в интернет-магазине фермерских продуктов Гатчинские закрома.",
  },
  "/checkout": {
    title: "Оформление заказа — Гатчинские закрома",
    description: "Оформите заказ фермерских продуктов: укажите адрес доставки, выберите способ оплаты и получите свежие продукты.",
  },
  "/returns": {
    title: "Возврат товара — Гатчинские закрома",
    description: "Политика возврата товаров в интернет-магазине Гатчинские закрома. Условия, сроки и порядок возврата.",
  },
  "/privacy": {
    title: "Политика конфиденциальности — Гатчинские закрома",
    description: "Политика конфиденциальности и обработка персональных данных в интернет-магазине Гатчинские закрома.",
  },
  "/offer": {
    title: "Публичная оферта — Гатчинские закрома",
    description: "Публичная оферта (договор купли-продажи) интернет-магазина Гатчинские закрома.",
  },
};

function getSeoMeta(urlPath: string): { title: string; description: string } {
  // Strip query string
  const cleanPath = urlPath.split("?")[0].split("#")[0];
  // Exact match first
  if (seoMeta[cleanPath]) return seoMeta[cleanPath];
  // Product page: /shop/:id
  if (cleanPath.startsWith("/shop/")) {
    return {
      title: "Товар — Гатчинские закрома",
      description: "Фермерский продукт с доставкой по Гатчине и Ленинградской области. Свежее, натуральное, от местных фермеров.",
    };
  }
  // Default fallback
  return seoMeta["/"];
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const requestedPath = req.originalUrl;
    const filePath = path.join(distPath, requestedPath);

    // Check if requested file exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.sendFile(filePath);
      return;
    }

    // Inject SEO meta into index.html before sending
    const indexPath = path.resolve(distPath, "index.html");
    const { title, description } = getSeoMeta(requestedPath);
    const seoBlock = `<meta name="description" content="${description}" />\n    <title>${title}</title>`;

    try {
      let html = fs.readFileSync(indexPath, "utf-8");
      html = html.replace("<!--SEO_META-->", seoBlock);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch {
      res.status(200).sendFile(indexPath);
    }
  });
}
