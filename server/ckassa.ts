/**
 * CKassa Payment Integration
 * API Documentation: https://docs.ckassa.ru/doc/open-api
 *
 * Боевые данные:
 * - ApiLoginAuthorization: 61f53aaa-f5e0-4de1-8f7d-ebea082650ef
 * - ApiAuthorization: 86237200-9bc5-44ed-bef8-8023fd4773ea
 * - servCode: 17233-19924-1
 */

const CKASSA_API_LOGIN = process.env.CKASSA_API_LOGIN || "61f53aaa-f5e0-4de1-8f7d-ebea082650ef";
const CKASSA_API_AUTH = process.env.CKASSA_API_AUTH || "86237200-9bc5-44ed-bef8-8023fd4773ea";
const CKASSA_SERV_CODE = process.env.CKASSA_SERV_CODE || "17233-19924-1";
const CKASSA_BASE_URL = "https://api2.ckassa.ru/api-shop/rs/open";

/**
 * Генерирует короткий номер заказа для CKassa (не более 12 символов).
 * Берёт последние 12 символов из полного номера заказа (GZ-XXXXXXXX-XXXX).
 */
export function getCkassaOrderRef(orderNumber: string): string {
  // Убираем префикс "GZ-" и дефисы, оставляем только буквенно-цифровые символы
  const stripped = orderNumber.replace(/[^A-Z0-9]/gi, "");
  // Берём последние 12 символов
  return stripped.slice(-12);
}

export interface CkassaInvoiceParams {
  /** Номер заказа (1-12 символов) — передаётся как единственный элемент properties */
  orderRef: string;
  /** Сумма платежа в копейках */
  amountKopecks: number;
  /** Тип инвойса: READ_ONLY — сумма и реквизиты только для чтения */
  invType?: "EDITABLE" | "PROPERTY_READ_ONLY" | "AMOUNT_READ_ONLY" | "READ_ONLY";
}

export interface CkassaInvoiceResult {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

/**
 * Создаёт инвойс в CKassa и возвращает URL для оплаты.
 * Метод: POST /invoice/create2
 */
export async function createCkassaInvoice(params: CkassaInvoiceParams): Promise<CkassaInvoiceResult> {
  const { orderRef, amountKopecks, invType = "READ_ONLY" } = params;

  // Валидация: номер заказа должен быть от 1 до 12 символов
  if (!orderRef || orderRef.length < 1 || orderRef.length > 12) {
    console.error(`[CKassa] Invalid orderRef length: "${orderRef}" (${orderRef.length} chars, must be 1-12)`);
    return { success: false, error: `Неверная длина номера заказа: ${orderRef.length} символов (допустимо 1-12)` };
  }

  const requestBody = {
    servCode: CKASSA_SERV_CODE,
    startPaySelect: true,
    invType,
    amount: amountKopecks,
    // properties: передаём только значение реквизита (value), без названия (name)
    properties: [orderRef],
  };

  console.log(`[CKassa] Creating invoice for orderRef="${orderRef}", amount=${amountKopecks} kopecks`);
  console.log(`[CKassa] Request body: ${JSON.stringify(requestBody)}`);

  try {
    const response = await fetch(`${CKASSA_BASE_URL}/invoice/create2/`, {
      method: "POST",
      headers: {
        "ApiLoginAuthorization": CKASSA_API_LOGIN,
        "ApiAuthorization": CKASSA_API_AUTH,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log(`[CKassa] Response status: ${response.status}, body: ${responseText}`);

    if (!response.ok) {
      return {
        success: false,
        error: `CKassa API error: HTTP ${response.status} — ${responseText}`,
      };
    }

    // Ответ — это URL для оплаты (например: https://bc.ckassa.ru/ltaaf2)
    const paymentUrl = responseText.trim();

    if (!paymentUrl.startsWith("http")) {
      return {
        success: false,
        error: `CKassa вернул неожиданный ответ: ${paymentUrl}`,
      };
    }

    console.log(`[CKassa] Invoice created successfully: ${paymentUrl}`);
    return { success: true, paymentUrl };
  } catch (error: any) {
    console.error(`[CKassa] Network error: ${error.message}`);
    return { success: false, error: `Ошибка сети: ${error.message}` };
  }
}

/**
 * Получает список новых/изменённых платежей от CKassa.
 * Метод: GET /payments/new
 * Используется для polling статусов платежей.
 */
export interface CkassaPayment {
  regPayNum: string;
  brandName: string;
  orgName: string;
  properties: Array<{ name: string; value: string }>;
  amount: number;
  currency?: string;
  receipt?: string;
  state: string;
  payTools?: Record<string, string>;
  createDate?: string;
}

export async function getCkassaNewPayments(): Promise<CkassaPayment[]> {
  try {
    const response = await fetch(`${CKASSA_BASE_URL}/payments/new`, {
      method: "GET",
      headers: {
        "ApiLoginAuthorization": CKASSA_API_LOGIN,
        "ApiAuthorization": CKASSA_API_AUTH,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[CKassa] payments/new error: HTTP ${response.status} — ${text}`);
      return [];
    }

    const data = await response.json();
    return data.payments || [];
  } catch (error: any) {
    console.error(`[CKassa] payments/new network error: ${error.message}`);
    return [];
  }
}

/**
 * Отменяет инвойс CKassa.
 * Метод: POST /invoice/cancel
 */
export async function cancelCkassaInvoice(invoiceUrl: string): Promise<boolean> {
  try {
    const url = `${CKASSA_BASE_URL}/invoice/cancel?invoiceUrl=${encodeURIComponent(invoiceUrl)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "ApiLoginAuthorization": CKASSA_API_LOGIN,
        "ApiAuthorization": CKASSA_API_AUTH,
      },
    });

    const text = await response.text();
    console.log(`[CKassa] Cancel invoice ${invoiceUrl}: HTTP ${response.status}, response: ${text}`);
    return response.ok && text.trim() === "SUCCESS";
  } catch (error: any) {
    console.error(`[CKassa] Cancel invoice error: ${error.message}`);
    return false;
  }
}
