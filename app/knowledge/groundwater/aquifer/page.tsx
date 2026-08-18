import Link from "next/link";

export default function AquiferPage() {
  return (
    <main className="min-h-screen bg-white text-[#173d47]">
      <section className="bg-[#e5f5f8]">
        <div className="mx-auto max-w-[980px] px-7 pb-16 pt-16">
          <Link
            href="/knowledge/groundwater"
            className="text-sm text-[#4e8795] hover:text-[#173d47]"
          >
            ← Подземни води
          </Link>

          <div className="mt-10 text-xs font-medium uppercase tracking-[0.25em] text-[#438594]">
            Основи · 02
          </div>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.05em]">
            Какво е
            <br />
            водоносен пласт?
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-[#53747c]">
            Водоносният пласт е геоложка среда, която може
            едновременно да съдържа вода и да позволява тя
            да се движи през нея.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-7 py-16">

        <section>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Не е достатъчно една скала просто да съдържа вода
          </h2>

          <div className="mt-6 space-y-5 text-[17px] leading-8 text-[#536f76]">
            <p>
              Почти всяка геоложка среда може да съдържа известно
              количество вода. Но за да бъде практично водоносна,
              тя трябва да позволява тази вода да се движи
              и да постъпва към кладенец, сондаж или извор.
            </p>

            <p>
              Затова две свойства са особено важни:
              колко свободно пространство има за вода и колко
              добре тези пространства са свързани помежду си.
            </p>
          </div>
        </section>

        <div className="my-12 grid gap-4 md:grid-cols-2">
          <div className="bg-[#edf8fa] p-7">
            <div className="text-xl font-semibold">
              Порьозност
            </div>
            <p className="mt-3 leading-7 text-[#5e7880]">
              Показва колко празни пространства има в материала,
              в които може да се намира вода.
            </p>
          </div>

          <div className="bg-[#edf8fa] p-7">
            <div className="text-xl font-semibold">
              Пропускливост
            </div>
            <p className="mt-3 leading-7 text-[#5e7880]">
              Показва доколко тези пространства са свързани
              и позволяват на водата да преминава през тях.
            </p>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Пясъкът и глината показват разликата много добре
          </h2>

          <p className="mt-6 text-[17px] leading-8 text-[#536f76]">
            Глината може да съдържа значително количество вода,
            но тя се движи през нея много трудно. Чистият пясък
            или чакълът обикновено позволяват много по-лесно
            движение на водата и затова могат да бъдат добри
            водоносни среди.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Свободен и напорен водоносен хоризонт
          </h2>

          <div className="mt-8 space-y-4">
            <div className="border-l-4 border-[#5a9dab] bg-[#f5fafb] p-6">
              <strong>Свободен водоносен хоризонт</strong>
              <p className="mt-2 leading-7 text-[#5d777e]">
                Горната част на наситената зона не е ограничена
                от непропусклив пласт. Нивото му може сравнително
                пряко да реагира на подхранване и суша.
              </p>
            </div>

            <div className="border-l-4 border-[#3f7480] bg-[#f5fafb] p-6">
              <strong>Напорен водоносен хоризонт</strong>
              <p className="mt-2 leading-7 text-[#5d777e]">
                Водоносният пласт е ограничен от по-слабо
                пропускливи слоеве и водата в него е под налягане.
                При сондиране нивото може да се издигне над
                дълбочината, на която пластът е пресечен.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-14 border-l-4 border-[#2c8498] bg-[#edf8fa] p-7">
          <strong>За сондажите това е особено важно</strong>
          <p className="mt-2 leading-7 text-[#5b767d]">
            Дебитът зависи не само от наличието на вода,
            а и от способността на водоносния пласт да доставя
            вода към сондажа по време на изпомпване.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 border-t border-[#dce8ea] pt-8">
          <Link
            href="/knowledge/groundwater/what-is-groundwater"
            className="text-sm text-[#56818b]"
          >
            ← Какво е подземна вода?
          </Link>

          <Link
            href="/knowledge/groundwater/groundwater-body"
            className="text-right text-sm font-semibold text-[#257589]"
          >
            Какво е подземно водно тяло? →
          </Link>
        </div>
      </article>
    </main>
  );
}