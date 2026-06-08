import Link from 'next/link';
import type { Metadata } from 'next';

export const fetchCache = 'force-cache';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Общи условия | Strover ЕООД',
  description:
    'Общи условия за ползване на услугите на Strover ЕООД. Правила, политика за връщане на суми и условия за използване на уебсайта.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  icons: {
    icon: '/favicon.png',
  },
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background py-8 pt-36 text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700 fill-mode-both">
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-28 rounded-lg border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Съдържание
              </h3>
              <nav className="space-y-2">
                <Link
                  href="#terminology"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  1. Терминология
                </Link>
                <Link
                  href="#cookies"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  2. Бисквитки (Cookies)
                </Link>
                <Link
                  href="#license"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  3. Лиценз и права върху съдържанието
                </Link>
                <Link
                  href="#comments"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  4. Коментари и потребителско съдържание
                </Link>
                <Link
                  href="#links"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  5. Връзки към нашето съдържание
                </Link>
                <Link
                  href="#content-responsibility"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  6. Отговорност за съдържанието
                </Link>
                <Link
                  href="#privacy"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  7. Поверителност
                </Link>
                <Link
                  href="#refund-policy"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  8. Политика за връщане на суми
                </Link>
                <Link
                  href="#changes"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  9. Промени в Общите условия
                </Link>
                <Link
                  href="#disclaimer"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  10. Отказ от отговорност
                </Link>
                <Link
                  href="#jurisdiction"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  11. Приложимо право и юрисдикция
                </Link>
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <section className="terms-and-conditions rounded-lg border border-border bg-card p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-foreground mb-6">
                <strong>Общи условия на Strover ЕООД</strong>
              </h1>

              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-4">
                  Добре дошли в <strong>Strover ЕООД</strong>!
                </p>

                <p className="text-muted-foreground mb-4">
                  Настоящите Общи условия уреждат правилата и условията за
                  ползване на уебсайта на <strong>Strover ЕООД</strong>,
                  достъпен на адрес{' '}
                  <Link
                    href="https://zenno.bg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline transition-colors"
                  >
                    https://zenno.bg
                  </Link>
                  .
                </p>

                <p className="text-muted-foreground mb-8">
                  С достъпа и използването на този уебсайт Вие се съгласявате с
                  настоящите Общи условия. Ако не сте съгласни с някое от тях,
                  моля, не използвайте нашия уебсайт.
                </p>

                <section id="terminology" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    1. Терминология
                  </h2>
                  <p className="text-muted-foreground">
                    <strong>„Клиент", „Вие", „Ваш"</strong> - лице или
                    организация, което достъпва и използва уебсайта и приема
                    настоящите условия.
                    <br />
                    <strong>„Компанията", „Ние", „Наш"</strong> - означава{' '}
                    <strong>Strover ЕООД</strong>, регистрирано дружество с
                    ограничена отговорност със седалище в гр.{' '}
                    <strong>София</strong>, България.
                  </p>
                </section>

                <section id="cookies" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    2. Бисквитки (Cookies)
                  </h2>
                  <p className="text-muted-foreground">
                    Strover ЕООД използва бисквитки. С достъпа до нашия уебсайт
                    Вие се съгласявате с използването на бисквитки в
                    съответствие с нашата{' '}
                    <Link
                      href="/privacy-policy"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      Политика за поверителност
                    </Link>
                    .
                  </p>
                </section>

                <section id="license" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    3. Лиценз и права върху съдържанието
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Освен ако не е посочено друго, Strover ЕООД и/или неговите
                    лицензодатели притежават всички права върху съдържанието на
                    този сайт.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>
                      Публикуване на материали от Strover без изрично писмено
                      съгласие е забранено;
                    </li>
                    <li>
                      Забранява се продажба, отдаване под наем или лицензиране
                      на съдържание;
                    </li>
                    <li>Не се допуска копиране или дублиране на материали;</li>
                    <li>
                      Разпространение на съдържание без съгласие на Strover ЕООД
                      е недопустимо.
                    </li>
                  </ul>
                </section>

                <section id="comments" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    4. Коментари и потребителско съдържание
                  </h2>
                  <p className="text-muted-foreground">
                    Strover ЕООД не носи отговорност за съдържание, публикувано
                    от потребители. С публикуване на коментар Вие гарантирате,
                    че имате всички права и че съдържанието не нарушава законови
                    норми.
                  </p>
                </section>

                <section id="links" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    5. Връзки към нашето съдържание
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Определени организации могат да поставят връзки към нашия
                    сайт без предварително разрешение: държавни институции,
                    търсачки, новинарски сайтове и онлайн директории.
                  </p>
                  <p className="text-muted-foreground">
                    Други организации могат да поискат разрешение чрез имейл на:{' '}
                    <Link
                      href="mailto:zennobg@gmail.com"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      zennobg@gmail.com
                    </Link>
                    .
                  </p>
                </section>

                <section id="content-responsibility" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    6. Отговорност за съдържанието
                  </h2>
                  <p className="text-muted-foreground">
                    Strover ЕООД не носи отговорност за съдържание, публикувано
                    на външни сайтове, които поставят връзки към нашия уебсайт.
                    Клиентът се задължава да защитава Strover ЕООД от всички
                    претенции, възникнали в резултат на подобни действия.
                  </p>
                </section>

                <section id="privacy" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    7. Поверителност
                  </h2>
                  <p className="text-muted-foreground">
                    Моля, запознайте се с нашата{' '}
                    <Link
                      href="/privacy-policy"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      Политика за поверителност
                    </Link>
                    , която описва как събираме, използваме и защитаваме личните
                    Ви данни в съответствие с GDPR и българското
                    законодателство.
                  </p>
                </section>

                <section id="refund-policy" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    8. Политика за връщане на суми
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Клиентите имат право да поискат{' '}
                    <strong>възстановяване на заплатената сума</strong> в срок
                    до <strong>30 дни (месец)</strong> от датата на
                    първоначалното плащане.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    След изтичане на този срок, заплатените суми{' '}
                    <strong>не подлежат на възстановяване</strong>.
                  </p>
                  <p className="text-muted-foreground">
                    Заявка за връщане на средства може да бъде направена на
                    имейл:{' '}
                    <Link
                      href="mailto:zennobg@gmail.com"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      zennobg@gmail.com
                    </Link>
                    . След одобрение, сумата ще бъде възстановена в срок до 14
                    календарни дни.
                  </p>
                </section>

                <section id="changes" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    9. Промени в Общите условия
                  </h2>
                  <p className="text-muted-foreground">
                    Strover ЕООД си запазва правото да изменя и допълва
                    настоящите Общи условия по всяко време. Промените влизат в
                    сила от момента на публикуването им на сайта.
                  </p>
                </section>

                <section id="disclaimer" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    10. Отказ от отговорност
                  </h2>
                  <p className="text-muted-foreground">
                    Strover ЕООД не носи отговорност за преки или косвени вреди,
                    произтичащи от използването на сайта, включително технически
                    проблеми или загуба на данни.
                  </p>
                </section>

                <section id="jurisdiction" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    11. Приложимо право и юрисдикция
                  </h2>
                  <p className="text-muted-foreground">
                    Настоящите Общи условия се уреждат от законите на{' '}
                    <strong>Република България</strong>. Всички спорове ще се
                    решават от компетентния съд в гр. <strong>София</strong>.
                  </p>
                </section>

                <hr className="my-8 border-border" />

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>Последна актуализация:</strong> 15.10.2025
                  </p>
                  <p>
                    <strong>Strover ЕООД</strong>, гр. София
                  </p>
                  <p>
                    <strong>Имейл за контакт:</strong>{' '}
                    <Link
                      href="mailto:zennobg@gmail.com"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      zennobg@gmail.com
                    </Link>
                  </p>
                  <p>
                    <strong>Уебсайт:</strong>{' '}
                    <Link
                      href="https://zenno.bg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      https://zenno.bg
                    </Link>
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
