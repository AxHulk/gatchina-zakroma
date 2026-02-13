import { Link } from "wouter";

const PAYMENT_LOGOS = {
  mir: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663104002998/wLErFXcySHwWeBFY.png",
  visa: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663104002998/QrKjnqaEzoKvIYWo.png",
  mastercard: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663104002998/yukXzlrdLYYAHIHg.png",
  secure3d: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663104002998/KMZQUSwKFzSyjBxy.png",
  sbp: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663104002998/CPUUrPuHQlxmnKBi.png",
};

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img 
                src="/logo-footer.png" 
                alt="Гатчинские закрома" 
                className="h-16 w-auto"
              />
              <span className="text-xl font-bold leading-tight">Гатчинские<br/>закрома</span>
            </Link>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Доставка и выкуп натуральной сельхозпродукции по всему Санкт-Петербургу и Ленинградской области.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Магазин
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Доставка
                </Link>
              </li>
              <li>
                <Link href="/buyback" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Сдача продукции
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Документы</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/offer" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Публичная оферта
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Условия возврата
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-4">Контакты</h3>
            <div className="text-sm text-primary-foreground/80 space-y-2">
              <p>ИП Шевцов Антон Александрович</p>
              <p>ИНН 471905083025</p>
              <p>ОГРНИП 325470400045670</p>
              <p className="leading-relaxed">
                188340, Ленинградская область, р-н Гатчинский, деревня Истинка, д. 42
              </p>
            </div>
          </div>
        </div>

        {/* Payment Systems */}
        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Гатчинские закрома. Все права защищены.
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
                <div className="bg-white rounded-md px-2.5 py-1.5 flex items-center justify-center" title="МИР">
                  <img src={PAYMENT_LOGOS.mir} alt="МИР" className="h-6 w-auto object-contain" loading="lazy" />
                </div>
                <div className="bg-white rounded-md px-2.5 py-1.5 flex items-center justify-center" title="Visa">
                  <img src={PAYMENT_LOGOS.visa} alt="Visa" className="h-6 w-auto object-contain" loading="lazy" />
                </div>
                <div className="bg-white rounded-md px-2.5 py-1.5 flex items-center justify-center" title="MasterCard">
                  <img src={PAYMENT_LOGOS.mastercard} alt="MasterCard" className="h-6 w-auto object-contain" loading="lazy" />
                </div>
                <div className="bg-white rounded-md px-2.5 py-1.5 flex items-center justify-center" title="3D Secure">
                  <img src={PAYMENT_LOGOS.secure3d} alt="3D Secure" className="h-6 w-auto object-contain" loading="lazy" />
                </div>
                <div className="bg-white rounded-md px-2.5 py-1.5 flex items-center justify-center" title="Система быстрых платежей">
                  <img src={PAYMENT_LOGOS.sbp} alt="СБП" className="h-6 w-auto object-contain" loading="lazy" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
