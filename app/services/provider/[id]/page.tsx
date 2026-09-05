import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

type Provider = {
  id: string;
  company_name: string;
  phone: string;
  email: string | null;
  website_or_facebook: string | null;
  services: string[];
  work_regions: string[];
  works_nationwide: boolean;
  max_depth: string | null;
  diameters: string | null;
  drilling_method: string | null;
  equipment: string | null;
  presentation: string | null;
};

type ProviderMedia = {
  id: string;
  media_type: "image" | "video";
  storage_path: string;
  caption: string | null;
  sort_order: number;
  preview_url?: string;
};

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } =
    await supabase
      .from("service_providers")
      .select(
        "id, company_name, phone, email, website_or_facebook, services, work_regions, works_nationwide, max_depth, diameters, drilling_method, equipment, presentation"
      )
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const provider = data as Provider;

  const { data: mediaData } =
    await supabase
      .from("service_provider_media")
      .select(
        "id, media_type, storage_path, caption, sort_order"
      )
      .eq("provider_id", provider.id)
      .eq("status", "approved")
      .order("sort_order", {
        ascending: true,
      });

  const media =
    await Promise.all(
      ((mediaData || []) as ProviderMedia[]).map(
        async item => {
          const { data: signed } =
            await supabase.storage
              .from("provider-media")
              .createSignedUrl(
                item.storage_path,
                3600
              );

          return {
            ...item,
            preview_url:
              signed?.signedUrl || "",
          };
        }
      )
    );

  return (
    <main className="min-h-screen bg-[#f2f7f8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/services?tab=find"
          className="inline-flex rounded-xl border border-[#d5e4e7] bg-white px-4 py-2.5 text-sm font-bold text-[#45636b]"
        >
          {"\u2190 \u041d\u0430\u0437\u0430\u0434 \u043a\u044a\u043c \u0442\u044a\u0440\u0441\u0430\u0447\u043a\u0430\u0442\u0430"}
        </Link>

        <section className="mt-5 overflow-hidden rounded-[30px] border border-[#d9e7e9] bg-white shadow-[0_20px_70px_rgba(20,63,73,.08)]">
          <header className="border-b border-[#e2ecee] bg-[#f7fbfb] p-6 sm:p-8">
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#56858e]">
              {"\u0418\u0417\u041f\u042a\u041b\u041d\u0418\u0422\u0415\u041b"}
            </div>

            <h1 className="mt-2 text-3xl font-bold text-[#173f48] sm:text-4xl">
              {provider.company_name}
            </h1>

            <div className="mt-3 inline-flex rounded-full border border-[#b9ddcf] bg-[#eef8f4] px-3 py-1.5 text-xs font-bold text-[#176344]">
              {"\u041e\u0434\u043e\u0431\u0440\u0435\u043d \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b"}
            </div>
          </header>

          <div className="p-6 sm:p-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                {"\u0423\u0441\u043b\u0443\u0433\u0438"}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {provider.services.map(
                  (service, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-[#d4e5e1] bg-[#f7fbfa] px-3 py-1.5 text-sm font-semibold text-[#456761]"
                    >
                      {service}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f6fafb] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                  {"\u0420\u0430\u0439\u043e\u043d \u043d\u0430 \u0440\u0430\u0431\u043e\u0442\u0430"}
                </div>

                <div className="mt-2 font-semibold text-[#405c63]">
                  {provider.works_nationwide
                    ? "\u0426\u044f\u043b\u0430 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f"
                    : provider.work_regions.join(", ")}
                </div>
              </div>

              {provider.max_depth && (
                <div className="rounded-2xl bg-[#f6fafb] p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                    {"\u041c\u0430\u043a\u0441. \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430"}
                  </div>
                  <div className="mt-2 font-semibold text-[#405c63]">
                    {provider.max_depth}
                  </div>
                </div>
              )}

              {provider.diameters && (
                <div className="rounded-2xl bg-[#f6fafb] p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                    {"\u0414\u0438\u0430\u043c\u0435\u0442\u0440\u0438"}
                  </div>
                  <div className="mt-2 font-semibold text-[#405c63]">
                    {provider.diameters}
                  </div>
                </div>
              )}

              {provider.drilling_method && (
                <div className="rounded-2xl bg-[#f6fafb] p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                    {"\u041c\u0435\u0442\u043e\u0434 \u043d\u0430 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435"}
                  </div>
                  <div className="mt-2 font-semibold text-[#405c63]">
                    {provider.drilling_method}
                  </div>
                </div>
              )}
            </div>

            {provider.equipment && (
              <div className="mt-7">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                  {"\u0422\u0435\u0445\u043d\u0438\u043a\u0430"}
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4d686f]">
                  {provider.equipment}
                </p>
              </div>
            )}

            {provider.presentation && (
              <div className="mt-7">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                  {"\u041f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u044f\u043d\u0435"}
                </div>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#4d686f]">
                  {provider.presentation}
                </p>
              </div>
            )}

            {media.length > 0 && (
              <div className="mt-8 border-t border-[#e2ecee] pt-7">
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                  {"\u0421\u043d\u0438\u043c\u043a\u0438 \u0438 \u0432\u0438\u0434\u0435\u043e"}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {media.map(item => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-[#d9e7e9] bg-[#f7fafb]"
                    >
                      <div className="aspect-video bg-[#dfeaec]">
                        {item.preview_url ? (
                          item.media_type === "image" ? (
                            <img
                              src={item.preview_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <video
                              src={item.preview_url}
                              controls
                              preload="metadata"
                              className="h-full w-full bg-black object-contain"
                            />
                          )
                        ) : null}
                      </div>

                      {item.caption && (
                        <div className="p-3 text-sm text-[#526d74]">
                          {item.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-[#e2ecee] pt-7">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                {"\u041a\u043e\u043d\u0442\u0430\u043a\u0442"}
              </div>

              {user ? (
                <div className="mt-4 rounded-2xl bg-[#eef7f4] p-5">
                  <div className="flex flex-wrap gap-5 text-sm">
                    <a
                      href={`tel:${provider.phone}`}
                      className="font-bold text-[#167454]"
                    >
                      {provider.phone}
                    </a>

                    {provider.email && (
                      <a
                        href={`mailto:${provider.email}`}
                        className="font-semibold text-[#356b76]"
                      >
                        {provider.email}
                      </a>
                    )}

                    {provider.website_or_facebook && (
                      <span className="font-semibold text-[#356b76]">
                        {provider.website_or_facebook}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] p-5 text-sm text-[#607980]">
                  {"\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u0438\u0442\u0435 \u0441\u0430 \u0434\u043e\u0441\u0442\u044a\u043f\u043d\u0438 \u0441\u043b\u0435\u0434 \u0432\u0445\u043e\u0434 \u0432 SONDI.BG."}

                  <div className="mt-4">
                    <Link
                      href="/login"
                      className="inline-flex rounded-xl bg-[#173f48] px-4 py-2.5 font-bold text-white"
                    >
                      {"\u0412\u0445\u043e\u0434"}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
