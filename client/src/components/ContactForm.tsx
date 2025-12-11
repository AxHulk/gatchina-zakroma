import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

interface ContactFormProps {
  source?: string;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export default function ContactForm({ 
  source = "home", 
  title = "Свяжитесь с нами",
  description = "Оставьте заявку, и наши менеджеры оперативно свяжутся с вами",
  onSuccess
}: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.");
      setName("");
      setEmail("");
      setPhone("");
      setConsent(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Ошибка при отправке заявки. Попробуйте позже.");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consent) {
      toast.error("Необходимо дать согласие на обработку персональных данных");
      return;
    }

    submitMutation.mutate({ name, email, phone, source });
  };

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg border border-border">
      {title && <h3 className="text-xl md:text-2xl font-bold mb-2">{title}</h3>}
      {description && <p className="text-muted-foreground mb-6">{description}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor={`name-${source}`}>Имя</Label>
          <Input
            id={`name-${source}`}
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`email-${source}`}>E-mail</Label>
          <Input
            id={`email-${source}`}
            type="email"
            placeholder="example@mail.ru"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`phone-${source}`}>Телефон</Label>
          <Input
            id={`phone-${source}`}
            type="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id={`consent-${source}`}
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked === true)}
          />
          <Label htmlFor={`consent-${source}`} className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
            Отправляя форму, вы даёте согласие на обработку{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              персональных данных
            </Link>
          </Label>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Отправка...
            </>
          ) : (
            "Отправить заявку"
          )}
        </Button>
      </form>
    </div>
  );
}
