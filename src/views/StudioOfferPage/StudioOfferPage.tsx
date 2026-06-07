"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Globe,
  ListChecks,
  MapPin,
  Megaphone,
  PhoneOff,
} from "lucide-react";

import { AddStudioCtaButton } from "@/components/home/add-studio-cta-button";
import type { BusinessOfferDto } from "@/lib/business-platform-billing";

const benefits = [
  {
    icon: Calendar,
    title: "Разписание и записвания",
    desc: "Публикувате график в приложението - практикуващите се записват лесно онлайн, без обаждания и съобщения.",
  },
  {
    icon: Megaphone,
    title: "Без рекламен бюджет за клиенти",
    desc: "Zenno покрива рекламата към потребителите. Не плащате излишни пари, за да привличате практикуващи.",
  },
  {
    icon: MapPin,
    title: "Откриваемост",
    desc: "Филтри за най-близкото студио и опция за MultiSport - хората знаят всички места, където приемат карта.",
  },
  {
    icon: Globe,
    title: "Без собствен сайт",
    desc: "Не ви трябва сайт, хостинг или програмист. Профилът ви е готов в платформата - ние го поддържаме вместо вас.",
  },
  {
    icon: PhoneOff,
    title: "По-малко обаждания",
    desc: "Хората виждат графика и събитията сами. Не сте постоянно на телефона, за да отговаряте на едни и същи въпроси.",
  },
];

const steps = [
  {
    step: "1",
    title: "Създайте акаунт",
    desc: "Регистрирайте се като бизнес - отнема секунди с имейл или Google.",
  },
  {
    step: "2",
    title: "Добавете студиото",
    desc: "Въведете адрес, снимки и описание - профилът ви става видим за практикуващи.",
  },
  {
    step: "3",
    title: "Добавете инструктори",
    desc: "Свържете инструкторите със студиото, за да могат да водят класове.",
  },
  {
    step: "4",
    title: "Публикувайте график и класове",
    desc: "Задайте разписание и класове - практикуващите вече могат да се записват онлайн.",
  },
];

const REGISTER_HREF = "/auth?type=register&role=business";

export function StudioOfferPage({ offer }: { offer: BusinessOfferDto }) {
  const pricingMessage =
    offer.slotsRemaining > 0
      ? `Остават ${offer.slotsRemaining} безплатни места за студиа - ${offer.trialDays} дни пробен период, след това ${offer.monthlyPriceEur} €/месец.`
      : `Нови студиа: ${offer.monthlyPriceEur} €/месец (без пробен период).`;

  return (
    <div className="font-body bg-yoga-bg">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-yoga-bg to-sage/10 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
              За йога студиа
            </p>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-5xl md:leading-tight">
              Управлявайте студиото си без излишни разходи
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Zenno е marketplace за йога, който свързва практикуващи с най-добрите студиа.
              Достигнете до нови клиенти, управлявайте разписание и записвания - всичко от едно табло.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AddStudioCtaButton size="lg" className="rounded-xl px-8 py-6 text-base">
                Създайте акаунт <ArrowRight className="ml-2 h-5 w-5" />
              </AddStudioCtaButton>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Защо студиата избират Zenno
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Всичко, от което се нуждаете - без допълнителни инструменти и разходи
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Как да започнете
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Четири стъпки - толкова е лесно
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="relative mx-auto mb-5 inline-block">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ListChecks className="h-7 w-7" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-2xl text-center text-muted-foreground">
            След регистрация получавате{" "}
            <span className="font-medium text-foreground">„Ръководство за настройка“</span> в таблото -
            onboarding списък, който ви води стъпка по стъпка до първия записан клас.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-sage/15 px-6 py-10 text-center md:px-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Специална оферта за ранни партньори
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{pricingMessage}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-gradient-to-r from-primary/10 via-primary/5 to-sage/15 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Готови ли сте да започнете?
              </h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                Създайте бизнес акаунт, добавете студиото, инструкторите и графиците - толкова е лесно.
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
            <AddStudioCtaButton size="lg" className="shrink-0 rounded-xl px-8 py-6 text-base">
              Създайте акаунт от тук <ArrowRight className="ml-2 h-5 w-5" />
            </AddStudioCtaButton>
          </div>
        </div>
      </section>
    </div>
  );
}
