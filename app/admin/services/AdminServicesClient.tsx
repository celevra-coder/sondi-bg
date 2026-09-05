"use client";

import {
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase-browser";

type Status =
  | "pending"
  | "approved"
  | "hidden"
  | "rejected";

type ServiceRequest = {
  id: string;
  service: string;
  region: string;
  locality: string | null;
  desired_period: string | null;
  estimated_depth: string | null;
  machine_access: string | null;
  description: string;
  contact_phone: string | null;
  contact_email: string | null;
  status: Status;
  created_at: string;
};

type ServiceProvider = {
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
  status: Status;
  created_at: string;
};

type ProviderMedia = {
  id: string;
  provider_id: string;
  media_type: "image" | "video";
  storage_path: string;
  caption: string | null;
  sort_order: number;
  status: Status;
  created_at: string;
  preview_url: string;
};

type Tab =
  | "requests"
  | "providers";

const T = {
  eyebrow:
    "\u0410\u0414\u041c\u0418\u041d \u041f\u0410\u041d\u0415\u041b",
  title:
    "\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043d\u0430 \u0443\u0441\u043b\u0443\u0433\u0438\u0442\u0435",
  subtitle:
    "\u041f\u0440\u0435\u0433\u043b\u0435\u0434 \u0438 \u043e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u0435 \u043d\u0430 \u043a\u043b\u0438\u0435\u043d\u0442\u0441\u043a\u0438 \u0437\u0430\u044f\u0432\u043a\u0438 \u0438 \u043f\u0440\u043e\u0444\u0438\u043b\u0438 \u043d\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b\u0438.",
  requests:
    "\u0417\u0430\u044f\u0432\u043a\u0438 \u043e\u0442 \u043a\u043b\u0438\u0435\u043d\u0442\u0438",
  providers:
    "\u041f\u0440\u043e\u0444\u0438\u043b\u0438 \u043d\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b\u0438",
  logout:
    "\u0418\u0437\u0445\u043e\u0434",
  pending:
    "\u0427\u0430\u043a\u0430",
  approved:
    "\u041e\u0434\u043e\u0431\u0440\u0435\u043d\u043e",
  hidden:
    "\u0421\u043a\u0440\u0438\u0442\u043e",
  rejected:
    "\u041e\u0442\u0445\u0432\u044a\u0440\u043b\u0435\u043d\u043e",
  approve:
    "\u041e\u0434\u043e\u0431\u0440\u0438",
  hide:
    "\u0421\u043a\u0440\u0438\u0439",
  reject:
    "\u041e\u0442\u0445\u0432\u044a\u0440\u043b\u0438",
  processing:
    "\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430...",
  noRequests:
    "\u041d\u044f\u043c\u0430 \u043f\u043e\u0434\u0430\u0434\u0435\u043d\u0438 \u0437\u0430\u044f\u0432\u043a\u0438.",
  noProviders:
    "\u041d\u044f\u043c\u0430 \u043f\u043e\u0434\u0430\u0434\u0435\u043d\u0438 \u043f\u0440\u043e\u0444\u0438\u043b\u0438.",
  region:
    "\u041e\u0431\u043b\u0430\u0441\u0442",
  locality:
    "\u041d\u0430\u0441\u0435\u043b\u0435\u043d\u043e \u043c\u044f\u0441\u0442\u043e",
  period:
    "\u0416\u0435\u043b\u0430\u043d \u043f\u0435\u0440\u0438\u043e\u0434",
  depth:
    "\u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430",
  machine:
    "\u0414\u043e\u0441\u0442\u044a\u043f \u0437\u0430 \u043c\u0430\u0448\u0438\u043d\u0430",
  description:
    "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
  contact:
    "\u041a\u043e\u043d\u0442\u0430\u043a\u0442",
  services:
    "\u0423\u0441\u043b\u0443\u0433\u0438",
  regions:
    "\u0420\u0430\u0431\u043e\u0442\u043d\u0438 \u043e\u0431\u043b\u0430\u0441\u0442\u0438",
  nationwide:
    "\u0426\u044f\u043b\u0430 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f",
  maxDepth:
    "\u041c\u0430\u043a\u0441. \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430",
  diameters:
    "\u0414\u0438\u0430\u043c\u0435\u0442\u0440\u0438",
  method:
    "\u041c\u0435\u0442\u043e\u0434",
  equipment:
    "\u0422\u0435\u0445\u043d\u0438\u043a\u0430",
  presentation:
    "\u041f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u044f\u043d\u0435",
  created:
    "\u041f\u043e\u0434\u0430\u0434\u0435\u043d\u043e",
  error:
    "\u0413\u0440\u0435\u0448\u043a\u0430",
};

const STATUS_LABEL: Record<
  Status,
  string
> = {
  pending: T.pending,
  approved: T.approved,
  hidden: T.hidden,
  rejected: T.rejected,
};

function statusClass(
  status: Status
) {
  if (status === "approved") {
    return "border-[#b9ddcf] bg-[#eef8f4] text-[#176344]";
  }

  if (status === "rejected") {
    return "border-[#efcccc] bg-[#fff5f5] text-[#974646]";
  }

  if (status === "hidden") {
    return "border-[#dedede] bg-[#f5f5f5] text-[#666]";
  }

  return "border-[#efdca9] bg-[#fff9e9] text-[#80651e]";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "bg-BG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

export default function AdminServicesClient({
  initialRequests,
  initialProviders,
  initialMedia,
  initialError,
}: {
  initialRequests: ServiceRequest[];
  initialProviders: ServiceProvider[];
  initialMedia: ProviderMedia[];
  initialError: string;
}) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [tab, setTab] =
    useState<Tab>("requests");

  const [requests, setRequests] =
    useState(initialRequests);

  const [providers, setProviders] =
    useState(initialProviders);

  const [busyId, setBusyId] =
    useState("");

  const [media, setMedia] =
    useState(initialMedia);

  const [error, setError] =
    useState(initialError);

  const pendingRequests =
    requests.filter(
      item =>
        item.status === "pending"
    ).length;

  const pendingProviders =
    providers.filter(
      item =>
        item.status === "pending"
    ).length;

  async function updateStatus(
    kind: "request" | "provider",
    id: string,
    status: Status
  ) {
    setBusyId(id);
    setError("");

    const table =
      kind === "request"
        ? "service_requests"
        : "service_providers";

    const { error } = await supabase
      .from(table)
      .update({ status })
      .eq("id", id);

    setBusyId("");

    if (error) {
      console.error(
        "admin services update error",
        error
      );
      setError(error.message);
      return;
    }

    if (kind === "request") {
      setRequests(current =>
        current.map(item =>
          item.id === id
            ? { ...item, status }
            : item
        )
      );
    } else {
      setProviders(current =>
        current.map(item =>
          item.id === id
            ? { ...item, status }
            : item
        )
      );
    }
  }

  async function updateMediaStatus(
    id: string,
    status: Status
  ) {
    setBusyId(id);
    setError("");

    const { error } =
      await supabase
        .from("service_provider_media")
        .update({ status })
        .eq("id", id);

    setBusyId("");

    if (error) {
      console.error(
        "admin provider media update error",
        error
      );

      setError(error.message);
      return;
    }

    setMedia(current =>
      current.map(item =>
        item.id === id
          ? { ...item, status }
          : item
      )
    );
  }

  function mediaActions(
    id: string,
    status: Status
  ) {
    const disabled =
      busyId === id;

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={
            disabled ||
            status === "approved"
          }
          onClick={() =>
            void updateMediaStatus(
              id,
              "approved"
            )
          }
          className="rounded-lg bg-[#16825c] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {disabled
            ? T.processing
            : T.approve}
        </button>

        <button
          type="button"
          disabled={
            disabled ||
            status === "hidden"
          }
          onClick={() =>
            void updateMediaStatus(
              id,
              "hidden"
            )
          }
          className="rounded-lg border border-[#cfdadd] bg-white px-3 py-2 text-xs font-bold text-[#496168] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {T.hide}
        </button>

        <button
          type="button"
          disabled={
            disabled ||
            status === "rejected"
          }
          onClick={() =>
            void updateMediaStatus(
              id,
              "rejected"
            )
          }
          className="rounded-lg border border-[#eccccc] bg-[#fffafa] px-3 py-2 text-xs font-bold text-[#a34242] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {T.reject}
        </button>
      </div>
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href =
      "/admin/login";
  }

  function actions(
    kind: "request" | "provider",
    id: string,
    status: Status
  ) {
    const disabled =
      busyId === id;

    return (
      <div className="mt-5 flex flex-wrap gap-2 border-t border-[#e4edef] pt-5">
        <button
          type="button"
          disabled={
            disabled ||
            status === "approved"
          }
          onClick={() =>
            void updateStatus(
              kind,
              id,
              "approved"
            )
          }
          className="rounded-xl bg-[#16825c] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#126d4d] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {disabled
            ? T.processing
            : T.approve}
        </button>

        <button
          type="button"
          disabled={
            disabled ||
            status === "hidden"
          }
          onClick={() =>
            void updateStatus(
              kind,
              id,
              "hidden"
            )
          }
          className="rounded-xl border border-[#cfdadd] bg-white px-4 py-2.5 text-sm font-bold text-[#496168] transition hover:bg-[#f4f8f9] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {T.hide}
        </button>

        <button
          type="button"
          disabled={
            disabled ||
            status === "rejected"
          }
          onClick={() =>
            void updateStatus(
              kind,
              id,
              "rejected"
            )
          }
          className="rounded-xl border border-[#eccccc] bg-[#fffafa] px-4 py-2.5 text-sm font-bold text-[#a34242] transition hover:bg-[#fff2f2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {T.reject}
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2f7f8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[30px] border border-[#d9e7e9] bg-white p-6 shadow-[0_20px_70px_rgba(20,63,73,.07)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#56858e]">
                {T.eyebrow}
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#173f48] sm:text-4xl">
                {T.title}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6a8187]">
                {T.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void logout()
              }
              className="rounded-xl border border-[#d3e0e2] bg-white px-4 py-2.5 text-sm font-bold text-[#536d74]"
            >
              {T.logout}
            </button>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                setTab("requests")
              }
              className={
                "rounded-2xl px-5 py-3 text-sm font-bold transition " +
                (
                  tab === "requests"
                    ? "bg-[#173f48] text-white"
                    : "bg-[#f5f9fa] text-[#45616a]"
                )
              }
            >
              {T.requests}
              {" ("}
              {pendingRequests}
              {")"}
            </button>

            <button
              type="button"
              onClick={() =>
                setTab("providers")
              }
              className={
                "rounded-2xl px-5 py-3 text-sm font-bold transition " +
                (
                  tab === "providers"
                    ? "bg-[#173f48] text-white"
                    : "bg-[#f5f9fa] text-[#45616a]"
                )
              }
            >
              {T.providers}
              {" ("}
              {pendingProviders}
              {")"}
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-[#efcccc] bg-[#fff5f5] px-5 py-4 text-sm font-semibold text-[#974646]">
            {T.error}
            {": "}
            {error}
          </div>
        )}

        {tab === "requests" && (
          <section className="mt-6 grid gap-5">
            {requests.length === 0 ? (
              <div className="rounded-[26px] border border-[#d9e7e9] bg-white p-10 text-center text-[#6a8187]">
                {T.noRequests}
              </div>
            ) : (
              requests.map(item => (
                <article
                  key={item.id}
                  className="rounded-[26px] border border-[#d9e7e9] bg-white p-6 shadow-sm sm:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#173f48]">
                        {item.service}
                      </h2>

                      <div className="mt-2 text-sm font-semibold text-[#426970]">
                        {item.region}
                        {item.locality
                          ? ` / ${item.locality}`
                          : ""}
                      </div>
                    </div>

                    <span
                      className={
                        "rounded-full border px-3 py-1.5 text-xs font-bold " +
                        statusClass(
                          item.status
                        )
                      }
                    >
                      {
                        STATUS_LABEL[
                          item.status
                        ]
                      }
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {item.desired_period && (
                      <div className="rounded-xl bg-[#f6fafb] p-3 text-sm">
                        <div className="text-xs font-bold text-[#789096]">
                          {T.period}
                        </div>
                        <div className="mt-1 text-[#405c63]">
                          {item.desired_period}
                        </div>
                      </div>
                    )}

                    {item.estimated_depth && (
                      <div className="rounded-xl bg-[#f6fafb] p-3 text-sm">
                        <div className="text-xs font-bold text-[#789096]">
                          {T.depth}
                        </div>
                        <div className="mt-1 text-[#405c63]">
                          {item.estimated_depth}
                        </div>
                      </div>
                    )}

                    {item.machine_access && (
                      <div className="rounded-xl bg-[#f6fafb] p-3 text-sm">
                        <div className="text-xs font-bold text-[#789096]">
                          {T.machine}
                        </div>
                        <div className="mt-1 text-[#405c63]">
                          {item.machine_access}
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl bg-[#f6fafb] p-3 text-sm">
                      <div className="text-xs font-bold text-[#789096]">
                        {T.created}
                      </div>
                      <div className="mt-1 text-[#405c63]">
                        {formatDate(
                          item.created_at
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                      {T.description}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4d686f]">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl bg-[#eef7f4] p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#54766d]">
                      {T.contact}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                      {item.contact_phone && (
                        <a
                          href={`tel:${item.contact_phone}`}
                          className="font-bold text-[#167454]"
                        >
                          {item.contact_phone}
                        </a>
                      )}

                      {item.contact_email && (
                        <a
                          href={`mailto:${item.contact_email}`}
                          className="font-semibold text-[#356b76]"
                        >
                          {item.contact_email}
                        </a>
                      )}
                    </div>
                  </div>

                  {actions(
                    "request",
                    item.id,
                    item.status
                  )}
                </article>
              ))
            )}
          </section>
        )}

        {tab === "providers" && (
          <section className="mt-6 grid gap-5">
            {providers.length === 0 ? (
              <div className="rounded-[26px] border border-[#d9e7e9] bg-white p-10 text-center text-[#6a8187]">
                {T.noProviders}
              </div>
            ) : (
              providers.map(item => (
                <article
                  key={item.id}
                  className="rounded-[26px] border border-[#d9e7e9] bg-white p-6 shadow-sm sm:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#173f48]">
                        {item.company_name}
                      </h2>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <a
                          href={`tel:${item.phone}`}
                          className="font-bold text-[#167454]"
                        >
                          {item.phone}
                        </a>

                        {item.email && (
                          <a
                            href={`mailto:${item.email}`}
                            className="font-semibold text-[#356b76]"
                          >
                            {item.email}
                          </a>
                        )}

                        {item.website_or_facebook && (
                          <span className="font-semibold text-[#356b76]">
                            {item.website_or_facebook}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={
                        "rounded-full border px-3 py-1.5 text-xs font-bold " +
                        statusClass(
                          item.status
                        )
                      }
                    >
                      {
                        STATUS_LABEL[
                          item.status
                        ]
                      }
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                      {T.regions}
                    </div>

                    <div className="mt-2 text-sm font-semibold text-[#426970]">
                      {item.works_nationwide
                        ? T.nationwide
                        : item.work_regions.join(
                            ", "
                          )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                      {T.services}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.services.map(
                        (
                          service,
                          index
                        ) => (
                          <span
                            key={`${item.id}-${index}`}
                            className="rounded-full border border-[#d6e5e1] bg-[#f7fbfa] px-3 py-1.5 text-xs font-semibold text-[#466860]"
                          >
                            {service}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {item.max_depth && (
                      <div className="rounded-xl bg-[#f6fafb] p-3 text-sm">
                        <div className="text-xs font-bold text-[#789096]">
                          {T.maxDepth}
                        </div>
                        <div className="mt-1 text-[#405c63]">
                          {item.max_depth}
                        </div>
                      </div>
                    )}

                    {item.diameters && (
                      <div className="rounded-xl bg-[#f6fafb] p-3 text-sm">
                        <div className="text-xs font-bold text-[#789096]">
                          {T.diameters}
                        </div>
                        <div className="mt-1 text-[#405c63]">
                          {item.diameters}
                        </div>
                      </div>
                    )}

                    {item.drilling_method && (
                      <div className="rounded-xl bg-[#f6fafb] p-3 text-sm">
                        <div className="text-xs font-bold text-[#789096]">
                          {T.method}
                        </div>
                        <div className="mt-1 text-[#405c63]">
                          {item.drilling_method}
                        </div>
                      </div>
                    )}

                    {item.equipment && (
                      <div className="rounded-xl bg-[#f6fafb] p-3 text-sm">
                        <div className="text-xs font-bold text-[#789096]">
                          {T.equipment}
                        </div>
                        <div className="mt-1 text-[#405c63]">
                          {item.equipment}
                        </div>
                      </div>
                    )}
                  </div>

                  {item.presentation && (
                    <div className="mt-5">
                      <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                        {T.presentation}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4d686f]">
                        {item.presentation}
                      </p>
                    </div>
                  )}

                  {media.some(
                    mediaItem =>
                      mediaItem.provider_id ===
                      item.id
                  ) && (
                    <div className="mt-6 border-t border-[#e4edef] pt-5">
                      <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#789096]">
                        {"\u0421\u041d\u0418\u041c\u041a\u0418 \u0418 \u0412\u0418\u0414\u0415\u041e"}
                      </div>

                      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {media
                          .filter(
                            mediaItem =>
                              mediaItem.provider_id ===
                              item.id
                          )
                          .map(
                            mediaItem => (
                              <div
                                key={
                                  mediaItem.id
                                }
                                className="overflow-hidden rounded-2xl border border-[#d9e7e9] bg-[#f7fafb]"
                              >
                                <div className="aspect-video bg-[#dfeaec]">
                                  {mediaItem.preview_url ? (
                                    mediaItem.media_type ===
                                    "image" ? (
                                      <img
                                        src={
                                          mediaItem.preview_url
                                        }
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <video
                                        src={
                                          mediaItem.preview_url
                                        }
                                        controls
                                        preload="metadata"
                                        className="h-full w-full bg-black object-contain"
                                      />
                                    )
                                  ) : (
                                    <div className="flex h-full items-center justify-center px-4 text-center text-xs text-[#71878d]">
                                      {"\u041f\u0440\u0435\u0433\u043b\u0435\u0434\u044a\u0442 \u043d\u0435 \u0435 \u043d\u0430\u043b\u0438\u0447\u0435\u043d"}
                                    </div>
                                  )}
                                </div>

                                <div className="p-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <span
                                      className={
                                        "rounded-full border px-2.5 py-1 text-[11px] font-bold " +
                                        statusClass(
                                          mediaItem.status
                                        )
                                      }
                                    >
                                      {
                                        STATUS_LABEL[
                                          mediaItem.status
                                        ]
                                      }
                                    </span>

                                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#789096]">
                                      {mediaItem.media_type ===
                                      "image"
                                        ? "\u0421\u043d\u0438\u043c\u043a\u0430"
                                        : "\u0412\u0438\u0434\u0435\u043e"}
                                    </span>
                                  </div>

                                  {mediaActions(
                                    mediaItem.id,
                                    mediaItem.status
                                  )}
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 text-xs text-[#789096]">
                    {T.created}
                    {": "}
                    {formatDate(
                      item.created_at
                    )}
                  </div>

                  {actions(
                    "provider",
                    item.id,
                    item.status
                  )}
                </article>
              ))
            )}
          </section>
        )}
      </div>
    </main>
  );
}
