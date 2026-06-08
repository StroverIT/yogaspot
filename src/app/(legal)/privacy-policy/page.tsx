import Link from 'next/link';
import type { Metadata } from 'next';

export const fetchCache = 'force-cache';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Политика за поверителност | Strover ЕООД',
  description:
    'Политика за поверителност на Strover ЕООД. Как събираме, обработваме и защитаваме личните ви данни в съответствие с GDPR и ОРЗД.',
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

export default function PrivacyPolicy() {
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
                  href="#data-types"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  Видове данни, които събираме
                </Link>
                <Link
                  href="#processing-methods"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  Начин и място на обработване на Данните
                </Link>
                <Link
                  href="#cookies"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  Политика за бисквитки
                </Link>
                <Link
                  href="#eu-users"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  Допълнителна информация за Потребители в ЕС
                </Link>
                <Link
                  href="#user-rights"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  Правата на потребителите съгласно ОРЗД (GDPR)
                </Link>
                <Link
                  href="#additional-info"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  Допълнителна информация относно събирането и обработването
                </Link>
                <Link
                  href="#policy-changes"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  Промени в тази Политика за поверителност
                </Link>
                <Link
                  href="#definitions"
                  className="block text-sm text-primary/80 hover:text-primary transition-colors"
                >
                  Определения и правни препратки
                </Link>
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <section className="privacy-policy rounded-lg border border-border bg-card p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-foreground mb-6">
                <strong>Политика за поверителност</strong>
              </h1>

              <div className="prose prose-lg max-w-none">
                <div className="mb-6">
                  <p className="text-muted-foreground mb-2">
                    <strong>Администратор (Собственик):</strong> Strover ЕООД
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Имейл за контакт със собственика:</strong>{' '}
                    <Link
                      href="mailto:zennobg@gmail.com"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      zennobg@gmail.com
                    </Link>
                  </p>
                </div>

                <hr className="my-8 border-border" />

                <section id="data-types" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Видове данни, които събираме
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Собственикът не предоставя списък на събраните видове Лични
                    данни.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Пълни подробности за всеки вид събрани Лични данни са
                    предоставени в специалните раздели на настоящата Политика за
                    поверителност или чрез конкретни поясняващи текстове,
                    показани преди събирането на Данни. Личните данни могат да
                    бъдат предоставени свободно от Потребителя или, в случай на
                    Данни за използване, да бъдат събирани автоматично при
                    използване на това приложение.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Освен ако не е посочено друго, всички Данни, поискани от
                    това приложение, са задължителни и непредоставянето им може
                    да направи невъзможно предоставянето на услугите. В
                    случаите, когато това приложение изрично посочи, че някои
                    Данни не са задължителни, Потребителите са свободни да не ги
                    съобщават без последици за наличността или функционирането
                    на услугата. Потребителите, които не са сигурни кои Лични
                    данни са задължителни, могат да се свържат със Собственика.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Всяко използване на{' '}
                    <Link
                      href="#cookies"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      Бисквитки
                    </Link>{' '}
                    или други инструменти за проследяване от това приложение или
                    от собствениците на услуги на трети страни, използвани от
                    това приложение, служи за целите на предоставянето на
                    Услугата, изисквана от Потребителя, в допълнение към всички
                    други цели, описани в настоящия документ и в{' '}
                    <Link
                      href="#cookies"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      Политиката за бисквитки
                    </Link>
                    .
                  </p>
                  <p className="text-muted-foreground">
                    Потребителите носят отговорност за всички Лични данни на
                    трети страни, получени, публикувани или споделени чрез това
                    приложение.
                  </p>
                </section>

                <section id="processing-methods" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Начин и място на обработване на Данните
                  </h2>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Методи на обработване
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Собственикът предприема подходящи мерки за сигурност, за да
                    предотврати неоторизиран достъп, разкриване, промяна или
                    неразрешено унищожаване на Данните. Обработването на Данните
                    се извършва с помощта на компютри и/или ИТ активирани
                    инструменти, като се следват организационни процедури и
                    режими, строго свързани с посочените цели. В допълнение към
                    Собственика, в някои случаи Данните могат да бъдат достъпни
                    за определени типове отговорни лица, участващи във
                    функционирането на това приложение (администрация, продажби,
                    маркетинг, правен отдел, системна администрация) или външни
                    лица (като например трети страни - доставчици на технически
                    услуги, пощенски оператори, доставчици на хостинг, ИТ
                    компании, комуникационни агенции), назначени, ако е
                    необходимо, за Обработващи лични данни от Собственика.
                    Актуализиран списък на тези лица може да бъде поискан от
                    Собственика по всяко време.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Място
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Данните се обработват в оперативните офиси на Собственика и
                    на всички други места, където се намират страните, участващи
                    в обработването. В зависимост от местоположението на
                    Потребителя, прехвърлянето на Данни може да включва
                    прехвърляне на Данни на Потребители в държава, различна от
                    тяхната собствена. За да научат повече за мястото на
                    обработване на тези прехвърлени Данни, Потребителите могат
                    да проверят раздела, съдържащ подробности за обработването
                    на Лични данни.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Период на съхранение
                  </h3>
                  <p className="text-muted-foreground">
                    Освен ако не е посочено друго в настоящия документ, Личните
                    данни се обработват и съхраняват толкова дълго, колкото се
                    изисква за целта, за която са събрани, и могат да бъдат
                    запазени за по-дълго време заради приложимо правно
                    задължение или въз основа на съгласието на Потребителите.
                  </p>
                </section>

                <section id="cookies" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Политика за бисквитки
                  </h2>
                  <p className="text-muted-foreground">
                    Това приложение използва Тракери (бисквитки и подобни
                    технологии). За да научат повече, Потребителите могат да се
                    запознаят с отделната{' '}
                    <Link
                      href="/cookies-policy"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      Политика за бисквитки
                    </Link>
                    .
                  </p>
                </section>

                <section id="eu-users" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Допълнителна информация за Потребители в Европейския съюз
                  </h2>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Правно основание на обработването
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Собственикът може да обработва Лични данни, свързани с
                    Потребителите, ако е приложимо едно от следните:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                    <li>
                      Потребителите са дали съгласието си за една или повече
                      конкретни цели;
                    </li>
                    <li>
                      предоставянето на Данни е необходимо за изпълнението на
                      споразумение с Потребителя и/или за преддоговорни
                      задължения;
                    </li>
                    <li>
                      обработването е необходимо за спазване на правно
                      задължение, на което обект е Собственика;
                    </li>
                    <li>
                      обработването е свързано със задача от обществен интерес
                      или при упражняване на официални правомощия, предоставени
                      на Собственика;
                    </li>
                    <li>
                      обработването е необходимо за целите на законните интереси
                      на Собственика или на трето лице.
                    </li>
                  </ul>
                  <p className="text-muted-foreground mb-4">
                    При всички положения Собственикът с удоволствие ще помогне
                    да се изясни конкретното правно основание, което се прилага
                    за обработването, и по-специално дали предоставянето на
                    Лични данни е законово или договорно изискване или
                    изискване, необходимо за сключване на договор.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Допълнителна информация за периода на съхранение
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Освен ако не е посочено друго в настоящия документ, Личните
                    данни се обработват и съхраняват толкова дълго, колкото се
                    изисква за целта, за която са събрани, и могат да бъдат
                    запазени за по-дълго време заради приложимо правно
                    задължение или въз основа на съгласието на Потребителите.
                  </p>
                  <p className="text-muted-foreground mb-4">Следователно:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                    <li>
                      Личните данни, събрани за цели, свързани с изпълнението на
                      договор между Собственика и Потребителя, се съхраняват до
                      пълното изпълнение на договора.
                    </li>
                    <li>
                      Личните данни, събрани за целите на законните интереси на
                      Собственика, се съхраняват толкова дълго, колкото е
                      необходимо за изпълнение на тези цели.
                    </li>
                    <li>
                      Може да се съхраняват по-дълго, когато Потребителят е дал
                      съгласие, докато това съгласие не бъде оттеглено, или
                      когато закон изисква по-дълго съхранение.
                    </li>
                  </ul>
                  <p className="text-muted-foreground">
                    След изтичане на периода на съхранение Личните данни се
                    изтриват. Следователно правото на достъп, правото на
                    заличаване, правото на коригиране и правото на преносимост
                    на данните не могат да бъдат приложени след изтичане на
                    периода на съхранение.
                  </p>
                </section>

                <section id="user-rights" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Правата на потребителите съгласно ОРЗД (GDPR)
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Потребителите могат да упражняват следните права по
                    отношение на техните Данни, обработвани от Собственика
                    (доколкото е разрешено от закона):
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                    <li>
                      <strong>Оттегляне на съгласие</strong> по всяко време;
                    </li>
                    <li>
                      <strong>Възражение</strong> срещу обработването, когато
                      правното основание не е съгласие;
                    </li>
                    <li>
                      <strong>Достъп</strong> до Данните и получаване на копие;
                    </li>
                    <li>
                      <strong>Коригиране</strong> на неточни или непълни Данни;
                    </li>
                    <li>
                      <strong>Ограничаване</strong> на обработването при
                      приложимите условия;
                    </li>
                    <li>
                      <strong>Заличаване</strong> („правото да бъдеш забравен");
                    </li>
                    <li>
                      <strong>Преносимост</strong> на данните в структуриран,
                      машинно четим формат;
                    </li>
                    <li>
                      <strong>Жалба</strong> пред компетентния надзорен орган за
                      защита на данните.
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Подробности относно правото на възражение
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Когато Личните данни се обработват за обществен интерес, при
                    упражняване на официални правомощия или за законни интереси
                    на Собственика, Потребителите могат да възразят срещу такова
                    обработване, като посочат основания, свързани с тяхната
                    конкретна ситуация.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Ако Данните се обработват за директен маркетинг,
                    Потребителите могат да възразят по всяко време безплатно и
                    без обосновка. В случай на възражение за директен маркетинг,
                    Данните повече няма да се обработват за тази цел.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Как да упражните тези права
                  </h3>
                  <p className="text-muted-foreground">
                    Исканията за упражняване на права могат да бъдат изпращани
                    до Собственика на{' '}
                    <Link
                      href="mailto:zennobg@gmail.com"
                      className="text-primary hover:text-primary/80 underline transition-colors"
                    >
                      zennobg@gmail.com
                    </Link>
                    . Исканията са безплатни; Собственикът ще отговори възможно
                    най-рано и винаги в рамките на един месец, като предостави
                    изискуемата от закона информация. Всяко
                    коригиране/заличаване/ограничаване ще бъде съобщено на
                    съответните получатели, освен ако това е невъзможно или
                    изисква прекомерни усилия. По искане на Потребителя
                    Собственикът ще информира за тези получатели.
                  </p>
                </section>

                <section id="additional-info" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Допълнителна информация относно събирането и обработването
                    на Данни
                  </h2>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Съдебен иск
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Личните данни на Потребителя могат да бъдат използвани за
                    правни цели от Собственика в съда или в етапите, водещи до
                    съдебен иск, произтичащ от неправилно използване на това
                    приложение или свързаните услуги. Собственикът може да бъде
                    задължен да разкрие лични данни по искане на публични
                    органи.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Допълнителна информация за Потребителя
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    В допълнение към информацията, съдържаща се в тази политика,
                    това приложение може да предоставя допълнителна и
                    контекстуална информация относно конкретни услуги или
                    събирането/обработването на Лични данни при поискване.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Системни дневници и поддръжка
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    За целите на функционирането и поддръжката, това приложение
                    и услугите на трети страни могат да събират файлове
                    (системни дневници), които записват взаимодействия с
                    приложението, или да използват други Лични данни (като IP
                    адрес) за тази цел.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Информация, която не се съдържа тук
                  </h3>
                  <p className="text-muted-foreground">
                    Повече подробности относно събирането или обработването на
                    Лични данни могат да бъдат поискани от Собственика по всяко
                    време на горепосочения имейл.
                  </p>
                </section>

                <section id="policy-changes" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Промени в тази Политика за поверителност
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Собственикът си запазва правото да прави промени в тази
                    Политика за поверителност по всяко време, като уведомява
                    Потребителите на тази страница и евентуално в приложението
                    и/или, доколкото е технически и правно осъществимо, изпраща
                    известие чрез наличните данни за контакт. Препоръчваме да
                    проверявате страницата често, като се позовавате на датата
                    на последната модификация, посочена по-долу.
                  </p>
                  <p className="text-muted-foreground">
                    Ако промените засягат обработване, извършвано въз основа на
                    съгласие, Собственикът ще събере ново съгласие от
                    Потребителя, когато е необходимо.
                  </p>
                </section>

                <section id="definitions" className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Определения и правни препратки
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>Лични данни (или Данни):</strong> Всяка
                      информация, която пряко или косвено позволява
                      идентифициране на физическо лице.
                    </p>
                    <p>
                      <strong>Данни за използване:</strong> Информация, събирана
                      автоматично (IP адрес, идентификатори, време на заявка,
                      използван браузър/операционна система, прекарано време и
                      др.).
                    </p>
                    <p>
                      <strong>Потребител:</strong> Лицето, използващо това
                      приложение и което, освен ако не е посочено друго, съвпада
                      със Субекта на данните.
                    </p>
                    <p>
                      <strong>Субект на данни:</strong> Физическото лице, за
                      което се отнасят Личните данни.
                    </p>
                    <p>
                      <strong>Обработващ лични данни:</strong> Лице/организация,
                      което обработва Лични данни от името на Администратора.
                    </p>
                    <p>
                      <strong>Администратор на данни (Собственик):</strong>{' '}
                      Лице/организация, което определя целите и средствата за
                      обработването на Лични данни. Освен ако не е посочено
                      друго, това е Собственикът на приложението.
                    </p>
                    <p>
                      <strong>Това приложение:</strong> Средствата, чрез които
                      се събират и обработват Лични данни на Потребителя.
                    </p>
                    <p>
                      <strong>Услугата:</strong> Услугата, предоставяна от това
                      приложение, както е описано в относителните условия и/или
                      на този сайт.
                    </p>
                    <p>
                      <strong>Европейски съюз (ЕС):</strong> Позоваванията
                      включват всички настоящи държави - членки на ЕС и
                      Европейското икономическо пространство.
                    </p>
                  </div>
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
