import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  getAllProducts, 
  getProductsByCategory, 
  getProductById, 
  getRandomProducts,
  getSimilarProducts,
  getProductCategories,
  getCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartCount,
  createContactRequest
} from "./db";
import { notifyOwner } from "./_core/notification";

// Helper to get or create session ID from cookies
function getSessionId(ctx: { req: any; res: any }): string {
  const cookies = ctx.req.headers.cookie || '';
  const sessionMatch = cookies.match(/cart_session=([^;]+)/);
  
  if (sessionMatch) {
    return sessionMatch[1];
  }
  
  // Generate new session ID
  const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  ctx.res.setHeader('Set-Cookie', `cart_session=${newSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
  return newSessionId;
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Products router
  products: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        sortBy: z.enum(['price_asc', 'price_desc', 'name']).optional(),
      }).optional())
      .query(async ({ input }) => {
        let productList = input?.category 
          ? await getProductsByCategory(input.category)
          : await getAllProducts();
        
        // Sort products
        if (input?.sortBy === 'price_asc') {
          productList = productList.sort((a, b) => a.price - b.price);
        } else if (input?.sortBy === 'price_desc') {
          productList = productList.sort((a, b) => b.price - a.price);
        } else if (input?.sortBy === 'name') {
          productList = productList.sort((a, b) => a.title.localeCompare(b.title));
        }
        
        return productList;
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getProductById(input.id);
      }),
    
    random: publicProcedure
      .input(z.object({ limit: z.number().default(9) }).optional())
      .query(async ({ input }) => {
        return await getRandomProducts(input?.limit || 9);
      }),
    
    similar: publicProcedure
      .input(z.object({ 
        productId: z.number(),
        category: z.string(),
        limit: z.number().default(4)
      }))
      .query(async ({ input }) => {
        return await getSimilarProducts(input.productId, input.category, input.limit);
      }),
    
    categories: publicProcedure.query(async () => {
      return await getProductCategories();
    }),
  }),

  // Cart router
  cart: router({
    get: publicProcedure.query(async ({ ctx }) => {
      const sessionId = getSessionId(ctx);
      return await getCartItems(sessionId);
    }),
    
    add: publicProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = getSessionId(ctx);
        return await addToCart(sessionId, input.productId, input.quantity);
      }),
    
    update: publicProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = getSessionId(ctx);
        return await updateCartItemQuantity(sessionId, input.productId, input.quantity);
      }),
    
    remove: publicProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = getSessionId(ctx);
        return await removeFromCart(sessionId, input.productId);
      }),
    
    clear: publicProcedure.mutation(async ({ ctx }) => {
      const sessionId = getSessionId(ctx);
      return await clearCart(sessionId);
    }),
    
    count: publicProcedure.query(async ({ ctx }) => {
      const sessionId = getSessionId(ctx);
      return await getCartCount(sessionId);
    }),
  }),

  // Contact form router
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        source: z.string().default('home'),
      }))
      .mutation(async ({ input }) => {
        // Save to database
        await createContactRequest({
          name: input.name,
          email: input.email,
          phone: input.phone,
          source: input.source,
        });
        
        // Notify owner
        await notifyOwner({
          title: `Новая заявка с сайта (${input.source})`,
          content: `Имя: ${input.name}\nEmail: ${input.email}\nТелефон: ${input.phone}\nИсточник: ${input.source}`,
        });
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
