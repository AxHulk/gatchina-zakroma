import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Building, CreditCard } from "lucide-react";

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function Contacts() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Yandex Maps API
    const script = document.createElement("script");
    script.src = "https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU";
    script.async = true;
    
    script.onload = () => {
      window.ymaps.ready(() => {
        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
            center: [59.644332, 30.048709],
            zoom: 14,
            controls: ["zoomControl", "fullscreenControl"],
          });

          const placemark = new window.ymaps.Placemark(
            [59.644332, 30.048709],
            {
              balloonContent: "Гатчинские закрома<br>д. Истинка, д. 42",
              hintContent: "Гатчинские закрома",
            },
            {
              preset: "islands#greenDotIcon",
            }
          );

          mapInstanceRef.current.geoObjects.add(placemark);
        }
      });
    };

    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      script.remove();
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-accent/10 to-secondary py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Контакты
          </h1>
          <p className="text-lg text-muted-foreground">
            Свяжитесь с нами любым удобным способом
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Реквизиты компании</h3>
                      <div className="space-y-1 text-muted-foreground">
                        <p><strong className="text-foreground">ИП Шевцов Антон Александрович</strong></p>
                        <p>ИНН: 471905083025</p>
                        <p>ОГРНИП: 325470400045670</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Телефон</h3>
                      <a 
                        href="tel:+78129894828" 
                        className="text-primary hover:underline text-lg font-medium"
                      >
                        +7 812 98 94 828
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Email</h3>
                      <a 
                        href="mailto:info@gzakroma.ru" 
                        className="text-primary hover:underline"
                      >
                        info@gzakroma.ru
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Адрес</h3>
                      <p className="text-muted-foreground">
                        188340, Ленинградская область, р-н Гатчинский, деревня Истинка, д. 42
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Банковские реквизиты</h3>
                      <div className="space-y-1 text-muted-foreground text-sm">
                        <p><strong className="text-foreground">Номер счёта:</strong> 40802810332180011276</p>
                        <p><strong className="text-foreground">Банк:</strong> ФИЛИАЛ "САНКТ-ПЕТЕРБУРГСКИЙ" АО "АЛЬФА-БАНК"</p>
                        <p><strong className="text-foreground">БИК:</strong> 044030786</p>
                        <p><strong className="text-foreground">Корр. счёт:</strong> 30101810600000000786</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="overflow-hidden">
                <div 
                  ref={mapRef} 
                  className="w-full h-[400px] lg:h-[600px]"
                  style={{ background: "#f0f0f0" }}
                />
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
