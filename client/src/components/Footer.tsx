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
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span className="text-sm text-primary-foreground/60">Принимаем к оплате:</span>
              <div className="flex items-center gap-2 flex-wrap justify-center">
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
                {/* 3D Secure */}
                <div className="bg-white rounded px-2 py-1 flex items-center justify-center" title="3D Secure">
                  <svg viewBox="0 0 70 28" className="h-5 w-auto">
                    {/* Shield outline */}
                    <path d="M35 2 C35 2 22 4 18 6 C18 6 16 14 18 20 C20 24 28 27 35 28 C42 27 50 24 52 20 C54 14 52 6 52 6 C48 4 35 2 35 2Z" fill="none" stroke="#1A3A5C" strokeWidth="1.5"/>
                    <text x="24" y="15" fontSize="9" fontWeight="bold" fill="#1A3A5C">3D</text>
                    <text x="19" y="23" fontSize="6" fontWeight="bold" fill="#1A3A5C">SECURE</text>
                  </svg>
                </div>
                {/* СБП */}
                <div className="bg-white rounded px-2 py-1 flex items-center justify-center" title="Система быстрых платежей">
                  <img src="/sbp-logo.png" alt="СБП" className="h-5 w-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
