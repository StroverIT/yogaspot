import Link from "next/link";
import { footerColumnHeadingClass, footerLinkClass } from "./constants";

export function FooterQuickLinks() {
  return (
    <div>
      <h4 className={footerColumnHeadingClass}>Бързи връзки</h4>
      <ul className="space-y-3">
        <li>
          <Link href="/discover?nearMe=true" className={footerLinkClass}>
            Студия наблизо
          </Link>
        </li>
        <li>
          <Link href="/discover?ratingSort=desc" className={footerLinkClass}>
            Топ оценени
          </Link>
        </li>
        <li>
          <Link href="/#how-it-works" className={footerLinkClass}>
            Как работи
          </Link>
        </li>
      </ul>
    </div>
  );
}
