export const metadata = {
  title: "Контакти | SONDI.BG",
  description: "Контакти за въпроси относно платформата SONDI.BG, данните и техническата поддръжка.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f8fbfc] text-[#153943]">
      <section className="border-b border-[#d7e9ed] bg-[#e5f5f8]">
        <div className="mx-auto max-w-[1180px] px-7 py-24 lg:px-10">
          <div className="max-w-4xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#438594]">
              SONDI.BG
            </div>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">
              Контакти
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#5f7b82]">
              За въпроси относно платформата, използваните данни, технически проблеми или други запитвания можете да се свържете с нас по имейл.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-20 lg:px-10">
        <div className="max-w-3xl rounded-[26px] border border-[#d8e7ea] bg-white p-8 md:p-10">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5b949f]">
            ИМЕЙЛ
          </div>

          <div className="mt-4 text-2xl font-semibold">
            info@sondi.bg
          </div>

          <p className="mt-5 leading-8 text-[#637d84]">
            Използвайте този адрес за общи въпроси, сигнали за данни, предложения, партньорства и техническа поддръжка.
          </p>
        </div>
      </section>
    </main>
  );
}