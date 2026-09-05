import Link from "next/link";

export const metadata = {
  title: "Политика за бисквитки | SONDI.BG",
  description:
    "Информация за използваните бисквитки и сходни технологии в SONDI.BG.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#173f48]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#526c73]">
        {children}
      </div>
    </section>
  );
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#f3f9fa] px-4 py-12 sm:px-6 sm:py-16">
      <article className="mx-auto max-w-4xl rounded-[32px] border border-[#d8e8ea] bg-white px-6 py-9 shadow-[0_24px_80px_rgba(25,74,82,.08)] sm:px-10 sm:py-12 lg:px-14">
        <div className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#56858e]">
          SONDI.BG
        </div>

        <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[#153943] sm:text-5xl">
          Политика за бисквитки
        </h1>

        <p className="mt-5 text-sm text-[#71878d]">
          Последна актуализация: 6 септември 2026 г.
        </p>

        <div className="mt-8 rounded-2xl border border-[#d9e9e5] bg-[#f2f8f6] p-5 text-[15px] leading-7 text-[#46645c]">
          Тази политика обяснява как SONDI.BG използва бисквитки,
          local storage и сходни технологии за работа на сайта,
          удостоверяване, сигурност и потребителски сесии.
        </div>

        <Section title="1. Какво представляват бисквитките">
          <p>
            Бисквитките са малки файлове, които браузърът може да
            съхранява на устройството на потребителя. Те могат да се
            използват за поддържане на сесии, запомняне на настройки,
            сигурност и други технически функции.
          </p>
        </Section>

        <Section title="2. Какви технологии използва SONDI.BG">
          <p>
            SONDI.BG може да използва технически необходими бисквитки,
            local storage, session storage и сходни механизми, когато
            това е необходимо за:
          </p>

          <ul className="list-disc space-y-2 pl-6">
            <li>вход и поддържане на потребителска сесия;</li>
            <li>защита на акаунти и предотвратяване на злоупотреби;</li>
            <li>запомняне на технически настройки;</li>
            <li>работа на интерактивни функции и картата;</li>
            <li>осигуряване на стабилност и сигурност на платформата.</li>
          </ul>
        </Section>

        <Section title="3. Задължителни бисквитки">
          <p>
            Технически необходимите бисквитки могат да се използват без
            отделно съгласие, когато са строго необходими за предоставяне
            на услуга, поискана от потребителя, или за сигурната работа
            на сайта.
          </p>
        </Section>

        <Section title="4. Аналитични и маркетингови технологии">
          <p>
            Към момента SONDI.BG не заявява използване на незадължителни
            аналитични или маркетингови бисквитки на тази страница.
          </p>

          <p>
            Ако в бъдеще бъдат добавени такива технологии, информацията
            тук и механизмът за управление на съгласие ще бъдат
            актуализирани, когато това е необходимо.
          </p>
        </Section>

        <Section title="5. Външни услуги">
          <p>
            Някои функции на платформата могат да използват външни
            доставчици, например за удостоверяване, хостинг или
            техническа инфраструктура. Тези доставчици могат да използват
            собствени технически идентификатори според приложимите им
            политики.
          </p>
        </Section>

        <Section title="6. Управление на бисквитките">
          <p>
            Потребителят може да управлява или изтрива бисквитки чрез
            настройките на своя браузър. Ограничаването на технически
            необходими бисквитки може да доведе до неправилна работа на
            входа, акаунта или други функции.
          </p>
        </Section>

        <Section title="7. Промени">
          <p>
            Политиката може да бъде актуализирана при промяна на
            използваните технологии или функционалности на SONDI.BG.
          </p>
        </Section>

        <Section title="8. Контакт">
          <p>
            Въпроси относно тази политика могат да бъдат изпращани на:
          </p>

          <p>
            <a
              href="mailto:info@sondi.bg"
              className="font-semibold text-[#167454] underline"
            >
              info@sondi.bg
            </a>
          </p>
        </Section>

        <div className="mt-12 border-t border-[#e0eaec] pt-6 text-sm text-[#71878d]">
          Вижте също{" "}
          <Link
            href="/privacy"
            className="font-semibold text-[#356b76] underline"
          >
            Политика за поверителност
          </Link>
          .
        </div>
      </article>
    </main>
  );
}