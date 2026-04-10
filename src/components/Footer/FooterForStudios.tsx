import Link from "next/link";
import { footerColumnHeadingClass, footerLinkClass } from "./constants";

const pricingMailto =
  "mailto:info@Zenno.bg?subject=%D0%97%D0%B0%D0%BF%D0%B8%D1%82%D0%B2%D0%B0%D0%BD%D0%B5%20%D0%B7%D0%B0%20%D1%86%D0%B5%D0%BD%D0%BE%D1%80%D0%B0%D0%B7%D0%BF%D0%B8%D1%81";

export function FooterForStudios() {
  return (
    <div>
      <h4 className={footerColumnHeadingClass}>За студиа</h4>
      <ul className="space-y-3">
        <li>
          <Link href="/auth" className={footerLinkClass}>
            Добави студио
          </Link>
        </li>
        <li>
          <a href={pricingMailto} className={footerLinkClass}>
            Ценоразпис
          </a>
        </li>
        <li>
          <a href="mailto:info@Zenno.bg" className={footerLinkClass}>
            Контакт
          </a>
        </li>
      </ul>
    </div>
  );
}
