import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { XCircle, CreditCard, Phone, Mail, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PaymentFailed() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber || "";
  
  const { data: order, isLoading } = trpc.orders.getByNumber.useQuery(
    { orderNumber },
    { enabled: !!orderNumber }
  );
  
  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString("ru-RU", { minimumFractionDigits: 2 });
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
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-lg mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Оплата не прошла</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  К сожалению, оплата заказа <span className="font-semibold text-foreground">{orderNumber}</span> не была завершена
                </p>
                {order && (
                  <p className="text-xl font-bold">
                    Сумма: {formatPrice(order.total)} ₽
                  </p>
                )}
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                <p className="font-medium">Возможные причины:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Недостаточно средств на карте</li>
                  <li>Карта заблокирована или истек срок действия</li>
                  <li>Превышен лимит на операции</li>
                  <li>Технический сбой платежной системы</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Вы можете попробовать оплатить заказ снова или выбрать другой способ оплаты
                </p>
                
                {order?.paymentUrl && (
                  <a href={order.paymentUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Попробовать снова
                    </Button>
                  </a>
                )}
                
                <Link href="/checkout">
                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Выбрать другой способ оплаты
                  </Button>
                </Link>
              </div>
              
              {/* Contact info */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Если проблема повторяется, свяжитесь с нами:
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
              
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  На главную
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
