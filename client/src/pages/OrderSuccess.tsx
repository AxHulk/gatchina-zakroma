import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Package, Truck, MapPin, Phone, Mail, ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function OrderSuccess() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber || "";
  
  const { data: order, isLoading, error } = trpc.orders.getByNumber.useQuery(
    { orderNumber },
    { enabled: !!orderNumber }
  );
  
  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString("ru-RU", { minimumFractionDigits: 2 });
  };
  
  const getDeliveryMethodText = (method: string) => {
    return method === "pickup" ? "Самовывоз" : "Доставка";
  };
  
  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      cash: "Наличными при получении",
      card: "Картой при получении",
      invoice: "Безналичный расчет",
    };
    return methods[method] || method;
  };
  
  if (isLoading) {
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
  
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12">
          <Card className="max-w-md mx-auto text-center p-8">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Заказ не найден</h2>
            <p className="text-muted-foreground mb-6">
              К сожалению, мы не смогли найти информацию о заказе {orderNumber}
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
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Заказ оформлен!</h1>
            <p className="text-lg text-muted-foreground">
              Номер вашего заказа: <span className="font-semibold text-foreground">{order.orderNumber}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Мы отправили подтверждение на {order.customerEmail}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Order details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Детали заказа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <span>{item.productTitle}</span>
                        <span className="text-muted-foreground ml-2">
                          × {item.quantity} {item.unit === "KGM" ? "кг" : "шт"}
                        </span>
                      </div>
                      <span className="font-medium">
                        {formatPrice(item.subtotal)} ₽
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Товары</span>
                    <span>{formatPrice(order.subtotal || 0)} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Доставка</span>
                    <span>
                      {order.deliveryFee === 0 ? "Бесплатно" : `${formatPrice(order.deliveryFee || 0)} ₽`}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Итого</span>
                  <span className="text-primary">{formatPrice(order.total || 0)} ₽</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Delivery & Payment info */}
            <div className="space-y-6">
              {/* Contact info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Контактные данные
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Имя:</span> {order.customerName}</p>
                  <p><span className="text-muted-foreground">Email:</span> {order.customerEmail}</p>
                  <p><span className="text-muted-foreground">Телефон:</span> {order.customerPhone}</p>
                </CardContent>
              </Card>
              
              {/* Delivery info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {order.deliveryMethod === "pickup" ? (
                      <MapPin className="h-4 w-4 text-primary" />
                    ) : (
                      <Truck className="h-4 w-4 text-primary" />
                    )}
                    {getDeliveryMethodText(order.deliveryMethod || "delivery")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {order.deliveryMethod === "pickup" ? (
                    <p>Ленинградская область, Гатчинский район, д. Малые Колпаны</p>
                  ) : (
                    <div className="space-y-1">
                      {order.deliveryCity && <p>{order.deliveryCity}</p>}
                      {order.deliveryAddress && <p>{order.deliveryAddress}</p>}
                      {order.deliveryComment && (
                        <p className="text-muted-foreground mt-2">
                          Комментарий: {order.deliveryComment}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Payment info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Способ оплаты</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>{getPaymentMethodText(order.paymentMethod || "cash")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Contact info */}
          <Card className="mt-8 bg-muted/50">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="font-semibold mb-1">Есть вопросы по заказу?</h3>
                  <p className="text-sm text-muted-foreground">
                    Свяжитесь с нами, мы всегда рады помочь
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <a href="tel:+78129894828" className="flex items-center gap-2 text-primary hover:underline">
                    <Phone className="h-4 w-4" />
                    +7 812 98 94 828
                  </a>
                  <a href="mailto:sales@gzakroma.ru" className="flex items-center gap-2 text-primary hover:underline">
                    <Mail className="h-4 w-4" />
                    sales@gzakroma.ru
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/shop">
              <Button size="lg" className="w-full sm:w-auto">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Продолжить покупки
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
