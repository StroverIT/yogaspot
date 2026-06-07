import { footerMutedTextClass } from "./constants";

export function FooterCopyright() {
  return (
    <div className="border-t border-white/10">
      <div className={`container mx-auto px-4 py-6 text-center text-xs ${footerMutedTextClass}`}>
        © 2026 Zenno. Всички права запазени.
      </div>
    </div>
  );
}
