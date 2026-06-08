import Link from "next/link";

import { footerLinkClass, footerMutedTextClass } from "./constants";

const LEGAL_LINKS = [
  { href: "/cookies-policy", label: "Бисквитки" },
  { href: "/terms-and-conditions", label: "Условия за ползване" },
  { href: "/privacy-policy", label: "Поверителност" },
] as const;

export function FooterCopyright() {
  return (
    <div className="border-t border-white/10">
      <div
        className={`container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 text-xs md:flex-row ${footerMutedTextClass}`}
      >
        <p>© 2026 Zenno. Всички права запазени.</p>
        <nav aria-label="Правни документи" className="flex flex-wrap items-center justify-center gap-y-2">
          {LEGAL_LINKS.map(({ href, label }, index) => (
            <span key={href} className="flex items-center">
              {index > 0 ? (
                <span aria-hidden="true" className="mx-4 text-neutral-600">
                  ·
                </span>
              ) : null}
              <Link href={href} className={footerLinkClass}>
                {label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
