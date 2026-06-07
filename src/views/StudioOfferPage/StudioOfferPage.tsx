"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Calendar,
  CalendarDays,
  Globe,
  MapPin,
  Megaphone,
  PhoneOff,
  Star,
  UserPlus,
  Users,
  X,
  Check,
} from "lucide-react";

import { StudioOfferScrollScope } from "@/views/StudioOfferPage/StudioOfferScrollScope";
import { AddStudioCtaButton } from "@/components/home/add-studio-cta-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { BusinessOfferDto } from "@/lib/business-platform-billing";
import { cn } from "@/lib/utils";
import { StudioOfferDashboardPreview } from "@/views/StudioOfferPage/StudioOfferDashboardPreview";
import {
  STUDIO_OFFER_STICKY_OFFSET_CLASS,
  StudioOfferStickyCta,
} from "@/views/StudioOfferPage/StudioOfferStickyCta";

export type StudioOfferStats = {
  studioCount: number;
  classCount: number;
  totalEnrolled: number;
  avgRating: string;
};

const REGISTER_HREF = "/auth?type=register&role=business&next=%2Fdashboard";
const FINAL_SECTION_ID = "studio-offer-final-cta";

const benefits = [
  {
    icon: Calendar,
    title: "Разписание и записвания",
    outcome: "Клиентите се записват онлайн",
    desc: "Публикувате график в приложението - практикуващите резервират място без обаждания и съобщения.",
    featured: false,
  },
  {
    icon: Megaphone,
    title: "Без рекламен бюджет за клиенти",
    outcome: "Zenno привлича практикуващи вместо вас",
    desc: "Покриваме рекламата към потребителите. Не плащате излишни пари, за да попълвате класовете си.",
    featured: true,
  },
  {
    icon: MapPin,
    title: "Откриваемост",
    outcome: "Намират ви по локация и MultiSport",
    desc: "Филтри за най-близкото студио и опция за MultiSport - хората знаят всички места, където приемат карта.",
    featured: false,
  },
  {
    icon: Globe,
    title: "Без собствен сайт",
    outcome: "Готов профил без хостинг",
    desc: "Не ви трябва сайт, хостинг или програмист. Профилът ви е в платформата - ние го поддържаме вместо вас.",
    featured: false,
  },
  {
    icon: PhoneOff,
    title: "По-малко обаждания",
    outcome: "Графикът е видим 24/7",
    desc: "Хората виждат графика и събитията сами. Не сте постоянно на телефона за едни и същи въпроси.",
    featured: false,
  },
];

const steps = [
  {
    step: "1",
    icon: UserPlus,
    title: "Създайте акаунт",
    desc: "Регистрирайте се като бизнес - отнема секунди с имейл или Google.",
  },
  {
    step: "2",
    icon: Building2,
    title: "Добавете студиото",
    desc: "Въведете адрес, снимки и описание - профилът ви става видим за практикуващи.",
  },
  {
    step: "3",
    icon: Users,
    title: "Добавете инструктори",
    desc: "Свържете инструкторите със студиото, за да могат да водят класове.",
  },
  {
    step: "4",
    icon: CalendarDays,
    title: "Публикувайте график",
    desc: "Задайте разписание и класове - практикуващите вече могат да се записват онлайн.",
  },
];

const comparison = {
  without: [
    "Сайт, хостинг и програмист",
    "Реклама за клиенти от вас",
    "Обаждания за график и записвания",
    "Ръчно управление на резервации",
  ],
  with: [
    "Готов профил в платформата",
    "Zenno покрива потребителската реклама",
    "Онлайн записвания 24/7",
    "Табло за студио, инструктори и класове",
  ],
};

const faqItems = [
  {
    q: "Колко струва?",
    a: "Първите партньорски студиа получават пробен период, след което месечна абонаментна такса. Цената се показва актуално на тази страница - без скрити такси за записвания от практикуващи.",
  },
  {
    q: "Нужен ли ми е собствен сайт?",
    a: "Не. Профилът ви в Zenno заменя нуждата от отделен сайт, хостинг и поддръжка от програмист.",
  },
  {
    q: "Колко време отнема настройката?",
    a: "Регистрацията отнема минути. След това добавяте студио, инструктори и график - onboarding списъкът в таблото ви води стъпка по стъпка.",
  },
];

