import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { adminGet, adminDelete } from "@/lib/admin-api";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Trash2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

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

const sourceOptions = [
  { value: "all", label: "Все источники" },
  { value: "paymo_callback", label: "Paymo колбеки" },
  { value: "paymaster_callback", label: "Paymaster колбеки" },
  { value: "ckassa_callback", label: "Ckassa колбеки" },
  { value: "payment", label: "Платежи" },
  { value: "order", label: "Заказы" },
  { value: "cart", label: "Корзина" },
  { value: "contact", label: "Заявки" },
  { value: "trpc", label: "tRPC API" },
  { value: "catalog", label: "Каталог" },
  { value: "general", label: "Общие" },
];

const methodOptions = [
  { value: "all", label: "Все методы" },
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
  { value: "PATCH", label: "PATCH" },
];

function getMethodColor(method: string) {
  switch (method) {
    case "GET": return "bg-blue-100 text-blue-700";
    case "POST": return "bg-green-100 text-green-700";
    case "PUT": return "bg-amber-100 text-amber-700";
    case "DELETE": return "bg-red-100 text-red-700";
    case "PATCH": return "bg-purple-100 text-purple-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

function getStatusColor(status: number | null) {
  if (!status) return "bg-gray-100 text-gray-600";
  if (status < 300) return "bg-green-100 text-green-700";
  if (status < 400) return "bg-blue-100 text-blue-700";
  if (status < 500) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function getSourceLabel(source: string) {
  const found = sourceOptions.find((s) => s.value === source);
  return found?.label || source;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("ru-RU", {
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
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </p>
      <pre className="bg-muted/50 rounded-lg p-3 text-xs overflow-x-auto max-h-64 overflow-y-auto font-mono whitespace-pre-wrap break-all">
        {formatted}
      </pre>
    </div>
  );
}

export default function AdminLogs() {
  const [data, setData] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState("all");
  const [method, setMethod] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "50");
      if (source !== "all") params.set("source", source);
      if (method !== "all") params.set("method", method);
      if (search) params.set("search", search);

      const result = await adminGet<LogsResponse>(
        `/api/admin/logs?${params.toString()}`
      );
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, source, method, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClearLogs = async () => {
    if (!confirm("Удалить логи старше 7 дней?")) return;
    try {
      await adminDelete("/api/admin/logs/clear?days=7");
      toast.success("Старые логи удалены");
      fetchLogs();
    } catch {
      toast.error("Ошибка при удалении логов");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Логи запросов</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Все API-запросы и колбеки, проходящие через сайт
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Обновить
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-1" />
              Фильтры
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearLogs}>
              <Trash2 className="h-4 w-4 mr-1" />
              Очистить
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Источник
                  </label>
                  <select
                    value={source}
                    onChange={(e) => { setSource(e.target.value); setPage(1); }}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {sourceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Метод
                  </label>
                  <select
                    value={method}
                    onChange={(e) => { setMethod(e.target.value); setPage(1); }}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {methodOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Поиск по URL
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logs table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : !data?.logs?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                Логи не найдены
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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Время (мс)</th>
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
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${getMethodColor(log.method)}`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 max-w-xs truncate font-mono text-xs">
                          {log.path}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(log.statusCode)}`}>
                            {log.statusCode || "—"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge variant="outline" className="text-xs">
                            {getSourceLabel(log.source)}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-muted-foreground">
                          {log.duration !== null ? `${log.duration}ms` : "—"}
                        </td>
                        <td className="py-2.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {log.ip || "—"}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                          >
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
              Показано {((page - 1) * 50) + 1}–{Math.min(page * 50, data.pagination.total)} из{" "}
              {data.pagination.total.toLocaleString("ru-RU")}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Log detail modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">
                  Детали запроса #{selectedLog.id}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedLog(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Метод</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${getMethodColor(selectedLog.method)}`}>
                      {selectedLog.method}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Статус</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${getStatusColor(selectedLog.statusCode)}`}>
                      {selectedLog.statusCode || "—"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Время</p>
                    <p className="text-sm font-medium mt-1">
                      {selectedLog.duration !== null ? `${selectedLog.duration}ms` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Источник</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {getSourceLabel(selectedLog.source)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">URL</p>
                  <p className="text-sm font-mono bg-muted/50 rounded p-2 mt-1 break-all">
                    {selectedLog.url}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">IP</p>
                    <p className="text-sm mt-1">{selectedLog.ip || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Время</p>
                    <p className="text-sm mt-1">{formatDate(selectedLog.timestamp)}</p>
                  </div>
                </div>

                {selectedLog.userAgent && (
                  <div>
                    <p className="text-xs text-muted-foreground">User Agent</p>
                    <p className="text-xs font-mono bg-muted/50 rounded p-2 mt-1 break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}

                <JsonViewer data={selectedLog.requestHeaders} title="Заголовки запроса" />
                <JsonViewer data={selectedLog.requestBody} title="Тело запроса" />
                <JsonViewer data={selectedLog.responseBody} title="Тело ответа" />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
