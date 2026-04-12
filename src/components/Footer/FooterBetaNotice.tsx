import { FOOTER_SOCIAL, footerLinkClass } from "./constants";

const externalLinkProps = {
  target: "_blank" as const,
  rel: "noopener noreferrer" as const,
};

export function FooterBetaNotice() {
  return (
    <div className="border-t border-white/10 bg-white/[0.03]">
      <div className="container mx-auto px-4 py-4 text-center text-sm text-neutral-400 leading-relaxed">
        <p>
          <span className="font-medium text-amber-200/90">
            Тестова версия.
          </span>{" "}
          Ако откриете бъг, съобщете ни във{" "}
          <a
            href={FOOTER_SOCIAL.facebook}
            {...externalLinkProps}
            className={footerLinkClass}
          >
            Facebook
          </a>{" "}
          или{" "}
          <a
            href={FOOTER_SOCIAL.instagram}
            {...externalLinkProps}
            className={footerLinkClass}
          >
            Instagram
          </a>
          .
        </p>
      </div>
    </div>
  );
}
