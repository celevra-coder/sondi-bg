"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase-browser";

type AccountType =
  | "client"
  | "provider"
  | "both";

type ServiceRequest = {
  id: string;
  owner_id: string;
  service: string;
  region: string;
  locality: string | null;
  desired_period: string | null;
  estimated_depth: string | null;
  machine_access: string | null;
  description: string;
  contact_phone: string | null;
  contact_email: string | null;
  status: string;
  created_at: string;
};

function statusLabel(status: string) {
  if (status === "approved") {
    return "\u041f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0430";
  }

  if (status === "rejected") {
    return "\u041e\u0442\u0445\u0432\u044a\u0440\u043b\u0435\u043d\u0430";
  }

  if (status === "hidden") {
    return "\u0421\u043a\u0440\u0438\u0442\u0430";
  }

  return "\u0427\u0430\u043a\u0430 \u043e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u0435";
}

function statusClasses(status: string) {
  if (status === "approved") {
    return "border-[#b7dfcf] bg-[#effaf5] text-[#176247]";
  }

  if (status === "rejected") {
    return "border-[#efb5b5] bg-[#fff1f1] text-[#a12626]";
  }

  if (status === "hidden") {
    return "border-[#d7e0e2] bg-[#f4f7f7] text-[#64777c]";
  }

  return "border-[#ead7a3] bg-[#fff8e5] text-[#87661c]";
}

function machineAccessLabel(value: string | null) {
  if (value === "yes") {
    return "\u0414\u0430";
  }

  if (value === "limited") {
    return "\u041e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d";
  }

  return "\u041d\u0435 \u0435 \u0443\u0442\u043e\u0447\u043d\u0435\u043d";
}

