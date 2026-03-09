import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { adminGet } from "@/lib/admin-api";
import {
  ScrollText,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Clock,
  Activity,
  TrendingUp,
} from "lucide-react";

interface Stats {
  totalLogs: number;
  last24h: number;
  paymentCallbacks: number;
  totalOrders: number;
  paidOrders: number;
  totalContacts: number;
  totalErrors: number;
  bySource: Array<{ source: string; count: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet<Stats>("/api/admin/stats")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sourceLabels: Record<string, string> = {
    paymo_callback: "Paymo колбеки",
    paymaster_callback: "Paymaster колбеки",
    ckassa_callback: "Ckassa колбеки",
    payment: "Платежи",
    order: "Заказы",
    cart: "Корзина",
    contact: "Заявки",
    trpc: "tRPC API",
    catalog: "Каталог API",
    oauth: "OAuth",
    general: "Общие",
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Дашборд</h2>
          <p className="text-muted-foreground mt-1">
            Обзор активности и статистика сайта
          </p>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего логов</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats?.totalLogs?.toLocaleString("ru-RU") || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ScrollText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">За 24 часа</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats?.last24h?.toLocaleString("ru-RU") || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Заказов</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats?.totalOrders?.toLocaleString("ru-RU") || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Оплачено</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stats?.paidOrders?.toLocaleString("ru-RU") || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Платежные колбеки</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats?.paymentCallbacks?.toLocaleString("ru-RU") || 0}
                  </p>
                </div>
                <div className="h-10 w-10 bg-violet-50 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Заявки</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats?.totalContacts?.toLocaleString("ru-RU") || 0}
                  </p>
                </div>
                <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ошибки (5xx)</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats?.totalErrors?.toLocaleString("ru-RU") || 0}
                  </p>
                </div>
                <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs by source */}
        {stats?.bySource && stats.bySource.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Логи по источникам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.bySource.map((item) => {
                  const percentage = stats.totalLogs > 0
                    ? Math.round((item.count / stats.totalLogs) * 100)
                    : 0;
                  return (
                    <div key={item.source} className="flex items-center gap-4">
                      <div className="w-40 text-sm font-medium text-foreground">
                        {sourceLabels[item.source] || item.source}
                      </div>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                      <div className="w-20 text-right">
                        <Badge variant="secondary" className="text-xs">
                          {item.count.toLocaleString("ru-RU")}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
