import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

// Create reusable transporter
function createTransporter() {
  if (!ENV.smtpHost || !ENV.smtpUser || !ENV.smtpPass) {
    console.warn("[Mailer] SMTP not configured, emails will not be sent");
    return null;
  }

  return nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: false, // port 587 with STARTTLS
    requireTLS: true,
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  deliveryAddress?: string | null;
  deliveryCity?: string | null;
  deliveryComment?: string | null;
  paymentMethod: string;
  items: Array<{
    productTitle: string;
    quantity: number;
    unit: string | null;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

function getDeliveryMethodText(method: string): string {
  return method === "pickup" ? "Самовывоз" : "Доставка курьером";
}

function getPaymentMethodText(method: string): string {
  const methods: Record<string, string> = {
    cash: "Наличными при получении",
    card: "Картой при получении",
    invoice: "Безналичный расчёт",
    online: "Онлайн-оплата",
    sbp: "Система быстрых платежей (СБП)",
  };
  return methods[method] || method;
}

function formatPrice(priceInCents: number): string {
  return (priceInCents / 100).toFixed(2).replace(".", ",") + " ₽";
}

function getUnitText(unit: string | null): string {
  if (!unit || unit === "KGM") return "кг";
  return unit;
}

/**
 * Generate HTML email for customer with order confirmation
 */
function buildCustomerEmailHtml(data: OrderEmailData): string {
  const itemsRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151;">${item.productTitle}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; text-align: center;">${item.quantity} ${getUnitText(item.unit)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; text-align: right; font-weight: 600;">${formatPrice(item.subtotal)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background-color: #1a5632; padding: 28px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Гатчинские закрома</h1>
            <p style="margin: 8px 0 0; color: #a7d5b8; font-size: 14px;">Натуральная продукция от производителей</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding: 32px;">
            <h2 style="margin: 0 0 8px; color: #1a5632; font-size: 20px;">Спасибо за заказ!</h2>
            <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">Ваш заказ <strong style="color: #1a5632;">${data.orderNumber}</strong> успешно оформлен. Наш менеджер свяжется с вами для подтверждения.</p>
            
            <!-- Order details -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px; color: #374151; font-size: 15px;">Детали заказа</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                <tr><td style="padding: 4px 0; color: #6b7280;">Способ доставки:</td><td style="padding: 4px 0; color: #374151; font-weight: 500; text-align: right;">${getDeliveryMethodText(data.deliveryMethod)}</td></tr>
                ${data.deliveryAddress ? `<tr><td style="padding: 4px 0; color: #6b7280;">Адрес:</td><td style="padding: 4px 0; color: #374151; text-align: right;">${data.deliveryAddress}${data.deliveryCity ? `, ${data.deliveryCity}` : ""}</td></tr>` : ""}
                ${data.deliveryComment ? `<tr><td style="padding: 4px 0; color: #6b7280;">Комментарий:</td><td style="padding: 4px 0; color: #374151; text-align: right;">${data.deliveryComment}</td></tr>` : ""}
                <tr><td style="padding: 4px 0; color: #6b7280;">Способ оплаты:</td><td style="padding: 4px 0; color: #374151; font-weight: 500; text-align: right;">${getPaymentMethodText(data.paymentMethod)}</td></tr>
              </table>
            </div>

            <!-- Items table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #1a5632;">
                  <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #ffffff; font-weight: 600;">Товар</th>
                  <th style="padding: 10px 12px; text-align: center; font-size: 13px; color: #ffffff; font-weight: 600;">Кол-во</th>
                  <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #ffffff; font-weight: 600;">Цена</th>
                  <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #ffffff; font-weight: 600;">Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
              <tr><td style="padding: 4px 0; font-size: 14px; color: #6b7280;">Подитог:</td><td style="padding: 4px 0; font-size: 14px; color: #374151; text-align: right;">${formatPrice(data.subtotal)}</td></tr>
              <tr><td style="padding: 4px 0; font-size: 14px; color: #6b7280;">Доставка:</td><td style="padding: 4px 0; font-size: 14px; color: #374151; text-align: right;">${data.deliveryFee > 0 ? formatPrice(data.deliveryFee) : "Бесплатно"}</td></tr>
              <tr><td colspan="2" style="border-top: 2px solid #1a5632; padding-top: 8px;"></td></tr>
              <tr><td style="padding: 4px 0; font-size: 18px; color: #1a5632; font-weight: 700;">Итого:</td><td style="padding: 4px 0; font-size: 18px; color: #1a5632; font-weight: 700; text-align: right;">${formatPrice(data.total)}</td></tr>
            </table>

            <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">Если у вас есть вопросы по заказу, свяжитесь с нами по телефону или напишите на <a href="mailto:info@gzakroma.ru" style="color: #1a5632;">info@gzakroma.ru</a></p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} Гатчинские закрома | ИП Шевцов А.А. | ИНН 471905083025<br>
              188340, Ленинградская область, р-н Гатчинский, деревня Истинка, д. 42
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Generate HTML email for manager with order notification
 */
function buildManagerEmailHtml(data: OrderEmailData): string {
  const itemsRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${item.productTitle}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: center;">${item.quantity} ${getUnitText(item.unit)}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right; font-weight: 600;">${formatPrice(item.subtotal)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background-color: #dc2626; padding: 20px 32px;">
            <h1 style="margin: 0; color: #ffffff; font-size: 18px;">🛒 Новый заказ ${data.orderNumber}</h1>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding: 24px 32px;">
            <!-- Customer info -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 8px; color: #92400e; font-size: 14px;">👤 Данные клиента</h3>
              <table cellpadding="0" cellspacing="0" style="font-size: 13px;">
                <tr><td style="padding: 2px 12px 2px 0; color: #92400e; font-weight: 600;">Имя:</td><td style="padding: 2px 0; color: #374151;">${data.customerName}</td></tr>
                <tr><td style="padding: 2px 12px 2px 0; color: #92400e; font-weight: 600;">Телефон:</td><td style="padding: 2px 0; color: #374151;"><a href="tel:${data.customerPhone}" style="color: #1a5632;">${data.customerPhone}</a></td></tr>
                <tr><td style="padding: 2px 12px 2px 0; color: #92400e; font-weight: 600;">Email:</td><td style="padding: 2px 0; color: #374151;"><a href="mailto:${data.customerEmail}" style="color: #1a5632;">${data.customerEmail}</a></td></tr>
              </table>
            </div>

            <!-- Delivery info -->
            <div style="background-color: #dbeafe; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
              <h3 style="margin: 0 0 8px; color: #1e40af; font-size: 14px;">🚚 Доставка</h3>
              <table cellpadding="0" cellspacing="0" style="font-size: 13px;">
                <tr><td style="padding: 2px 12px 2px 0; color: #1e40af; font-weight: 600;">Способ:</td><td style="padding: 2px 0; color: #374151;">${getDeliveryMethodText(data.deliveryMethod)}</td></tr>
                ${data.deliveryAddress ? `<tr><td style="padding: 2px 12px 2px 0; color: #1e40af; font-weight: 600;">Адрес:</td><td style="padding: 2px 0; color: #374151;">${data.deliveryAddress}${data.deliveryCity ? `, ${data.deliveryCity}` : ""}</td></tr>` : ""}
                ${data.deliveryComment ? `<tr><td style="padding: 2px 12px 2px 0; color: #1e40af; font-weight: 600;">Комментарий:</td><td style="padding: 2px 0; color: #374151;">${data.deliveryComment}</td></tr>` : ""}
                <tr><td style="padding: 2px 12px 2px 0; color: #1e40af; font-weight: 600;">Оплата:</td><td style="padding: 2px 0; color: #374151;">${getPaymentMethodText(data.paymentMethod)}</td></tr>
              </table>
            </div>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #374151;">
                  <th style="padding: 8px 10px; text-align: left; font-size: 12px; color: #ffffff;">Товар</th>
                  <th style="padding: 8px 10px; text-align: center; font-size: 12px; color: #ffffff;">Кол-во</th>
                  <th style="padding: 8px 10px; text-align: right; font-size: 12px; color: #ffffff;">Цена</th>
                  <th style="padding: 8px 10px; text-align: right; font-size: 12px; color: #ffffff;">Сумма</th>
                </tr>
              </thead>
              <tbody>${itemsRows}</tbody>
            </table>

            <!-- Totals -->
            <div style="background-color: #dcfce7; border-radius: 8px; padding: 16px; border-left: 4px solid #16a34a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="font-size: 13px; color: #374151;">Подитог:</td><td style="font-size: 13px; color: #374151; text-align: right;">${formatPrice(data.subtotal)}</td></tr>
                <tr><td style="font-size: 13px; color: #374151;">Доставка:</td><td style="font-size: 13px; color: #374151; text-align: right;">${data.deliveryFee > 0 ? formatPrice(data.deliveryFee) : "Бесплатно"}</td></tr>
                <tr><td colspan="2" style="border-top: 1px solid #16a34a; padding-top: 6px;"></td></tr>
                <tr><td style="font-size: 18px; color: #16a34a; font-weight: 700;">ИТОГО:</td><td style="font-size: 18px; color: #16a34a; font-weight: 700; text-align: right;">${formatPrice(data.total)}</td></tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Send order confirmation email to customer
 */
export async function sendCustomerOrderEmail(data: OrderEmailData): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[Mailer] Transporter not configured, skipping customer email");
    return false;
  }

  try {
    await transport.sendMail({
      from: `"Гатчинские закрома" <${ENV.smtpFrom}>`,
      to: data.customerEmail,
      subject: `Заказ ${data.orderNumber} — Гатчинские закрома`,
      html: buildCustomerEmailHtml(data),
    });
    console.log(`[Mailer] Customer email sent to ${data.customerEmail} for order ${data.orderNumber}`);
    return true;
  } catch (error) {
    console.error("[Mailer] Failed to send customer email:", error);
    return false;
  }
}

/**
 * Send order notification email to manager
 */
export async function sendManagerOrderEmail(data: OrderEmailData): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[Mailer] Transporter not configured, skipping manager email");
    return false;
  }

  const managerEmail = ENV.managerEmail;
  if (!managerEmail) {
    console.warn("[Mailer] Manager email not configured");
    return false;
  }

  try {
    await transport.sendMail({
      from: `"Гатчинские закрома" <${ENV.smtpFrom}>`,
      to: managerEmail,
      subject: `🛒 Новый заказ ${data.orderNumber} — ${data.customerName}`,
      html: buildManagerEmailHtml(data),
    });
    console.log(`[Mailer] Manager email sent to ${managerEmail} for order ${data.orderNumber}`);
    return true;
  } catch (error) {
    console.error("[Mailer] Failed to send manager email:", error);
    return false;
  }
}

/**
 * Send both customer and manager emails for an order
 */
export async function sendOrderEmails(data: OrderEmailData): Promise<{ customer: boolean; manager: boolean }> {
  const [customer, manager] = await Promise.all([
    sendCustomerOrderEmail(data),
    sendManagerOrderEmail(data),
  ]);
  return { customer, manager };
}
