import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { adminGet } from "@/lib/admin-api";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Package,
} from "lucide-react";

interface OrderItem {
  id: number;
  productTitle: string;
  productSku: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryComment: string | null;
  paymentMethod: string;
  paymentStatus: string;
  paymentId: string | null;
  paymentProvider: string | null;
  paymentUrl: string | null;
  paidAt: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusLabels: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждён",
  processing: "В обработке",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Ожидает",
  processing: "Обработка",
  paid: "Оплачен",
  failed: "Ошибка",
  refunded: "Возврат",
};

function getStatusBadge(status: string) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

function getPaymentBadge(status: string) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-purple-100 text-purple-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

function formatPrice(kopecks: number) {
  return (kopecks / 100).toLocaleString("ru-RU", { minimumFractionDigits: 0 }) + " ₽";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrders() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (paymentFilter !== "all") params.set("paymentStatus", paymentFilter);

      const result = await adminGet<OrdersResponse>(
        `/api/admin/orders?${params.toString()}`
      );
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Заказы</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Все заказы с сайта
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Все статусы</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Все оплаты</option>
              {Object.entries(paymentStatusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Обновить
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : !data?.orders?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                Заказы не найдены
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Номер</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Клиент</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Сумма</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Статус</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Оплата</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Дата</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="py-2.5 px-4 font-mono text-xs font-bold">
                          {order.orderNumber}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="text-sm font-medium">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                        </td>
                        <td className="py-2.5 px-4 font-medium">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(order.status)}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPaymentBadge(order.paymentStatus)}`}>
                            {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Страница {page} из {data.pagination.totalPages} ({data.pagination.total} всего)
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Order detail modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">
                  Заказ {selectedOrder.orderNumber}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Клиент</p>
                    <p className="text-sm font-medium">{selectedOrder.customerName}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.customerEmail}</p>
                    <p className="text-xs text-muted-foreground">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Доставка</p>
                    <p className="text-sm font-medium">
                      {selectedOrder.deliveryMethod === "pickup" ? "Самовывоз" : "Доставка"}
                    </p>
                    {selectedOrder.deliveryAddress && (
                      <p className="text-xs text-muted-foreground">{selectedOrder.deliveryAddress}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Статус</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${getStatusBadge(selectedOrder.status)}`}>
                      {statusLabels[selectedOrder.status] || selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Оплата</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${getPaymentBadge(selectedOrder.paymentStatus)}`}>
                      {paymentStatusLabels[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Способ оплаты</p>
                    <p className="text-sm font-medium mt-1">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                {selectedOrder.paymentId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Payment ID</p>
                    <p className="text-xs font-mono bg-muted/50 rounded p-2 mt-1">{selectedOrder.paymentId}</p>
                  </div>
                )}

                {/* Order items */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Товары
                  </p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30 border-b">
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Товар</th>
                          <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Цена</th>
                          <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Кол-во</th>
                          <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="py-2 px-3">{item.productTitle}</td>
                            <td className="py-2 px-3 text-right">{formatPrice(item.price)}</td>
                            <td className="py-2 px-3 text-right">{item.quantity}</td>
                            <td className="py-2 px-3 text-right font-medium">{formatPrice(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/20">
                          <td colSpan={3} className="py-2 px-3 text-right font-medium">Итого:</td>
                          <td className="py-2 px-3 text-right font-bold">{formatPrice(selectedOrder.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
