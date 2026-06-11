"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CalendarDays,
  CreditCard,
  Globe,
  MapPin,
  Megaphone,
  MessageCircle,
  PhoneOff,
  RefreshCw,
  Star,
  UserPlus,
  Users,
  Video,
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
import { StudioOfferModeContentSkeleton } from "@/views/StudioOfferPage/StudioOfferModeContentSkeleton";
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

const FINAL_SECTION_ID = "studio-offer-final-cta";

type TeachingMode = "physical" | "online";

function teachingModeFromParam(value: string | null): TeachingMode {
  return value === "online" ? "online" : "physical";
}

const dashboardFinanceBenefit = {
  icon: BarChart3,
  title: "Приход, разход и анализи",
  outcome: "За онлайн и физически класове",
  desc: "В бизнес таблото следите приходите от записвания и абонаменти, разходите и месечните анализи - на едно място, без Excel.",
  featured: false,
};

const physicalBenefits = [
  {
    icon: Calendar,
    title: "Онлайн записвания",
    outcome: "Младите записват с един клик",
    desc: "Публикувате графика в приложението - практикуващите резервират място сами, без обаждания и съобщения.",
    featured: false,
  },
  {
    icon: Megaphone,
    title: "Носим младата аудитория при вас",
    outcome: "Без рекламен бюджет от ваша страна",
    desc: "Създадохме Zenno за млади практикуващи - рекламата и привличането на потребители е наша работа. Вие се фокусирате върху класовете.",
    featured: true,
  },
  {
    icon: MapPin,
    title: "Видими сте там, където търсят",
    outcome: "Локация и MultiSport на едно място",
    desc: "Младите хора намират най-близкото студио и виждат къде приемате MultiSport - без да търсят из социалните мрежи.",
    featured: false,
  },
  {
    icon: Globe,
    title: "Без собствен сайт",
    outcome: "Профил, готов за минути",
    desc: "Не ви трябва сайт, хостинг или програмист. Профилът ви живее в платформата - ние го поддържаме вместо вас.",
    featured: false,
  },
  {
    icon: PhoneOff,
    title: "По-малко администрация",
    outcome: "Графикът е ясен денонощно",
    desc: "Практикуващите виждат разписание и събития сами - вие не сте постоянно на телефона за едни и същи въпроси.",
    featured: false,
  },
  {
    icon: CreditCard,
    title: "Онлайн плащане или на място",
    outcome: "Вие избирате за всеки клас",
    desc: "Приемайте плащане в студиото, онлайн при записване, или и двете - според начина, по който работите.",
    featured: false,
  },
  {
    icon: Calendar,
    title: "Автоматичен Google Calendar",
    outcome: "Дата, час и адрес - без ръчна работа",
    desc: "След запис практикуващият получава покана в календара си с локацията на студиото.",
    featured: false,
  },
  {
    icon: Bell,
    title: "Напомняния преди класа",
    outcome: "По-малко пропуснати сесии",
    desc: "Известие един ден и един час преди старта - хората не забравят часа и адреса.",
    featured: false,
  },
  {
    icon: RefreshCw,
    title: "Синхронизация с fitsys",
    outcome: "Един график, без двойна работа",
    desc: "Ако вече ползвате fitsys, разписанието Ви може да се синхронизира и в Zenno - без да водите графика на две места.",
    featured: false,
  },
  dashboardFinanceBenefit,
];

const onlineBenefits = [
  {
    icon: Video,
    title: "Класове на живо",
    outcome: "Практиката е реална, не запис",
    desc: "Водите през Zoom - практикуващите ви виждат и чуват в реално време, сякаш сте в една стая.",
    featured: true,
  },
  {
    icon: MessageCircle,
    title: "Групов чат",
    outcome: "Общност, която остава след класа",
    desc: "Всеки записан влиза в чат с останалите - въпроси, подкрепа и мотивация между сесиите.",
    featured: false,
  },
  {
    icon: Calendar,
    title: "Автоматичен Google Calendar",
    outcome: "Линк, дата и час - без ръчна работа",
    desc: "След запис практикуващият получава покана в календара си с Zoom линка - готов за един клик.",
    featured: false,
  },
  {
    icon: Bell,
    title: "Напомняния преди класа",
    outcome: "По-малко пропуснати сесии",
    desc: "Известие един ден и един час преди старта - хората не забравят и не търсят линка в последния момент.",
    featured: false,
  },
  {
    icon: Megaphone,
    title: "Достигате отвъд града си",
    outcome: "Без нова зала, без нов наем",
    desc: "Млади практикуващи от цяла България ви откриват в Zenno - вие водите от вкъщи или студио, те се включват отвсякъде.",
    featured: false,
  },
  dashboardFinanceBenefit,
];

