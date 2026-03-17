"use client";

import { Eye, Heart, Users } from "lucide-react";

const steps = [
  {
    icon: <Eye className="h-7 w-7" />,
    title: "Разгледай",
    desc: "Преглеждай студиа по стил йога, квартал, ценови клас и ниво — всичко на едно място.",
    step: "1",
  },
  {
    icon: <Heart className="h-7 w-7" />,
    title: "Сравни и избери",
    desc: "Прочети отзиви, разгледай снимки и запази любимите си студиа за по-лесен достъп.",
    step: "2",
  },
  {
    icon: <Users className="h-7 w-7" />,
    title: "Запиши се",
    desc: "Резервирай място онлайн и просто се появи на практика — толкова е лесно.",
    step: "3",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Как да започнеш?</h2>
          <p className="text-muted-foreground text-lg">От търсене до постелка — само три стъпки</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={i}
              className="text-center relative"
            >
              <div className="relative inline-block mb-5">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  {step.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step.step}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
