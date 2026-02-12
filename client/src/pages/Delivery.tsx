import { Link } from "wouter";
import { Truck, Clock, MapPin, Package, Leaf, ShieldCheck, Phone, ChevronRight } from "lucide-react";

export default function Delivery() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-green-50 to-amber-50 py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Truck className="w-4 h-4" />
              Доставка натуральных продуктов
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Свежие продукты — <br className="hidden md:block" />
              <span className="text-primary">прямо к вашему столу</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Мы доставляем натуральные фермерские продукты по Гатчине, Гатчинскому району, 
              Санкт-Петербургу и Ленинградской области. Бережная доставка с сохранением свежести и качества.
            </p>
          </div>
        </div>
      </section>

      {/* Delivery Zones */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Зоны и стоимость доставки</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Zone 1 */}
            <div className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Популярная
              </div>
              <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Гатчина и район</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Гатчина, Коммунар, Вырица, Сиверский, Тайцы и другие населённые пункты Гатчинского района
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm">Доставка: <strong>от 200 ₽</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm">Бесплатно от <strong>3 000 ₽</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm">Срок: <strong>1-2 дня</strong></span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Минимальная сумма заказа — 500 ₽
              </p>
            </div>

            {/* Zone 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Санкт-Петербург</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Все районы Санкт-Петербурга, включая Пушкин, Павловск, Колпино, Петергоф, Кронштадт
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-sm">Доставка: <strong>от 350 ₽</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-sm">Бесплатно от <strong>5 000 ₽</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-sm">Срок: <strong>1-3 дня</strong></span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Минимальная сумма заказа — 1 000 ₽
              </p>
            </div>

            {/* Zone 3 */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ленинградская область</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Тосно, Любань, Луга, Волосово, Кингисепп и другие населённые пункты Ленинградской области
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-sm">Доставка: <strong>от 500 ₽</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-sm">Бесплатно от <strong>7 000 ₽</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-sm">Срок: <strong>2-4 дня</strong></span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Минимальная сумма заказа — 1 500 ₽
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Как мы доставляем</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Простой и удобный процесс от оформления заказа до получения свежих продуктов
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Оформите заказ",
                description: "Выберите товары в нашем магазине и оформите заказ онлайн или по телефону",
                icon: Package,
              },
              {
                step: "02",
                title: "Подтверждение",
                description: "Мы свяжемся с вами для подтверждения заказа и уточнения деталей доставки",
                icon: Phone,
              },
              {
                step: "03",
                title: "Бережная сборка",
                description: "Тщательно отбираем и упаковываем продукты, сохраняя их свежесть и качество",
                icon: Leaf,
              },
              {
                step: "04",
                title: "Доставка",
                description: "Курьер доставит заказ в удобное для вас время по указанному адресу",
                icon: Truck,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">ШАГ {item.step}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Details */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Подробные условия</h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Packaging */}
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Упаковка и хранение</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Все продукты упаковываются в экологичную тару, обеспечивающую сохранность при транспортировке</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Скоропортящиеся товары (ягоды, грибы, зелень) доставляются в термоупаковке с хладоэлементами</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Хрупкие товары (яйца, стеклянная тара) дополнительно защищаются от повреждений</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Мы используем только пищевые материалы для упаковки</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Время доставки</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>Доставка осуществляется ежедневно с <strong>9:00 до 21:00</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>При оформлении заказа вы можете выбрать удобный временной интервал (утро, день, вечер)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>Заказы, оформленные до 14:00, могут быть доставлены в тот же день (по Гатчине)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>Курьер предварительно позвонит за 30-60 минут до прибытия</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Оплата</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <span><strong>Онлайн-оплата</strong> — банковские карты МИР, Visa, MasterCard (защита 3D Secure)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <span><strong>СБП</strong> — Система быстрых платежей (мгновенный перевод)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <span><strong>Наличные</strong> — оплата курьеру при получении</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <span><strong>Безналичный расчёт</strong> — для юридических лиц (по счёту)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quality Guarantee */}
            <div className="bg-purple-50 rounded-2xl p-8 border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Leaf className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Гарантия качества</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                      <span>При получении вы можете осмотреть товар и убедиться в его качестве</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                      <span>Если товар не соответствует заявленному качеству — мы заменим его или вернём деньги</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                      <span>Все продукты проходят контроль качества перед отправкой</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                      <span>Подробнее об условиях возврата — на странице <Link href="/returns" className="text-primary underline hover:no-underline">Условия возврата</Link></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Self-pickup */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Самовывоз</h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Вы также можете забрать заказ самостоятельно по адресу нашего склада. 
                    Самовывоз — <strong>бесплатно</strong>, без минимальной суммы заказа.
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>188340, Ленинградская область, Гатчинский район, деревня Истинка, д. 42</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Ежедневно с 9:00 до 20:00</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>
                        <a href="tel:+79313389498" className="text-primary hover:underline">+7 (931) 338-94-98</a>
                        {" "}— предварительно позвоните для уточнения наличия
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Часто задаваемые вопросы</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Можно ли заказать доставку на конкретное время?",
                a: "Да, при оформлении заказа вы можете указать предпочтительный временной интервал. Курьер позвонит за 30-60 минут до прибытия для уточнения.",
              },
              {
                q: "Что делать, если товар пришёл повреждённым?",
                a: "Свяжитесь с нами по телефону +7 (931) 338-94-98 или напишите на почту. Мы заменим товар или вернём деньги в течение 3 рабочих дней.",
              },
              {
                q: "Доставляете ли вы в выходные и праздничные дни?",
                a: "Да, мы доставляем заказы ежедневно, включая выходные и праздничные дни. Время доставки: с 9:00 до 21:00.",
              },
              {
                q: "Есть ли доставка за пределы Ленинградской области?",
                a: "На данный момент мы доставляем по Гатчине, Санкт-Петербургу и Ленинградской области. Для доставки в другие регионы свяжитесь с нами для обсуждения условий.",
              },
              {
                q: "Как хранятся продукты при доставке?",
                a: "Скоропортящиеся продукты доставляются в термоупаковке с хладоэлементами. Мы гарантируем сохранение температурного режима на протяжении всей доставки.",
              },
              {
                q: "Можно ли изменить или отменить заказ?",
                a: "Да, вы можете изменить или отменить заказ, связавшись с нами по телефону до момента передачи заказа курьеру.",
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-muted/30 rounded-xl border">
                <summary className="flex items-center justify-between cursor-pointer p-5 font-medium hover:bg-muted/50 rounded-xl transition-colors">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Готовы заказать?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Выберите свежие натуральные продукты в нашем магазине и мы доставим их прямо к вашему столу
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold px-8 py-3 rounded-xl hover:bg-white/90 transition-colors"
            >
              <Package className="w-5 h-5" />
              Перейти в магазин
            </Link>
            <a
              href="tel:+79313389498"
              className="inline-flex items-center justify-center gap-2 border-2 border-primary-foreground/30 text-primary-foreground font-semibold px-8 py-3 rounded-xl hover:bg-primary-foreground/10 transition-colors"
            >
              <Phone className="w-5 h-5" />
              +7 (931) 338-94-98
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
