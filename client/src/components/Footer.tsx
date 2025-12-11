import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <img 
                src="/logo.png" 
                alt="Гатчинские закрома" 
                className="h-16 w-auto brightness-0 invert"
              />
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
            <div className="flex items-center gap-4">
              <span className="text-sm text-primary-foreground/60">Принимаем к оплате:</span>
              <div className="flex items-center gap-2">
                {/* Mir */}
                <div className="bg-white rounded px-2 py-1">
                  <svg viewBox="0 0 60 20" className="h-5 w-auto">
                    <text x="5" y="15" fontSize="12" fontWeight="bold" fill="#4DB45E">МИР</text>
                  </svg>
                </div>
                {/* Visa */}
                <div className="bg-white rounded px-2 py-1">
                  <svg viewBox="0 0 60 20" className="h-5 w-auto">
                    <text x="5" y="15" fontSize="12" fontWeight="bold" fill="#1A1F71">VISA</text>
                  </svg>
                </div>
                {/* MasterCard */}
                <div className="bg-white rounded px-2 py-1">
                  <svg viewBox="0 0 80 20" className="h-5 w-auto">
                    <circle cx="15" cy="10" r="8" fill="#EB001B"/>
                    <circle cx="25" cy="10" r="8" fill="#F79E1B"/>
                    <text x="38" y="14" fontSize="8" fontWeight="bold" fill="#000">MC</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
