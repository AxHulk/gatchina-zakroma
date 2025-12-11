import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Truck, MapPin, CreditCard, Banknote, FileText, ShoppingBag, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Checkout() {
  const [, setLocation] = useLocation();
  
  const { data: cartItems, isLoading: cartLoading } = trpc.cart.get.useQuery();
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryComment, setDeliveryComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "invoice">("cash");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("Заказ успешно оформлен!");
      setLocation(`/order-success/${data.orderNumber}`);
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при оформлении заказа");
    },
  });
  
  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0) || 0;
  
  const deliveryFee = deliveryMethod === "delivery" ? 50000 : 0; // 500 rubles in kopecks
  const total = subtotal + deliveryFee;
  
  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString("ru-RU", { minimumFractionDigits: 2 });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast.error("Необходимо согласиться с условиями");
      return;
    }
    
    if (deliveryMethod === "delivery" && !deliveryAddress) {
      toast.error("Укажите адрес доставки");
      return;
    }
    
    createOrderMutation.mutate({
      customerName,
      customerEmail,
      customerPhone,
      deliveryMethod,
      deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress : undefined,
      deliveryCity: deliveryMethod === "delivery" ? deliveryCity : undefined,
      deliveryComment,
      paymentMethod,
    });
  };
  
  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12">
          <Card className="max-w-md mx-auto text-center p-8">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Корзина пуста</h2>
            <p className="text-muted-foreground mb-6">
              Добавьте товары в корзину для оформления заказа
            </p>
            <Link href="/shop">
              <Button>Перейти в каталог</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Главная</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-primary">Корзина</Link>
          <span>/</span>
          <span className="text-foreground">Оформление заказа</span>
        </nav>
        
        <h1 className="text-3xl font-bold text-foreground mb-8">Оформление заказа</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                    Контактные данные
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя *</Label>
                      <Input
                        id="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Иван Иванов"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+7 (999) 123-45-67"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="example@mail.ru"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Delivery method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                    Способ получения
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={(value) => setDeliveryMethod(value as "pickup" | "delivery")}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer font-medium">
                          <MapPin className="h-5 w-5 text-primary" />
                          Самовывоз
                          <span className="text-sm font-normal text-green-600">Бесплатно</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ленинградская область, Гатчинский район, д. Малые Колпаны
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer font-medium">
                          <Truck className="h-5 w-5 text-primary" />
                          Доставка
                          <span className="text-sm font-normal text-muted-foreground">500 ₽</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Доставка по Санкт-Петербургу и Ленинградской области
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  {deliveryMethod === "delivery" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Город</Label>
                          <Input
                            id="city"
                            value={deliveryCity}
                            onChange={(e) => setDeliveryCity(e.target.value)}
                            placeholder="Санкт-Петербург"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Адрес доставки *</Label>
                        <Input
                          id="address"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Улица, дом, квартира"
                          required={deliveryMethod === "delivery"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comment">Комментарий к заказу</Label>
                        <Textarea
                          id="comment"
                          value={deliveryComment}
                          onChange={(e) => setDeliveryComment(e.target.value)}
                          placeholder="Код домофона, этаж, удобное время доставки..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Payment method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                    Способ оплаты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as "cash" | "card" | "invoice")}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-5 w-5 text-primary" />
                        Наличными при получении
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Картой при получении
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="invoice" id="invoice" />
                      <Label htmlFor="invoice" className="flex items-center gap-2 cursor-pointer flex-1">
                        <FileText className="h-5 w-5 text-primary" />
                        Безналичный расчет (для юр. лиц)
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
            
            {/* Right column - Order summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Ваш заказ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{item.product?.title}</span>
                          <span className="text-muted-foreground ml-2">
                            × {item.quantity} {item.product?.unit === "KGM" ? "кг" : "шт"}
                          </span>
                        </div>
                        <span className="font-medium">
                          {formatPrice((item.product?.price || 0) * item.quantity)} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Товары ({cartItems.length})</span>
                      <span>{formatPrice(subtotal)} ₽</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Доставка</span>
                      <span>{deliveryMethod === "pickup" ? "Бесплатно" : `${formatPrice(deliveryFee)} ₽`}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Итого</span>
                    <span className="text-primary">{formatPrice(total)} ₽</span>
                  </div>
                  
                  {/* Terms checkbox */}
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                      Я согласен с{" "}
                      <Link href="/offer" className="text-primary hover:underline">
                        условиями оферты
                      </Link>{" "}
                      и{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        политикой конфиденциальности
                      </Link>
                    </Label>
                  </div>
                  
                  {/* Submit button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={createOrderMutation.isPending || !agreeToTerms}
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Оформление...
                      </>
                    ) : (
                      "Оформить заказ"
                    )}
                  </Button>
                  
                  {/* Back to cart */}
                  <Link href="/cart" className="block">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Вернуться в корзину
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
}
