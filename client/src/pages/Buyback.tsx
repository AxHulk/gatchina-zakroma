import { Card, CardContent } from "@/components/ui/card";
import ContactForm from "@/components/ContactForm";
import { Wallet, Shield, Eye } from "lucide-react";

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
              <strong>Гатчинская застава</strong> — один из крупнейших операторов на российском рынке свежих овощей, фруктов, ягод и грибов, а также свежезамороженные ягоды, грибы и продукты их глубокой переработки.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Гатчинская застава закупает фрукты, овощи, ягоды и грибы от населения по максимальной цене!
            </p>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container">
          <p className="text-center text-lg">
            Сдать ягоды и грибы по максимальной цене можно на любом пункте приёма компании "Гатчинская застава", а также обратившись к региональным представителям компании.
          </p>
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

      {/* Contact Form Section */}
      <section className="py-16 bg-muted/30">
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
