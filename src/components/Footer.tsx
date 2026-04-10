"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";

/** Replace with your brand pages when ready. */
const FOOTER_SOCIAL = {
  facebook: "https://www.facebook.com/profile.php?id=61579570231712",
  instagram: "https://www.instagram.com/zennobg/",
} as const;

const Footer: React.FC = () => (
  <footer className="border-t border-white/10 bg-yoga-text text-neutral-400">
    <div className="container mx-auto px-4 py-14 md:py-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12 text-sm leading-relaxed">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/homepage/logo.png"
              alt=""
              fill
              className="object-contain"
              sizes="48px"
            />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-white">
            Zenno
          </span>
        </div>
        <p className="max-w-sm">
          Zenno е marketplace за йога, който свързва практикуващи с най-добрите студиа. Открий,
          избери и практикувай.
        </p>
        <div className="mt-6 flex items-center gap-2">
          <a
            href={FOOTER_SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-colors hover:border-white/35 hover:bg-white/10 hover:text-white"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5" strokeWidth={1.75} />
          </a>
          <a
            href={FOOTER_SOCIAL.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-colors hover:border-white/35 hover:bg-white/10 hover:text-white"
            aria-label="Facebook"
          >
            <Facebook className="h-5 w-5" strokeWidth={1.75} />
          </a>
        </div>
      </div>
      <div>
        <h4 className="font-display text-base font-semibold text-white mb-4 tracking-tight">
          Бързи връзки
        </h4>
        <ul className="space-y-3">
          <li>
            <Link
              href="/discover?nearMe=true"
              className="hover:text-white transition-colors text-yoga-tertiary"
            >
              Студия наблизо
            </Link>
          </li>
          <li>
            <Link
              href="/discover?ratingSort=desc"
              className="hover:text-white transition-colors text-yoga-tertiary"
            >
              Топ оценени
            </Link>
          </li>
          <li>
            <Link href="/#how-it-works" className="hover:text-white transition-colors text-yoga-tertiary">
              Как работи
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-base font-semibold text-white mb-4 tracking-tight">
          За студиа
        </h4>
        <ul className="space-y-3">
          <li>
            <Link href="/auth" className="hover:text-white transition-colors text-yoga-tertiary">
              Добави студио
            </Link>
          </li>
          <li>
            <a
              href="mailto:info@Zenno.bg?subject=%D0%97%D0%B0%D0%BF%D0%B8%D1%82%D0%B2%D0%B0%D0%BD%D0%B5%20%D0%B7%D0%B0%20%D1%86%D0%B5%D0%BD%D0%BE%D1%80%D0%B0%D0%B7%D0%BF%D0%B8%D1%81"
              className="hover:text-white transition-colors text-yoga-tertiary"
            >
              Ценоразпис
            </a>
          </li>
          <li>
            <a href="mailto:info@Zenno.bg" className="hover:text-white transition-colors text-yoga-tertiary">
              Контакт
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="container mx-auto px-4 py-6 text-center text-xs text-neutral-500">
        © 2026 Zenno. Всички права запазени.
      </div>
    </div>
  </footer>
);

export default Footer;
