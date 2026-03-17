"use client";

import { Search, Shield, Zap } from "lucide-react";

const items = [
  {
    icon: <Search className="h-7 w-7" />,
    title: "Умно търсене",
    desc: "Филтри по стил, ниво, квартал и ценови диапазон — за да намериш точно своя клас.",
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: "Верифицирани студиа",
    desc: "Само проверени пространства с реални снимки и автентични отзиви от общността.",
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: "Резервация за секунди",
    desc: "Избери час, потвърди и готово. Без телефонни обаждания, без изчакване.",
  },
];

export default function ValuePropositions() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Какво получаваш със Zenno?
          </h2>
          <p className="text-muted-foreground text-lg">
            Инструменти, които правят пътя до постелката по-лек и ясен
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {items.map((item, i) => (
            <div
              key={i}
              className="text-center"
            >
              <div className="relative inline-block mb-5">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  {item.icon}
                </div>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
