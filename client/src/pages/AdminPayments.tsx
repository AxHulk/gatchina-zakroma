import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  CreditCard,
} from "lucide-react";

interface LogEntry {
  id: number;
  timestamp: string;
  method: string;
  url: string;
  path: string;
  statusCode: number | null;
  requestHeaders: string | null;
  requestBody: string | null;
  responseBody: string | null;
  ip: string | null;
  userAgent: string | null;
  source: string;
  duration: number | null;
}

interface LogsResponse {
  logs: LogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function JsonViewer({ data, title }: { data: string | null; title: string }) {
  if (!data) return null;
  let formatted = data;
  try {
    const parsed = JSON.parse(data);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {}
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      <pre className="bg-muted/50 rounded-lg p-3 text-xs overflow-x-auto max-h-64 overflow-y-auto font-mono whitespace-pre-wrap break-all">
        {formatted}
      </pre>
    </div>
  );
}

const sourceFilter = [
  { value: "all", label: "Все платежные" },
  { value: "paymo_callback", label: "Paymo колбеки" },
  { value: "paymaster_callback", label: "Paymaster колбеки" },
  { value: "ckassa_callback", label: "Ckassa колбеки" },
  { value: "payment", label: "Платежи (общие)" },
];

export default function AdminPayments() {
  const [data, setData] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sourceType, setSourceType] = useState("all");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      
      // Filter only payment-related sources
      if (sourceType === "all") {
        // We need to get payment-related logs — use search
        params.set("search", "/api/payment");
      } else {
        params.set("source", sourceType);
      }

      const result = await adminGet<LogsResponse>(
        `/api/admin/logs?${params.toString()}`
      );
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, sourceType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Платежи и колбеки</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Все платежные запросы и колбеки от платежных систем
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sourceType}
              onChange={(e) => { setSourceType(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {sourceFilter.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={fetchLogs}>
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
            ) : !data?.logs?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                Платежные логи не найдены
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Время</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Метод</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">URL</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Статус</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Источник</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="py-2.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${
                            log.method === "POST" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 max-w-xs truncate font-mono text-xs">
                          {log.path}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            !log.statusCode ? "bg-gray-100 text-gray-600" :
                            log.statusCode < 300 ? "bg-green-100 text-green-700" :
                            log.statusCode < 500 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {log.statusCode || "—"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-muted-foreground">
                          {log.ip || "—"}
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
              Страница {page} из {data.pagination.totalPages}
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

        {/* Detail modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 pb-3">
                <h3 className="text-lg font-semibold">Детали платежного запроса #{selectedLog.id}</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Метод</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${
                      selectedLog.method === "POST" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {selectedLog.method}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Статус</p>
                    <p className="text-sm font-medium mt-1">{selectedLog.statusCode || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Время</p>
                    <p className="text-sm font-medium mt-1">
                      {selectedLog.duration !== null ? `${selectedLog.duration}ms` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IP</p>
                    <p className="text-sm font-medium mt-1">{selectedLog.ip || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">URL</p>
                  <p className="text-sm font-mono bg-muted/50 rounded p-2 mt-1 break-all">{selectedLog.url}</p>
                </div>

                <JsonViewer data={selectedLog.requestHeaders} title="Заголовки запроса" />
                <JsonViewer data={selectedLog.requestBody} title="Тело запроса" />
                <JsonViewer data={selectedLog.responseBody} title="Тело ответа" />
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
