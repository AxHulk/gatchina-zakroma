import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

interface Product {
  id: number;
  sku: string;
  category: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  quantity: number;
  unit: string | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(`${product.title} добавлен в корзину`);
      utils.cart.count.invalidate();
      utils.cart.get.invalidate();
    },
    onError: () => {
      toast.error("Ошибка при добавлении в корзину");
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  const handleBuyNow = () => {
    addToCartMutation.mutate({ productId: product.id, quantity: 1 }, {
      onSuccess: () => {
        navigate("/cart");
      },
    });
  };

  // Format price from cents to rubles
  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // Get unit label
  const getUnitLabel = (unit: string | null) => {
    switch (unit) {
      case "KGM":
        return "кг";
      case "PCE":
        return "шт";
      case "LTR":
        return "л";
      default:
        return "кг";
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🥬</span>
            </div>
          )}
          {product.quantity <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Нет в наличии</span>
            </div>
          )}
          {product.quantity > 0 && product.quantity < 10 && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
              Мало на складе
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.category}
          </span>
        </div>
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price)} ₽
          </span>
          <span className="text-sm text-muted-foreground">
            / {getUnitLabel(product.unit)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={handleAddToCart}
            disabled={product.quantity <= 0 || addToCartMutation.isPending}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">В корзину</span>
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1"
            onClick={handleBuyNow}
            disabled={product.quantity <= 0 || addToCartMutation.isPending}
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Купить</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
