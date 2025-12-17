import { Card, CardContent } from "@/components/ui/card";
import ContactForm from "@/components/ContactForm";
import { Wallet, Shield, Eye, CheckCircle2, Clock, MapPin, Phone } from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Цена",
    description: "Платим максимальную цену от производителя на карту сборщику без комиссии.",
  },
  {
    icon: Shield,
    title: "Законность",
    description: "Никаких блокировок карт, доход сборщика налогами не облагается.",
  },
  {
    icon: Eye,
    title: "Прозрачность",
    description: "Никаких перекупщиков и полный контроль приёмщиков. Ассортимент и цены назначает руководство компании.",
  },
];

const acceptanceRequirements = [
  {
    title: "Качество продукции",
    items: [
      "Свежие, здоровые, целые плоды без повреждений",
      "Чистые, без песка, земли и лесного мусора",
      "Без червоточин и гнили",
      "Разобранные по видам и сортам",
    ],
  },
  {
    title: "Условия приема",
    items: [
      "Принимаем в любых количествах — от 1 кг",
      "Оплата наличными сразу после взвешивания",
      "Возможен перевод на карту без комиссии",
      "Прием ведется в рабочие дни с 9:00 до 18:00",
    ],
  },
  {
    title: "Что принимаем",
    items: [
      "Лесные ягоды: брусника, клюква, черника, морошка",
      "Садовые ягоды: клубника, малина, смородина",
      "Грибы: белые, лисички, подберезовики, опята",
      "Овощи и зелень с собственных участков",
    ],
  },
];

export default function Buyback() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-accent/10 to-secondary py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Сдать продукцию
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4">
              <strong>Гатчинские закрома</strong> — один из крупнейших операторов на российском рынке свежих овощей, фруктов, ягод и грибов, а также свежезамороженных ягод, грибов и продуктов их глубокой переработки.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Гатчинские закрома закупают фрукты, овощи, ягоды и грибы от населения по максимальной цене!
            </p>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container">
          <p className="text-center text-lg">
            Сдать ягоды и грибы по максимальной цене можно на любом пункте приёма компании "Гатчинские закрома", а также обратившись к региональным представителям компании.
          </p>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Как это работает</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Собирайте ягоды и грибы в экологически чистых местах, приносите к нам на пункт приема, 
            и получайте оплату сразу после взвешивания
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="overflow-hidden rounded-xl shadow-lg">
              <img 
                src="/berries1.jpg" 
                alt="Сбор брусники в ведро" 
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-xl shadow-lg">
              <img 
                src="/berries2.jpg" 
                alt="Свежая брусника в руке" 
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-xl shadow-lg">
              <img 
                src="/berries3.jpg" 
                alt="Брусника в деревянном ящике" 
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="overflow-hidden rounded-xl shadow-lg">
              <img 
                src="/berries4.jpg" 
                alt="Черника в ведрах" 
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Требования к продукции</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {acceptanceRequirements.map((section) => (
              <Card key={section.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 text-primary">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Наши преимущества</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Как с нами связаться</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Телефон</h3>
                  <a href="tel:+78129894828" className="text-primary hover:underline">
                    +7 812 98 94 828
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Время работы</h3>
                  <p className="text-muted-foreground">Пн-Пт: 9:00 - 18:00</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Адрес</h3>
                  <p className="text-muted-foreground">г. Гатчина</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                У вас есть вопросы или вы хотите сдать свой продукт?
              </h2>
              <p className="text-muted-foreground">
                Заполните форму ниже, и наши менеджеры оперативно свяжутся с вами в рабочее время.
              </p>
            </div>
            <ContactForm
              source="buyback"
              title="Оставить заявку"
              description="Мы свяжемся с вами для обсуждения условий сотрудничества"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
