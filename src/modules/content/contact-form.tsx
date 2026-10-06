"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LABELS } from "@/config/constants";
import { toast } from "sonner";

const contactSchema = z.object({
  ad: z.string().min(2),
  email: z.string().email(),
  konu: z.string().min(3),
  mesaj: z.string().min(10),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async () => {
    toast.success("Mesajınız alındı. En kısa sürede dönüş yapacağız.");
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{LABELS.sendMessage}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input {...register("ad")} />
            </div>
            <div className="space-y-2">
              <Label>{LABELS.email}</Label>
              <Input type="email" {...register("email")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{LABELS.subject}</Label>
            <Input {...register("konu")} />
          </div>
          <div className="space-y-2">
            <Label>{LABELS.message}</Label>
            <Textarea {...register("mesaj")} rows={5} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {LABELS.sendMessage}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
