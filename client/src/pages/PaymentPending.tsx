import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Clock, CreditCard, ArrowLeft, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export default function PaymentPending() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber || "";
  const [pollCount, setPollCount] = useState(0);
  
  const { data: order, isLoading, refetch } = trpc.orders.getByNumber.useQuery(
    { orderNumber },
    { 
      enabled: !!orderNumber,
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );
  
  // Redirect to success page if payment is confirmed
  useEffect(() => {
    if (order?.paymentStatus === "paid") {
      window.location.href = `/payment-success/${orderNumber}`;
    } else if (order?.paymentStatus === "failed") {
      window.location.href = `/payment-failed/${orderNumber}`;
    }
  }, [order?.paymentStatus, orderNumber]);
  
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
  
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12">
          <Card className="max-w-md mx-auto text-center p-8">
            <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
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
        <div className="max-w-lg mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
              </div>
              <CardTitle className="text-2xl">Ожидание оплаты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Заказ <span className="font-semibold text-foreground">{order.orderNumber}</span>
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(order.total)} ₽
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Проверяем статус оплаты...</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Страница обновится автоматически после получения оплаты
                </p>
              </div>
              
              {order.paymentUrl && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Если платежная страница не открылась автоматически:
                  </p>
                  <a href={order.paymentUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Перейти к оплате
                    </Button>
                  </a>
                </div>
              )}
              
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => refetch()}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Проверить статус
                </Button>
                
                <Link href="/">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    На главную
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
