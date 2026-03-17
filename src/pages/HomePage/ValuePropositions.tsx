"use client";

import { Search, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    icon: <Search className="h-6 w-6" />,
    title: "Умно търсене",
    desc: "Филтри по стил, ниво, квартал и ценови диапазон — за да намериш точно своя клас.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Верифицирани студиа",
    desc: "Само проверени пространства с реални снимки и автентични отзиви от общността.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Резервация за секунди",
    desc: "Избери час, потвърди и готово. Без телефонни обаждания, без изчакване.",
  },
];

export default function ValuePropositions() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="flex gap-4"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {item.icon}
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
