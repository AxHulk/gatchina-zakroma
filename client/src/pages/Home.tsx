import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";
import { ArrowRight, Leaf, Apple, Cherry, Carrot, Salad, Nut } from "lucide-react";

const categories = [
  { name: "Ягоды", icon: Cherry, color: "bg-red-100 text-red-600", filter: "Ягоды" },
  { name: "Овощи", icon: Carrot, color: "bg-orange-100 text-orange-600", filter: "Овощи" },
  { name: "Фрукты", icon: Apple, color: "bg-green-100 text-green-600", filter: "Фрукты" },
  { name: "Грибы", icon: Leaf, color: "bg-amber-100 text-amber-700", filter: "Грибы" },
  { name: "Зелень", icon: Salad, color: "bg-emerald-100 text-emerald-600", filter: "Зелень" },
  { name: "Орехи", icon: Nut, color: "bg-yellow-100 text-yellow-700", filter: "Орехи" },
];

export default function Home() {
  const { data: randomProducts = [], isLoading } = trpc.products.random.useQuery({ limit: 9 });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-accent/10 to-secondary py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Натуральная продукция{" "}
              <span className="text-primary">от 1 кг</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Свежие фрукты, овощи, ягоды, грибы напрямую от производителей.
              Доставляем по всему Санкт-Петербургу и Ленинградской области.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Перейти в магазин
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/buyback">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Сдать продукцию
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDAgQzE1NSAwIDIwMCA0NSAyMDAgMTAwIEMyMDAgMTU1IDE1NSAyMDAgMTAwIDIwMCBDNDUgMjAwIDAgMTU1IDAgMTAwIEMwIDQ1IDQ1IDAgMTAwIDAiIGZpbGw9IiMxNTgwM2QiLz48L3N2Zz4=')] bg-repeat"></div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Виды продукции</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              У нас широкий спектр продукции от сборщиков и производителей из разных уголков страны
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  href={`/shop?category=${encodeURIComponent(category.filter)}`}
                  className="group"
                >
                  <div className={`${category.color} rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:scale-105`}>
                    <Icon className="h-10 w-10 mx-auto mb-3" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Best Offers Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Лучшие предложения</h2>
              <p className="text-muted-foreground">Свежие товары по выгодным ценам</p>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="hidden sm:flex gap-2">
                Все товары
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {randomProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/shop">
              <Button className="gap-2">
                Все товары
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sell Your Products Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Сдай выгодно!</h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8">
              Принимаем всю продукцию от сборщиков и фермеров по Ленинградской области и Санкт-Петербургу
            </p>
            <Link href="/buyback">
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2"
              >
                Узнать подробнее
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Остались вопросы?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Оставьте заявку, и наши менеджеры оперативно свяжутся с вами в рабочее время. 
                Мы поможем подобрать продукцию, расскажем об условиях доставки и ответим на все ваши вопросы.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <span>Заполните форму обратной связи</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <span>Дождитесь звонка менеджера</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <span>Получите свежую продукцию</span>
                </div>
              </div>
            </div>
            <ContactForm 
              source="home" 
              title="Свяжитесь с нами"
              description="Заполните форму, и мы перезвоним вам"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
