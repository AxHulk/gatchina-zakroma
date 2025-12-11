import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Minus, Plus, ShoppingCart, Zap, Package, Truck, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import ContactForm from "@/components/ContactForm";
import ProductCard from "@/components/ProductCard";

export default function Product() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const productId = parseInt(params.id || "0", 10);
  
  const [quantity, setQuantity] = useState(1);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  
  const { data: product, isLoading, error } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: productId > 0 }
  );
  
  const { data: similarProducts } = trpc.products.similar.useQuery(
    { productId, category: product?.category || "", limit: 4 },
    { enabled: !!product?.category }
  );
  
  const utils = trpc.useUtils();
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.count.invalidate();
      utils.cart.get.invalidate();
      toast.success(`${product?.title} добавлен в корзину`);
    },
    onError: () => {
      toast.error("Ошибка при добавлении в корзину");
    }
  });
  
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 99)) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCartMutation.mutate({ productId: product.id, quantity });
    }
  };
  
  const handleQuickBuy = () => {
    setShowQuickBuy(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Link href="/shop" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Вернуться в магазин
          </Link>
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Товар не найден</h1>
            <p className="text-muted-foreground mb-6">К сожалению, запрашиваемый товар не существует или был удален.</p>
            <Button onClick={() => setLocation("/shop")}>
              Перейти в каталог
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const formatPrice = (priceInCents: number) => {
    // Цена хранится в копейках, делим на 100 для отображения в рублях
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceInCents / 100);
  };
  
  // Функция для отображения единицы измерения
  const formatUnit = (unit: string | null) => {
    if (!unit) return 'КГ';
    return unit === 'KGM' ? 'КГ' : unit;
  };
  
  const totalPrice = product.price * quantity;
  const inStock = product.quantity > 0;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Главная</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary">Магазин</Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>
        
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Package className="h-24 w-24 mx-auto mb-4 opacity-50" />
                      <p>Изображение товара</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Product badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {product.category}
              </Badge>
              {inStock ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  В наличии: {product.quantity} {formatUnit(product.unit)}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  Нет в наличии
                </Badge>
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
              <p className="text-muted-foreground">Артикул: {product.sku || `SKU-${product.id}`}</p>
            </div>
            
            <Separator />
            
            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
                <span className="text-muted-foreground">/ {formatUnit(product.unit)}</span>
              </div>
              {quantity > 1 && (
                <p className="text-lg text-muted-foreground">
                  Итого: <span className="font-semibold text-foreground">{formatPrice(totalPrice)}</span>
                </p>
              )}
            </div>
            
            <Separator />
            
            {/* Quantity selector */}
            {inStock && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Количество ({formatUnit(product.unit)})
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="h-12 w-12 rounded-r-none"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-16 h-12 flex items-center justify-center border-x border-border">
                        <span className="text-lg font-semibold">{quantity}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.quantity}
                        className="h-12 w-12 rounded-l-none"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Максимум: {product.quantity} {formatUnit(product.unit)}
                    </span>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="flex-1 h-14 text-lg"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                  >
                    {addToCartMutation.isPending ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 mr-2" />
                    )}
                    В корзину
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 h-14 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={handleQuickBuy}
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Купить в 1 клик
                  </Button>
                </div>
              </div>
            )}
            
            {!inStock && (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground mb-4">Товар временно отсутствует</p>
                <Button variant="outline" onClick={handleQuickBuy}>
                  Сообщить о поступлении
                </Button>
              </div>
            )}
            
            <Separator />
            
            {/* Product description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Описание</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <div className="space-y-3">
                    <p>
                      <strong>{product.title}</strong> — натуральный продукт высшего качества от проверенных 
                      поставщиков Ленинградской области. Мы работаем напрямую с фермерами и сборщиками, 
                      что гарантирует свежесть и отличный вкус.
                    </p>
                    <p>
                      Категория: <strong>{product.category}</strong>. 
                      Минимальный заказ от 1 {formatUnit(product.unit)}. 
                      Доставка по Санкт-Петербургу и Ленинградской области.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Truck className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">Доставка</p>
                  <p className="text-xs text-muted-foreground">По СПб и ЛО</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">Гарантия</p>
                  <p className="text-xs text-muted-foreground">Качества</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Package className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">Оптом</p>
                  <p className="text-xs text-muted-foreground">От 1 {formatUnit(product.unit)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick buy form */}
        {showQuickBuy && (
          <div className="mt-12">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Быстрый заказ</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowQuickBuy(false)}>
                    Закрыть
                  </Button>
                </div>
                <p className="text-muted-foreground mb-6">
                  Оставьте заявку и мы свяжемся с вами для оформления заказа на{" "}
                  <strong>{product.title}</strong> ({quantity} {formatUnit(product.unit)})
                </p>
                <ContactForm 
                  source={`quick_buy_${product.id}_qty_${quantity}`}
                  title=""
                  description=""
                  onSuccess={() => {
                    setShowQuickBuy(false);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Similar products */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="mt-16">
            <Separator className="mb-12" />
            <h2 className="text-2xl font-bold text-foreground mb-6">Похожие товары</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct.id} product={similarProduct} />
              ))}
            </div>
          </div>
        )}
        
        {/* Back to shop */}
        <div className="mt-12 text-center">
          <Link href="/shop">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться в каталог
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