export function StudioOfferPage({
  offer,
  stats,
}: {
  offer: BusinessOfferDto;
  stats: StudioOfferStats;
}) {
  const [mobileStickyVisible, setMobileStickyVisible] = useState(false);
  const fmt = (n: number) => n.toLocaleString("bg-BG");

  const heroStats: {
    value: string;
    label: string;
    showStar?: boolean;
  }[] = [
      { value: `${stats.studioCount}+`, label: "Партньорски студиа" },
      { value: `${stats.classCount}+`, label: "Предстоящи класове" },
      { value: `${fmt(stats.totalEnrolled)}+`, label: "Записани места" },
      { value: stats.avgRating, label: "Средна оценка", showStar: true },
    ];

  return (
    <>
      <StudioOfferScrollScope
        className={cn(
          "font-body bg-yoga-bg",
          mobileStickyVisible && STUDIO_OFFER_STICKY_OFFSET_CLASS,
        )}
      >
        <section
          data-offer-hero
          className="relative overflow-hidden border-b border-border py-16 md:py-24"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-yoga-bg to-sage/10" />
          <div className="container relative mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="offer-hero-intro">
                <p className="offer-animate mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
                  За йога студиа
                </p>
                <h1 className="offer-animate font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                  Управлявайте студиото си без излишни разходи
                </h1>
                <p className="offer-animate mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Zenno свързва практикуващи с йога студиа. Достигнете до нови клиенти,
                  управлявайте разписание и записвания - всичко от едно табло.
                </p>
                <div className="offer-animate mt-8">
                  <AddStudioCtaButton
                    next="/dashboard"
                    size="lg"
                    className="rounded-xl border-0 bg-yoga-accent px-8 py-6 text-base text-white shadow-md shadow-yoga-accent/25 hover:bg-yoga-accent/90"
                  >
                    Започнете безплатно <ArrowRight className="ml-2 h-5 w-5" />
                  </AddStudioCtaButton>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="offer-hero-stat rounded-xl border border-border bg-card/80 p-3 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-1 font-display text-xl font-bold text-foreground">
                        {stat.showStar ? (
                          <Star className="h-4 w-4 fill-yoga-warm text-yoga-warm" />
                        ) : null}
                        {stat.value}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="offer-hero-preview">
                <StudioOfferDashboardPreview />
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Така изглежда таблото ви - разписание, записвания и onboarding на едно място
                </p>
              </div>
            </div>
          </div>
        </section>

        <section data-offer-section className="border-b border-border py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="offer-section-head mb-10 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Преди и след Zenno
              </h2>
              <p className="mt-2 text-muted-foreground">
                Какво променяме за собствениците на студиа
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2 md:gap-6">
              <div className="offer-animate rounded-2xl border border-border bg-muted/30 p-6">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-muted-foreground">
                  <X className="h-5 w-5 text-destructive/70" />
                  Без Zenno
                </h3>
                <ul className="space-y-3">
                  {comparison.without.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="offer-animate rounded-2xl border border-primary/25 bg-primary/5 p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <Check className="h-5 w-5 text-primary" />
                  С Zenno
                </h3>
                <ul className="space-y-3">
                  {comparison.with.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-foreground/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section data-offer-section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="offer-section-head mb-8 text-center md:mb-10">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Защо студиата избират Zenno
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Всичко, от което се нуждаете - без допълнителни инструменти и разходи
              </p>
            </div>
            <div className="mx-auto max-w-6xl space-y-4">
              {benefits
                .filter((item) => item.featured)
                .map((item) => (
                  <div
                    key={item.title}
                    className="offer-animate flex flex-col gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-sage/10 p-5 shadow-sm sm:flex-row sm:items-center sm:gap-5 md:p-6"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold text-foreground md:text-xl">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-primary">{item.outcome}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {benefits
                  .filter((item) => !item.featured)
                  .map((item) => (
                    <div
                      key={item.title}
                      className="offer-animate flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
                    >
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-base font-semibold leading-snug text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs font-medium text-primary">{item.outcome}</p>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        <section data-offer-section className="border-y border-border bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="offer-section-head mb-14 text-center">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Как да започнете
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">Четири стъпки - толкова е лесно</p>
            </div>

            <div className="relative mx-auto max-w-5xl">
              <div
                className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-primary/20 md:left-[12.5%] md:top-12 md:block md:h-0.5 md:w-[75%] md:-translate-y-1/2"
                aria-hidden
              />
              <div className="grid gap-8 md:grid-cols-4 md:gap-4">
                {steps.map((item) => (
                  <div key={item.step} className="offer-animate relative flex gap-4 md:block md:text-center">
                    <div className="relative z-10 shrink-0 md:mx-auto md:mb-5 md:inline-block">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-card text-primary shadow-sm md:h-20 md:w-20">
                        <item.icon className="h-5 w-5 md:h-7 md:w-7" />
                      </div>
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground md:-right-2 md:-top-2 md:h-7 md:w-7">
                        {item.step}
                      </span>
                    </div>
                    <div className="min-w-0 pt-0.5 md:pt-0">
                      <h3 className="font-display text-base font-semibold text-foreground md:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="offer-animate mx-auto mt-12 max-w-2xl text-center text-muted-foreground">
              След регистрация получавате{" "}
              <span className="font-medium text-foreground">„Ръководство за настройка“</span> в
              таблото - onboarding списък, който ви води стъпка по стъпка до първия записан клас.
            </p>
          </div>
        </section>

        <section data-offer-section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-sage/15 px-6 py-10 text-center md:px-12 md:py-14">
              <p className="offer-animate text-sm font-semibold uppercase tracking-wide text-primary">
                Специална оферта
              </p>
              {offer.slotsRemaining > 0 ? (
                <>
                  <div className="offer-animate mt-4 font-display text-6xl font-bold text-foreground md:text-7xl">
                    {offer.slotsRemaining}
                  </div>
                  <p className="offer-animate mt-2 text-lg font-medium text-foreground">
                    безплатни места за студиа
                  </p>
                  <p className="offer-animate mt-3 text-muted-foreground">
                    {offer.trialDays} дни пробен период · след това {offer.monthlyPriceEur} €/месец
                  </p>
                </>
              ) : (
                <>
                  <h2 className="offer-animate mt-4 font-display text-2xl font-bold text-foreground md:text-3xl">
                    Присъединете се към Zenno
                  </h2>
                  <p className="offer-animate mt-3 text-lg text-muted-foreground">
                    {offer.monthlyPriceEur} €/месец · без пробен период
                  </p>
                </>
              )}
              <div className="offer-animate mt-8">
                <AddStudioCtaButton next="/dashboard" size="lg" className="rounded-xl px-8 py-6 text-base">
                  Създайте акаунт <ArrowRight className="ml-2 h-5 w-5" />
                </AddStudioCtaButton>
              </div>
            </div>
          </div>
        </section>

        <section data-offer-section className="border-t border-border bg-background py-16">
          <div className="container mx-auto max-w-2xl px-4">
            <div className="offer-section-head mb-8 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Често задавани въпроси
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => (
                <AccordionItem key={item.q} value={`faq-${i}`} className="offer-animate">
                  <AccordionTrigger className="text-left font-medium">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section
          id={FINAL_SECTION_ID}
          data-offer-section
          className="border-t border-border bg-gradient-to-r from-primary/10 via-primary/5 to-sage/15 py-16"
        >
          <div className="container mx-auto px-4">
            <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 md:flex-row">
              <div className="offer-animate text-center md:text-left">
                <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  Готови ли сте да започнете?
                </h2>
                <p className="mt-2 max-w-md text-muted-foreground">
                  Създайте бизнес акаунт, добавете студиото, инструкторите и графиците - за около 2
                  минути.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Можете да създадете акаунт от{" "}
                  <Link
                    href={REGISTER_HREF}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    тук
                  </Link>
                  .
                </p>
              </div>
              <div className="offer-animate shrink-0">
                <AddStudioCtaButton next="/dashboard" size="lg" className="rounded-xl px-8 py-6 text-base">
                  Създайте акаунт за 2 минути <ArrowRight className="ml-2 h-5 w-5" />
                </AddStudioCtaButton>
              </div>
            </div>
          </div>
        </section>
      </StudioOfferScrollScope>

      <StudioOfferStickyCta
        trialDays={offer.trialDays}
        finalSectionId={FINAL_SECTION_ID}
        onVisibleChange={setMobileStickyVisible}
      />
    </>
  );
}
