import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Shield, Truck, Leaf, Ban, Check, Clock, Package, MapPin } from "lucide-react";

const whatWeDo = [
  {
    icon: Users,
    title: "Объединяем",
    description: "фермеров, сборщиков и конечных потребителей",
  },
  {
    icon: Shield,
    title: "Контролируем",
    description: "качество. От методов производства до потребительских свойств продукции.",
  },
  {
    icon: Truck,
    title: "Доставляем",
    description: "свежие, настоящие продукты потребителям.",
  },
];

const noList = [
  "Без пестицидов",
  "Без гормонов роста и антибиотиков",
  "Без обработки газами и другими химикатами",
  "Без использования минеральных удобрений",
  "Без усилителей вкуса и заменителей ароматов",
  "Без искусственных красителей и консервантов",
];

const whatToKnow = [
  {
    icon: Clock,
    title: "Ограниченное количество",
    description: "Все наши поставщики производят настоящие продукты, но почти всегда в ограниченном количестве. Поэтому уже к середине недели у нас на сайте могут закончится некоторые товары.",
  },
  {
    icon: MapPin,
    title: "Наши поставщики",
    description: "Мы ищем и находим новых производителей, у нас есть сразу несколько поставщиков по каждой категории.",
  },
  {
    icon: Package,
    title: "Всегда свежие продукты",
    description: "Речь не о тысячах товаров, а о десятках, иногда — единицах. Когда весь товар раскупают на сайте, он пропадает из ассортимента. Как говорится, кто успел, тот и съел!",
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-accent/10 to-secondary py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Гатчинские закрома
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Это заботливый сервис доставки настоящих продуктов. Наши производители — это небольшие фермы, семейные хозяйства, деревенские артели.
            </p>
          </div>
        </div>
      </section>

      {/* Sell Your Products CTA */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Сдавай выгодно!</h2>
              <p className="text-primary-foreground/90">
                Принимаем всю продукцию от сборщиков и фермеров по Ленинградской области и Санкт-Петербургу
              </p>
            </div>
            <Link href="/buyback">
              <Button variant="secondary" size="lg" className="gap-2 shrink-0">
                Узнать подробнее
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Что мы делаем</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {whatWeDo.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="text-center">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">География поставщиков</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Мы сотрудничаем с малыми и средними фермерскими хозяйствами из Питера, Ленинградской, Тверской, Тульской, Липецкой и Московской областей, Алтая, Краснодарского края.
            </p>
          </div>
        </div>
      </section>

      {/* Real Products */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Что такое настоящие продукты?
              </h2>
              <p className="text-muted-foreground mb-6">
                Наши поставщики придерживаются методов органического земледелия и натурального растениеводства
              </p>
              <div className="space-y-3">
                {noList.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Ban className="h-3 w-3 text-primary" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/20 rounded-2xl p-8">
              <Leaf className="h-16 w-16 text-primary mb-6" />
              <p className="text-lg leading-relaxed">
                Мы лично посещаем каждое хозяйство, проверяем сертификаты на продукцию, условия, технологию производства продукции, а также согласуем стандарты качества. Вся продукция регулярно и тщательно проверяется в лабораториях.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Know */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Что ещё нужно знать?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {whatToKnow.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardContent className="pt-6">
                    <Icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Готовы попробовать?</h2>
            <p className="text-muted-foreground mb-8">
              Загляните в наш магазин и закажите свежие продукты с доставкой
            </p>
            <Link href="/shop">
              <Button size="lg" className="gap-2">
                Перейти в магазин
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