const physicalComparison = {
  without: [
    "Трудно достигате до младата аудитория",
    "Реклама и социални мрежи - от вас",
    "Телефони и съобщения за всеки запис",
    "Плащания, календар и напомняния - ръчно за всеки",
    "Sysfit и отделен график за Zenno - двойна работа",
  ],
  with: [
    "Виждат ви млади практикуващи в приложението",
    "Ние привличаме новата аудитория",
    "Онлайн записвания денонощно",
    "Онлайн плащане или на място + Google Calendar и напомняния",
    "Синхронизация със Sysfit - без двоен график",
    "Приход, разход и анализи в бизнес таблото",
  ],
};

const onlineComparison = {
  without: [
    "Линкове и покани в календара - ръчно за всеки",
    "Практикуващите забравят часа и линка",
    "Няма място за общност между класовете",
    "Онлайн аудиторията ви не ви намира",
  ],
  with: [
    "Zoom среща + Google Calendar - автоматично след запис",
    "Напомняния един ден и един час преди класа",
    "Групов чат за всеки клас",
    "Видими сте за млади практикуващи в цялата страна",
    "Приход, разход и анализи в бизнес таблото",
  ],
};

const physicalSteps = [
  {
    step: "1",
    icon: UserPlus,
    title: "Създайте акаунт",
    desc: "Регистрацията отнема секунди - с имейл или Google.",
  },
  {
    step: "2",
    icon: Building2,
    title: "Добавете студиото",
    desc: "Адрес, снимки, описание - и сте видими за млади практикуващи в приложението.",
  },
  {
    step: "3",
    icon: Users,
    title: "Добавете инструктори",
    desc: "Свържете екипа със студиото, за да могат да водят класове.",
  },
  {
    step: "4",
    icon: CalendarDays,
    title: "Публикувайте график",
    desc: "Задайте разписание и начин на плащане - записванията, календарът и напомнянията тръгват сами.",
  },
];

const onlineSteps = [
  {
    step: "1",
    icon: UserPlus,
    title: "Създайте акаунт",
    desc: "Регистрацията отнема секунди - с имейл или Google.",
  },
  {
    step: "2",
    icon: Building2,
    title: "Добавете студиото",
    desc: "Име, снимки, описание - профилът ви е готов за онлайн класове.",
  },
  {
    step: "3",
    icon: Video,
    title: "Свържете Zoom",
    desc: "Свързвате акаунта си - всяка среща се създава автоматично при публикуване на клас.",
  },
  {
    step: "4",
    icon: CalendarDays,
    title: "Публикувайте онлайн график",
    desc: "Задайте час - записванията, календарът и напомнянията тръгват сами.",
  },
];

const physicalFaqItems = [
  {
    q: "Каква е каузата на Zenno?",
    a: "Създадохме Zenno, за да направим йогата достъпна за млади хора в България. Като партньорско студио вие давате място за практика - ние ви помагаме да достигнете до тази аудитория.",
  },
  {
    q: "Колко струва?",
    a: "Първите партньорски студиа получават пробен период, след което месечна абонаментна такса. Цената е актуална на тази страница - без скрити такси за записвания от практикуващи.",
  },
  {
    q: "Нужен ли ми е собствен сайт?",
    a: "Не. Профилът ви в Zenno заменя нуждата от отделен сайт, хостинг и поддръжка от програмист.",
  },
  {
    q: "Колко време отнема настройката?",
    a: "Регистрацията отнема минути. След това добавяте студио, инструктори и график - списъкът за настройка в таблото ви води стъпка по стъпка.",
  },
  {
    q: "Как работят плащанията?",
    a: "За всеки клас избирате дали приемате плащане на място, онлайн при записване, или и двете. При онлайн плащане клиентът плаща веднага; при плащане на място резервацията е безплатна онлайн и уреждате сумата в студиото.",
  },
  {
    q: "Получават ли практикуващите Google Calendar и напомняния?",
    a: "Да. След запис практикуващият получава линк за Google Calendar с адреса на студиото, както и .ics файл с напомняния един ден и един час преди класа.",
  },
  {
    q: "Ползваме Sysfit - работи ли с Zenno?",
    a: "Да. Ако студиото ви вече работи със Sysfit, можем да синхронизираме разписанието и в Zenno - така не поддържате два отделни графика и младата аудитория вижда актуалните часове в приложението.",
  },
];

