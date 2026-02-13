import crypto from "crypto";

// Paymo configuration
const PAYMO_API_KEY = process.env.PAYMO_API_KEY || "";
const PAYMO_SECRET_KEY = process.env.PAYMO_SECRET_KEY || "";
const PAYMO_CHECKOUT_URL = "https://checkout.paymo.ru/uniform/";

/**
 * Generate SHA256 signature for Paymo payment
 * Formula: sha256(api_key + tx_id + amount + secret_key)
 * amount is in kopecks (string)
 */
export function generatePaymoSignature(txId: string, amountKopecks: number): string {
  const data = PAYMO_API_KEY + txId + amountKopecks.toString() + PAYMO_SECRET_KEY;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Verify Paymo callback signature
 * Formula: sha256(tx_id + amount + secret_key)
 */
export function verifyPaymoCallbackSignature(txId: string, amountKopecks: number, signature: string): boolean {
  if (!PAYMO_SECRET_KEY) {
    console.warn("[Paymo] No secret key configured, skipping signature verification");
    return true;
  }
  const data = txId + amountKopecks.toString() + PAYMO_SECRET_KEY;
  const expected = crypto.createHash("sha256").update(data).digest("hex");
  return expected === signature;
}

/**
 * Build Paymo payment form data for UNIFORM page redirect
 */
export interface PaymoPaymentParams {
  orderNumber: string;
  amountKopecks: number;
  description: string;
  customerEmail?: string;
  customerPhone?: string;
  successUrl: string;
  failUrl: string;
}

export function buildPaymoFormData(params: PaymoPaymentParams): Record<string, string> {
  const txId = params.orderNumber;
  const signature = generatePaymoSignature(txId, params.amountKopecks);

  const formData: Record<string, string> = {
    api_key: PAYMO_API_KEY,
    tx_id: txId,
    amount: params.amountKopecks.toString(),
    description: params.description,
    signature: signature,
    success_redirect: params.successUrl,
    fail_redirect: params.failUrl,
    auto_return: "3",
    extra_orderNumber: params.orderNumber,
  };

  if (params.customerEmail) {
    formData.email = params.customerEmail;
  }
  if (params.customerPhone) {
    formData.phone = params.customerPhone.replace(/[^0-9+]/g, "");
  }

  return formData;
}

/**
 * Get the Paymo checkout URL
 */
export function getPaymoCheckoutUrl(): string {
  return PAYMO_CHECKOUT_URL;
}

/**
 * Get Paymo API key (for frontend form)
 */
export function getPaymoApiKey(): string {
  return PAYMO_API_KEY;
}