export default function AccountPage() {
  const supabase =
    useMemo(() => createClient(), []);

  const [loading, setLoading] =
    useState(true);

  const [email, setEmail] =
    useState("");

  const [userId, setUserId] =
    useState("");

  const [accountType, setAccountType] =
    useState<AccountType>("client");

  const [requests, setRequests] =
    useState<ServiceRequest[]>([]);

  const [requestsError, setRequestsError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        document.cookie =
          `ai_smm_auth_next=${encodeURIComponent("/account")}; path=/; max-age=3600; samesite=lax`;

        window.location.href = "/login";
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const [
        profileResult,
        requestsResult,
      ] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("account_type")
          .eq("user_id", user.id)
          .maybeSingle(),

        supabase
          .from("service_requests")
          .select(
            "id, owner_id, service, region, locality, desired_period, estimated_depth, machine_access, description, contact_phone, contact_email, status, created_at"
          )
          .eq("owner_id", user.id)
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (!active) return;

      const profile =
        profileResult.data;

      if (
        profile?.account_type === "client" ||
        profile?.account_type === "provider" ||
        profile?.account_type === "both"
      ) {
        setAccountType(
          profile.account_type
        );
      }

      if (requestsResult.error) {
        console.error(
          "own service requests load error",
          requestsResult.error
        );

        setRequestsError(
          "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0437\u0430\u0440\u0435\u0434\u0438\u043c \u0432\u0430\u0448\u0438\u0442\u0435 \u0437\u0430\u044f\u0432\u043a\u0438."
        );

        setRequests([]);
      } else {
        setRequests(
          (requestsResult.data || []) as ServiceRequest[]
        );
      }

      setLoading(false);
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function deleteRequest(
    requestId: string
  ) {
    if (!userId || deletingId) {
      return;
    }

    setDeletingId(requestId);
    setConfirmDeleteId(null);
    setRequestsError("");

    const { error } =
      await supabase
        .from("service_requests")
        .delete()
        .eq("id", requestId)
        .eq("owner_id", userId);

    setDeletingId(null);

    if (error) {
      console.error(
        "own service request delete error",
        error
      );

      setRequestsError(
        "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0438\u0437\u0442\u0440\u0438\u0435\u043c \u0437\u0430\u044f\u0432\u043a\u0430\u0442\u0430."
      );

      return;
    }

    setRequests(current =>
      current.filter(
        item => item.id !== requestId
      )
    );
  }

  const typeLabel =
    accountType === "provider"
      ? "\u041f\u0440\u0435\u0434\u043b\u0430\u0433\u0430\u043c \u0443\u0441\u043b\u0443\u0433\u0438"
      : accountType === "both"
        ? "\u0418 \u0434\u0432\u0435\u0442\u0435"
        : "\u0422\u044a\u0440\u0441\u044f \u0443\u0441\u043b\u0443\u0433\u0438";

  return (
    <main className="min-h-screen bg-[#f2f8f8] px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-5xl rounded-[30px] border border-[#d9e7e9] bg-white p-7 shadow-[0_24px_80px_rgba(20,63,73,.10)] sm:p-10">
        <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#56858e]">
          {"\u0410\u041a\u0410\u0423\u041d\u0422"}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#173f48]">
          {"\u041c\u043e\u044f\u0442 \u043f\u0440\u043e\u0444\u0438\u043b"}
        </h1>

        {loading ? (
          <div className="mt-8 text-sm text-[#6b8187]">
            {"\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435..."}
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] p-5">
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#789096]">
                  {"\u0418\u043c\u0435\u0439\u043b"}
                </div>

                <div className="mt-2 break-all font-semibold text-[#294e59]">
                  {email}
                </div>
              </div>

              <div className="rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] p-5">
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#789096]">
                  {"\u0422\u0438\u043f \u0430\u043a\u0430\u0443\u043d\u0442"}
                </div>

                <div className="mt-2 font-semibold text-[#294e59]">
                  {typeLabel}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-[#e1ecee] pt-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#56858e]">
                  {"\u0417\u0410 \u041a\u041b\u0418\u0415\u041d\u0422\u0418"}
                </div>

                <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-[#173f48]">
                  {"\u041c\u043e\u0438\u0442\u0435 \u0437\u0430\u044f\u0432\u043a\u0438"}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b8187]">
                  {"\u0422\u0443\u043a \u0432\u0438\u0436\u0434\u0430\u0442\u0435 \u0432\u0441\u0438\u0447\u043a\u0438 \u0437\u0430\u044f\u0432\u043a\u0438, \u043a\u043e\u0438\u0442\u043e \u0441\u0442\u0435 \u0438\u0437\u043f\u0440\u0430\u0442\u0438\u043b\u0438 \u043f\u0440\u0435\u0437 SONDI.BG, \u0438 \u0442\u0435\u0445\u043d\u0438\u044f \u0442\u0435\u043a\u0443\u0449 \u0441\u0442\u0430\u0442\u0443\u0441."}
                </p>
              </div>

              <a
                href="/services?tab=request"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#173f48] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102f36]"
              >
                {"\u041d\u043e\u0432\u0430 \u0437\u0430\u044f\u0432\u043a\u0430"}
              </a>
            </div>

            {requestsError && (
              <div className="mt-6 rounded-2xl border border-[#efb5b5] bg-[#fff1f1] px-4 py-3 text-sm font-semibold text-[#a12626]">
                {requestsError}
              </div>
            )}

            {!requestsError &&
              requests.length === 0 && (
                <div className="mt-6 rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] px-6 py-10 text-center">
                  <div className="font-bold text-[#294e59]">
                    {"\u0412\u0441\u0435 \u043e\u0449\u0435 \u043d\u044f\u043c\u0430\u0442\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0438 \u0437\u0430\u044f\u0432\u043a\u0438."}
                  </div>

                  <div className="mt-2 text-sm text-[#71878d]">
                    {"\u041a\u043e\u0433\u0430\u0442\u043e \u0438\u0437\u043f\u0440\u0430\u0442\u0438\u0442\u0435 \u0437\u0430\u044f\u0432\u043a\u0430, \u0442\u044f \u0449\u0435 \u0441\u0435 \u043f\u043e\u044f\u0432\u0438 \u0442\u0443\u043a."}
                  </div>
                </div>
              )}

            {requests.length > 0 && (
              <div className="mt-6 grid gap-5">
                {requests.map(item => (
                  <article
                    key={item.id}
                    className="rounded-[24px] border border-[#d9e7e9] bg-white p-5 shadow-[0_10px_35px_rgba(20,63,73,.06)] sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-[#173f48]">
                          {item.service}
                        </h3>

                        <div className="mt-1 text-sm font-semibold text-[#47727b]">
                          {item.region}
                          {item.locality
                            ? ` \u2022 ${item.locality}`
                            : ""}
                        </div>
                      </div>

                      <span
                        className={
                          "inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-bold " +
                          statusClasses(item.status)
                        }
                      >
                        {statusLabel(item.status)}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl bg-[#f7fbfb] px-4 py-3">
                        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                          {"\u0414\u0430\u0442\u0430"}
                        </div>

                        <div className="mt-1 text-sm font-semibold text-[#3d6069]">
                          {new Intl.DateTimeFormat(
                            "bg-BG",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          ).format(
                            new Date(item.created_at)
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#f7fbfb] px-4 py-3">
                        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                          {"\u0416\u0435\u043b\u0430\u043d \u043f\u0435\u0440\u0438\u043e\u0434"}
                        </div>

                        <div className="mt-1 text-sm font-semibold text-[#3d6069]">
                          {item.desired_period ||
                            "\u041d\u0435 \u0435 \u0443\u0442\u043e\u0447\u043d\u0435\u043d"}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#f7fbfb] px-4 py-3">
                        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                          {"\u0414\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430"}
                        </div>

                        <div className="mt-1 text-sm font-semibold text-[#3d6069]">
                          {item.estimated_depth ||
                            "\u041d\u0435 \u0435 \u0443\u0442\u043e\u0447\u043d\u0435\u043d\u0430"}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#f7fbfb] px-4 py-3">
                        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                          {"\u0414\u043e\u0441\u0442\u044a\u043f \u0437\u0430 \u043c\u0430\u0448\u0438\u043d\u0430"}
                        </div>

                        <div className="mt-1 text-sm font-semibold text-[#3d6069]">
                          {machineAccessLabel(
                            item.machine_access
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#e1ecee] bg-[#fbfdfd] p-4 text-sm leading-6 text-[#526e75]">
                      {item.description}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-[#e3edef] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs leading-5 text-[#789096]">
                        {"\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u0438\u0442\u0435 \u0441\u0430 \u0432\u0438\u0434\u0438\u043c\u0438 \u0441\u0430\u043c\u043e \u0437\u0430 \u0432\u043b\u0435\u0437\u043b\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043b\u0438."}
                      </div>

                      <button
                        type="button"
                        disabled={
                          deletingId === item.id
                        }
                        onClick={() =>
                          setConfirmDeleteId(
                            item.id
                          )
                        }
                        className="shrink-0 rounded-xl border border-[#e8bcbc] bg-[#fff6f6] px-4 py-2.5 text-sm font-bold text-[#a43a3a] transition hover:bg-[#ffeded] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === item.id
                          ? "\u0418\u0437\u0442\u0440\u0438\u0432\u0430\u043d\u0435..."
                          : "\u0418\u0437\u0442\u0440\u0438\u0439 \u0437\u0430\u044f\u0432\u043a\u0430\u0442\u0430"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0b2630]/55 px-4 backdrop-blur-[2px]"
          onClick={() => {
            if (!deletingId) {
              setConfirmDeleteId(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-request-title"
            className="w-full max-w-md rounded-[26px] border border-white/60 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,.25)] sm:p-7"
            onClick={event =>
              event.stopPropagation()
            }
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-2xl text-[#b83a3a]">
              !
            </div>

            <h2
              id="delete-request-title"
              className="mt-4 text-center text-xl font-bold text-[#173f48]"
            >
              {"\u0418\u0437\u0442\u0440\u0438\u0432\u0430\u043d\u0435 \u043d\u0430 \u0437\u0430\u044f\u0432\u043a\u0430"}
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-[#687f85]">
              {"\u0421\u0438\u0433\u0443\u0440\u043d\u0438 \u043b\u0438 \u0441\u0442\u0435, \u0447\u0435 \u0438\u0441\u043a\u0430\u0442\u0435 \u0434\u0430 \u0438\u0437\u0442\u0440\u0438\u0435\u0442\u0435 \u0442\u0430\u0437\u0438 \u0437\u0430\u044f\u0432\u043a\u0430? \u0422\u043e\u0432\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0431\u044a\u0434\u0435 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u043e."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() =>
                  setConfirmDeleteId(null)
                }
                className="rounded-xl border border-[#d7e4e6] bg-white px-4 py-3 text-sm font-bold text-[#45636b] transition hover:bg-[#f4f9f9] disabled:opacity-50"
              >
                {"\u041e\u0442\u043a\u0430\u0437"}
              </button>

              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() =>
                  void deleteRequest(
                    confirmDeleteId
                  )
                }
                className="rounded-xl border border-[#d47d7d] bg-[#b83a3a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#9f2f2f] disabled:opacity-50"
              >
                {deletingId
                  ? "\u0418\u0437\u0442\u0440\u0438\u0432\u0430\u043d\u0435..."
                  : "\u0418\u0437\u0442\u0440\u0438\u0439"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