const onlineFaqItems = [
  {
    q: "Как работят онлайн класовете?",
    a: "Публикувате график в Zenno - при всяка сесия се създава Zoom среща на живо. Записалите се получават линк в Google Calendar и напомняния един ден и един час преди старта.",
  },
  {
    q: "Трябва ли ми физическа зала?",
    a: "Не. Можете да водите от вкъщи или от студио - важното е практикуващите да ви виждат и чуват на живо през Zoom.",
  },
  {
    q: "Какво е груповият чат?",
    a: "Всеки записан за клас влиза в чат с останалите участници - за въпроси, обратна връзка и подкрепа между сесиите.",
  },
  {
    q: "Колко струва?",
    a: "Първите партньорски студиа получават пробен период, след което месечна абонаментна такса. Цената е актуална на тази страница - без скрити такси за записвания.",
  },
];

export function StudioOfferPage({
  offer,
  stats,
}: {
  offer: BusinessOfferDto;
  stats: StudioOfferStats;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileStickyVisible, setMobileStickyVisible] = useState(false);
  const [isModeSwitching, setIsModeSwitching] = useState(false);
  const [pendingMode, setPendingMode] = useState<TeachingMode | null>(null);
  const fmt = (n: number) => n.toLocaleString("bg-BG");

  const urlMode = teachingModeFromParam(searchParams.get("mode"));
  const activeMode = pendingMode ?? urlMode;

  useEffect(() => {
    setIsModeSwitching(false);
    setPendingMode(null);
  }, [urlMode]);

  const setTeachingMode = useCallback(
    (mode: TeachingMode) => {
      if (mode === urlMode) return;
      setIsModeSwitching(true);
      setPendingMode(mode);
      const params = new URLSearchParams(searchParams.toString());
      if (mode === "online") {
        params.set("mode", "online");
      } else {
        params.delete("mode");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams, urlMode],
  );

  const isPhysical = urlMode === "physical";
  const tabIsPhysical = activeMode === "physical";
  const benefits = isPhysical ? physicalBenefits : onlineBenefits;
  const comparison = isPhysical ? physicalComparison : onlineComparison;
  const steps = isPhysical ? physicalSteps : onlineSteps;
  const faqItems = isPhysical ? physicalFaqItems : onlineFaqItems;

  const heroStats: {
    value: string;
    label: string;
    showStar?: boolean;
  }[] = [
      { value: `${stats.studioCount}+`, label: "Партньорски студиа" },
      { value: `${stats.classCount}+`, label: "Предстоящи класове" },
      // { value: `${fmt(stats.totalEnrolled)}+`, label: "Записани места" },
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
                  Партньорство с йога студиа
                </p>
                <h1 className="offer-animate font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                  Помогнете на младите да открият йогата
                </h1>
                <p className="offer-animate mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Много млади хора искат да практикуват, но не знаят откъде да започнат. Zenno ги
                  свързва със студиа като вашето - вие осигурявате пространството, ние носим
                  аудиторията и всичко останало по управлението.
                </p>
                <div className="offer-animate mt-8">
                  <AddStudioCtaButton
                    next="/dashboard"
                    size="lg"
                    className="rounded-xl border-0 bg-yoga-accent px-8 py-6 text-base text-white shadow-md shadow-yoga-accent/25 hover:bg-yoga-accent/90"
                  >
                    Запишете студиото <ArrowRight className="ml-2 h-5 w-5" />
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
                  Таблото ви - приход, разход и анализи за онлайн и физически класове
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background py-10 md:py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
                Как преподавате?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Изберете формата си - ще ви покажем какво Zenno прави за вас
              </p>
              <div
                className="mt-6 inline-flex w-full max-w-md rounded-2xl border border-border bg-muted/40 p-1.5"
                role="tablist"
                aria-label="Формат на преподаване"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tabIsPhysical}
                  disabled={isModeSwitching}
                  onClick={() => setTeachingMode("physical")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all md:text-base",
                    tabIsPhysical
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    isModeSwitching && "pointer-events-none opacity-70",
                  )}
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  В студио
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!tabIsPhysical}
                  disabled={isModeSwitching}
                  onClick={() => setTeachingMode("online")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all md:text-base",
                    !tabIsPhysical
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                    isModeSwitching && "pointer-events-none opacity-70",
                  )}
                >
                  <Video className="h-4 w-4 shrink-0" />
                  Онлайн
                </button>
              </div>
            </div>
          </div>
        </section>

        {isModeSwitching ? (
          <StudioOfferModeContentSkeleton />
        ) : (
          <>
            <section data-offer-section className="border-b border-border py-16 md:py-20">
              <div className="container mx-auto px-4">
                <div className="offer-section-head mb-10 text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                    {isPhysical ? "Преди и след Zenno" : "Онлайн йога без главоболие"}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {isPhysical
                      ? "Записвания, плащания, календар и напомняния - всичко тръгва само, вие се фокусирате върху класа"
                      : "Записвания, Zoom на живо, календар и напомняния - всичко тръгва само, вие се фокусирате върху класа"}
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
                      Със Zenno
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
                    {isPhysical ? "Защо студиата се присъединяват" : "Защо онлайн инструкторите избират Zenno"}
                  </h2>
                  <p className="mt-3 text-lg text-muted-foreground">
                    {isPhysical
                      ? "Практични инструменти за вас. По-добър достъп до йога за младите."
                      : "Живи класове, общност и автоматизация - без да сте постоянно в съобщения и имейли."}
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
                  <p className="mt-3 text-lg text-muted-foreground">
                    {isPhysical
                      ? "Четири стъпки - и сте част от общността"
                      : "Четири стъпки до първия ви онлайн клас на живо"}
                  </p>
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
                  {isPhysical ? (
                    <>
                      След първия публикуван клас практикуващите получават{" "}
                      <span className="font-medium text-foreground">покана в Google Calendar</span> и
                      напомняния автоматично - вие посрещате хората в студиото.
                    </>
                  ) : (
                    <>
                      След първия публикуван клас практикуващите получават{" "}
                      <span className="font-medium text-foreground">Zoom линк в Google Calendar</span> и
                      напомняния автоматично - вие само отваряте срещата и водите.
                    </>
                  )}
                </p>
              </div>
            </section>

            <section data-offer-section className="border-t border-border bg-background py-16 md:py-20 lg:py-24">
              <div className="container mx-auto max-w-2xl px-4 lg:max-w-3xl xl:max-w-4xl">
                <div className="offer-section-head mb-8 text-center lg:mb-10">
                  <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
                    Често задавани въпроси
                  </h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, i) => (
                    <AccordionItem key={item.q} value={`faq-${i}`} className="offer-animate">
                      <AccordionTrigger className="py-4 text-left text-base font-medium lg:py-5 lg:text-lg xl:py-6 xl:text-xl [&>svg]:h-4 [&>svg]:w-4 lg:[&>svg]:h-5 lg:[&>svg]:w-5">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-base leading-relaxed text-muted-foreground lg:text-lg xl:text-xl">
                        {item.a}
                      </AccordionContent>
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
                      Готови ли сте да станете част от това?
                    </h2>
                    <p className="mt-2 max-w-md text-muted-foreground">
                      {isPhysical
                        ? "Регистрирайте студиото си и помогнете на млади хора да започнат практиката си - отнема около 2 минути."
                        : "Регистрирайте се и пуснете първия си онлайн клас на живо - отнема около 2 минути."}
                    </p>
                  </div>
                  <div className="offer-animate shrink-0">
                    <AddStudioCtaButton next="/dashboard" size="lg" className="rounded-xl px-8 py-6 text-base">
                      Запишете студиото за 2 минути <ArrowRight className="ml-2 h-5 w-5" />
                    </AddStudioCtaButton>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <section data-offer-section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-sage/15 px-6 py-10 text-center md:px-12 md:py-14">
              <p className="offer-animate text-sm font-semibold uppercase tracking-wide text-primary">
                Станете част от каузата
              </p>
              {offer.slotsRemaining > 0 ? (
                <>
                  <div className="offer-animate mt-4 font-display text-6xl font-bold text-foreground md:text-7xl">
                    {offer.slotsRemaining}
                  </div>
                  <p className="offer-animate mt-2 text-lg font-medium text-foreground">
                    безплатни места за партньорски студиа
                  </p>
                  <p className="offer-animate mt-3 text-muted-foreground">
                    {offer.trialDays} дни пробен период · след това {offer.monthlyPriceEur} €/месец
                  </p>
                </>
              ) : (
                <>
                  <h2 className="offer-animate mt-4 font-display text-2xl font-bold text-foreground md:text-3xl">
                    Станете част от общността
                  </h2>
                  <p className="offer-animate mt-3 text-lg text-muted-foreground">
                    {offer.monthlyPriceEur} €/месец · без пробен период
                  </p>
                </>
              )}
              <div className="offer-animate mt-8">
                <AddStudioCtaButton next="/dashboard" size="lg" className="rounded-xl px-8 py-6 text-base">
                  Запишете студиото <ArrowRight className="ml-2 h-5 w-5" />
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
