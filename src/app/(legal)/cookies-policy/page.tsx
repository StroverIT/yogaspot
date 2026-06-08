import Link from 'next/link';
import type { Metadata } from 'next';

export const fetchCache = 'force-cache';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Политика за бисквитки | Strover ЕООД',
  description:
    'Политика за бисквитки на Strover ЕООД. Какви видове бисквитки използваме, как ги използваме и как можете да ги контролирате.',
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

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-background py-8 pt-36 text-foreground" lang="bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700 fill-mode-both">
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-28 rounded-lg border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Съдържание
              </h3>
              <nav className="space-y-2">
                <Link
                  href="#what-are-cookies"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  1. Какво представляват бисквитките?
                </Link>
                <Link
                  href="#types-of-cookies"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  2. Какви видове бисквитки използваме?
                </Link>
                <Link
                  href="#how-we-use-cookies"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  3. Как използваме бисквитките?
                </Link>
                <Link
                  href="#third-party-cookies"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  4. Бисквитки на трети страни
                </Link>
                <Link
                  href="#control-cookies"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  5. Как можете да контролирате бисквитките?
                </Link>
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <section className="cookie-policy rounded-lg border border-border bg-card p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-foreground mb-6">
                <strong>Политика за бисквитки</strong>
              </h1>

              <div className="prose prose-lg max-w-none">
                <div className="mb-6">
                  <p className="text-muted-foreground mb-2">
                    <strong>Администратор (Собственик):</strong> Strover ЕООД
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Имейл за контакт:</strong>{' '}
                    <Link
                      href="mailto:zennobg@gmail.com"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      zennobg@gmail.com
                    </Link>
                  </p>
                </div>

                <hr className="my-8 border-border" />

                <section id="what-are-cookies" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    1. Какво представляват бисквитките?
                  </h2>
                  <p className="text-muted-foreground">
                    Бисквитките (cookies) са малки текстови файлове, които се
                    съхраняват на Вашето устройство (компютър, таблет, телефон),
                    когато посещавате даден уебсайт. Те позволяват на сайта да
                    разпознава устройството Ви и да подобрява потребителското
                    изживяване, като запомня определени Ваши действия и
                    предпочитания.
                  </p>
                </section>

                <section id="types-of-cookies" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    2. Какви видове бисквитки използваме?
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Нашият сайт{' '}
                    <Link
                      href="https://zenno.bg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      zenno.bg
                    </Link>{' '}
                    използва няколко основни типа бисквитки:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>
                      <strong>Необходими бисквитки</strong> - от съществено
                      значение за работата на сайта (например за влизане в
                      акаунт, попълване на формуляри и др.).
                    </li>
                    <li>
                      <strong>Функционални бисквитки</strong> - помагат да
                      запомним Вашите предпочитания (език, настройки и др.).
                    </li>
                    <li>
                      <strong>Аналитични бисквитки</strong> - събират информация
                      как посетителите използват сайта (напр. Google Analytics)
                      с цел подобряване на съдържанието и функционалността.
                    </li>
                    <li>
                      <strong>Маркетингови бисквитки</strong> - използват се за
                      персонализирана реклама и проследяване на ефективността ѝ.
                      Те могат да бъдат поставяни от външни партньори.
                    </li>
                  </ul>
                </section>

                <section id="how-we-use-cookies" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    3. Как използваме бисквитките?
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Използваме бисквитки, за да:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>
                      подобряваме функционалността и производителността на
                      сайта;
                    </li>
                    <li>анализираме трафика и поведението на потребителите;</li>
                    <li>
                      персонализираме съдържанието и рекламите според Вашите
                      интереси;
                    </li>
                    <li>
                      осигуряваме сигурност и предотвратяваме злоупотреби.
                    </li>
                  </ul>
                </section>

                <section id="third-party-cookies" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    4. Бисквитки на трети страни
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    В някои случаи използваме услуги на трети страни (напр.
                    Google, Meta, Cloudflare), които също могат да поставят свои
                    бисквитки на Вашето устройство. Тези бисквитки се
                    контролират от съответните трети страни и се подчиняват на
                    техните политики за поверителност:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>
                      <Link
                        href="https://policies.google.com/privacy?hl=bg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline transition-colors"
                      >
                        Политика за поверителност на Google
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="https://www.facebook.com/policy.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline transition-colors"
                      >
                        Политика за поверителност на Meta (Facebook)
                      </Link>
                    </li>
                  </ul>
                </section>

                <section id="control-cookies" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    5. Как можете да контролирате бисквитките?
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    При първото посещение на нашия сайт ще видите изскачащо
                    съобщение (банер) за съгласие с използването на бисквитки.
                    Можете да приемете всички бисквитки или да изберете само
                    определени категории.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Освен това можете да контролирате или изтривате бисквитките
                    по всяко време чрез настройките на Вашия браузър. Повечето
                    браузъри позволяват:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>блокиране на всички бисквитки;</li>
                    <li>изтриване на вече запазени бисквитки;</li>
                    <li>избиране на кои бисквитки да се приемат;</li>
                    <li>
                      получаване на уведомления преди поставяне на бисквитки.
                    </li>
                  </ul>
                </section>

                <hr className="my-8 border-border" />

                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Последна актуализация:</strong> 18.10.2025
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
