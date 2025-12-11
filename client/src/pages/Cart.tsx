import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

export default function Cart() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data: cartItems = [], isLoading } = trpc.cart.get.useQuery();

  const updateMutation = trpc.cart.update.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      utils.cart.count.invalidate();
    },
    onError: () => {
      toast.error("Ошибка при обновлении корзины");
    },
  });

  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      toast.success("Товар удален из корзины");
      utils.cart.get.invalidate();
      utils.cart.count.invalidate();
    },
    onError: () => {
      toast.error("Ошибка при удалении товара");
    },
  });

  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      toast.success("Корзина очищена");
      utils.cart.get.invalidate();
      utils.cart.count.invalidate();
    },
    onError: () => {
      toast.error("Ошибка при очистке корзины");
    },
  });

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeMutation.mutate({ productId });
    } else {
      updateMutation.mutate({ productId, quantity });
    }
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString("ru-RU", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const getUnitLabel = (unit: string | null) => {
    switch (unit) {
      case "KGM": return "кг";
      case "PCE": return "шт";
      case "LTR": return "л";
      default: return "кг";
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.price * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container">
          <div className="max-w-md mx-auto text-center py-16">
            <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
            <p className="text-muted-foreground mb-8">
              Добавьте товары из каталога, чтобы оформить заказ
            </p>
            <Link href="/shop">
              <Button size="lg" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Перейти в магазин
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Корзина</h1>
            <p className="text-muted-foreground">
              {totalItems} {totalItems === 1 ? "товар" : totalItems < 5 ? "товара" : "товаров"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
          >
            Очистить корзину
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              if (!item.product) return null;
              const product = item.product;

              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🥬
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeMutation.mutate({ productId: product.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(product.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm text-muted-foreground ml-1">
                              {getUnitLabel(product.unit)}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="font-bold text-primary">
                              {formatPrice(product.price * item.quantity)} ₽
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatPrice(product.price)} ₽ / {getUnitLabel(product.unit)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Итого</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Товары ({totalItems})</span>
                    <span>{formatPrice(totalPrice)} ₽</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Доставка</span>
                    <span>Рассчитывается</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>К оплате</span>
                    <span className="text-primary">{formatPrice(totalPrice)} ₽</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={() => setLocation("/checkout")}>
                  Оформить заказ
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Нажимая кнопку, вы соглашаетесь с условиями оферты
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8">
          <Link href="/shop">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Продолжить покупки
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
