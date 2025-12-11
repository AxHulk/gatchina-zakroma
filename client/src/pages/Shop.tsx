import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";
import { Package, Users, Truck, Star } from "lucide-react";

const allCategories = [
  "Все категории",
  "Овощи",
  "Фрукты",
  "Грибы",
  "Ягоды",
  "Зелень",
  "Сухофрукты",
  "Орехи",
];

const stats = [
  { icon: Package, value: "500+", label: "Товаров в каталоге" },
  { icon: Users, value: "1000+", label: "Довольных клиентов" },
  { icon: Truck, value: "24ч", label: "Быстрая доставка" },
  { icon: Star, value: "4.9", label: "Рейтинг сервиса" },
];

export default function Shop() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const categoryFromUrl = params.get("category") || "";

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "Все категории");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "name" | undefined>(undefined);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  const { data: products = [], isLoading } = trpc.products.list.useQuery({
    category: selectedCategory === "Все категории" ? undefined : selectedCategory,
    sortBy,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-accent/10 to-secondary py-12 md:py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Интернет-магазин сельхозпродукции
            </h1>
            <p className="text-lg text-muted-foreground">
              Свежие фрукты, овощи, ягоды, грибы напрямую от производителей. 
              Доставляем по всему Санкт-Петербургу и Ленинградской области.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-background border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="py-12">
        <div className="container">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="sm:ml-auto">
              <Select value={sortBy || "default"} onValueChange={(value) => setSortBy(value === "default" ? undefined : value as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">По умолчанию</SelectItem>
                  <SelectItem value="price_asc">Сначала дешевые</SelectItem>
                  <SelectItem value="price_desc">Сначала дорогие</SelectItem>
                  <SelectItem value="name">По названию</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Товары не найдены</h3>
              <p className="text-muted-foreground">
                В выбранной категории пока нет товаров
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-muted-foreground">
                Найдено товаров: {products.length}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-xl mx-auto">
            <ContactForm
              source="shop"
              title="Нужна помощь с выбором?"
              description="Оставьте заявку, и наши менеджеры помогут подобрать продукцию"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
