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

type ProviderProfile = {
  id: string;
  owner_id: string;
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
  status: string;
  created_at: string;
};

type ProviderMedia = {
  id: string;
  provider_id: string;
  media_type: "image" | "video";
  storage_path: string;
  caption: string | null;
  sort_order: number;
  status: string;
  created_at: string;
  preview_url?: string;
};

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

  const [providerProfile, setProviderProfile] =
    useState<ProviderProfile | null>(null);

  const [providerLoading, setProviderLoading] =
    useState(false);

  const [providerError, setProviderError] =
    useState("");

  const [providerEditing, setProviderEditing] =
    useState(false);

  const [providerSaving, setProviderSaving] =
    useState(false);

  const [confirmProviderDelete, setConfirmProviderDelete] =
    useState(false);

  const [providerDeleting, setProviderDeleting] =
    useState(false);

  const [providerCompany, setProviderCompany] =
    useState("");

  const [providerPhone, setProviderPhone] =
    useState("");

  const [providerEmail, setProviderEmail] =
    useState("");

  const [providerSite, setProviderSite] =
    useState("");

  const [providerMaxDepth, setProviderMaxDepth] =
    useState("");

  const [providerDiameters, setProviderDiameters] =
    useState("");

  const [providerMethod, setProviderMethod] =
    useState("");

  const [providerEquipment, setProviderEquipment] =
    useState("");

  const [providerPresentation, setProviderPresentation] =
    useState("");

  const [providerMedia, setProviderMedia] =
    useState<ProviderMedia[]>([]);

  const [mediaUploading, setMediaUploading] =
    useState(false);

  const [mediaError, setMediaError] =
    useState("");

  const [confirmMediaDeleteId, setConfirmMediaDeleteId] =
    useState<string | null>(null);

  const [mediaDeletingId, setMediaDeletingId] =
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
          `sondi_auth_next=${encodeURIComponent("/account")}; path=/; max-age=3600; samesite=lax`;

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

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (
      accountType !== "provider" &&
      accountType !== "both"
    ) {
      return;
    }

    let active = true;

    async function loadProviderProfile() {
      setProviderLoading(true);
      setProviderError("");

      const { data, error } =
        await supabase
          .from("service_providers")
          .select(
            "id, owner_id, company_name, phone, email, website_or_facebook, services, work_regions, works_nationwide, max_depth, diameters, drilling_method, equipment, presentation, status, created_at"
          )
          .eq("owner_id", userId)
          .maybeSingle();

      if (!active) {
        return;
      }

      setProviderLoading(false);

      if (error) {
        console.error(
          "own provider profile load error",
          error
        );

        setProviderError(
          "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0437\u0430\u0440\u0435\u0434\u0438\u043c \u043f\u0440\u043e\u0444\u0438\u043b\u0430 \u0432\u0438 \u043d\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b."
        );

        return;
      }

      const profile =
        (data || null) as ProviderProfile | null;

      setProviderProfile(profile);

      if (profile) {
        const { data: mediaData, error: mediaLoadError } =
          await supabase
            .from("service_provider_media")
            .select(
              "id, provider_id, media_type, storage_path, caption, sort_order, status, created_at"
            )
            .eq("provider_id", profile.id)
            .order("sort_order", {
              ascending: true,
            })
            .order("created_at", {
              ascending: true,
            });

        if (mediaLoadError) {
          console.error(
            "own provider media load error",
            mediaLoadError
          );

          setMediaError(
            "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0437\u0430\u0440\u0435\u0434\u0438\u043c \u0441\u043d\u0438\u043c\u043a\u0438\u0442\u0435 \u0438 \u0432\u0438\u0434\u0435\u043e\u0442\u043e."
          );
        } else {
          const rows =
            (mediaData || []) as ProviderMedia[];

          const withUrls =
            await Promise.all(
              rows.map(async item => {
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
              })
            );

          setProviderMedia(withUrls);
        }

        setProviderCompany(
          profile.company_name || ""
        );
        setProviderPhone(
          profile.phone || ""
        );
        setProviderEmail(
          profile.email || ""
        );
        setProviderSite(
          profile.website_or_facebook || ""
        );
        setProviderMaxDepth(
          profile.max_depth || ""
        );
        setProviderDiameters(
          profile.diameters || ""
        );
        setProviderMethod(
          profile.drilling_method || ""
        );
        setProviderEquipment(
          profile.equipment || ""
        );
        setProviderPresentation(
          profile.presentation || ""
        );
      }
    }

    void loadProviderProfile();

    return () => {
      active = false;
    };
  }, [
    accountType,
    supabase,
    userId,
  ]);

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

  async function uploadProviderMedia(
    file: File | null
  ) {
    if (
      !file ||
      !providerProfile ||
      !userId ||
      mediaUploading
    ) {
      return;
    }

    setMediaError("");

    const isImage =
      file.type.startsWith("image/");

    const isVideo =
      file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setMediaError(
        "\u041c\u043e\u0436\u0435 \u0434\u0430 \u043a\u0430\u0447\u0432\u0430\u0442\u0435 \u0441\u0430\u043c\u043e \u0441\u043d\u0438\u043c\u043a\u0438 \u0438 \u0432\u0438\u0434\u0435\u043e."
      );
      return;
    }

    const imageCount =
      providerMedia.filter(
        item => item.media_type === "image"
      ).length;

    const videoCount =
      providerMedia.filter(
        item => item.media_type === "video"
      ).length;

    if (isImage && imageCount >= 6) {
      setMediaError(
        "\u041c\u043e\u0436\u0435 \u0434\u0430 \u043a\u0430\u0447\u0438\u0442\u0435 \u0434\u043e 6 \u0441\u043d\u0438\u043c\u043a\u0438."
      );
      return;
    }

    if (isVideo && videoCount >= 1) {
      setMediaError(
        "\u041c\u043e\u0436\u0435 \u0434\u0430 \u043a\u0430\u0447\u0438\u0442\u0435 \u0434\u043e 1 \u0432\u0438\u0434\u0435\u043e."
      );
      return;
    }

    const imageLimit =
      10 * 1024 * 1024;

    const videoLimit =
      100 * 1024 * 1024;

    if (
      isImage &&
      file.size > imageLimit
    ) {
      setMediaError(
        "\u0421\u043d\u0438\u043c\u043a\u0430\u0442\u0430 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0435 \u0434\u043e 10 MB."
      );
      return;
    }

    if (
      isVideo &&
      file.size > videoLimit
    ) {
      setMediaError(
        "\u0412\u0438\u0434\u0435\u043e\u0442\u043e \u043c\u043e\u0436\u0435 \u0434\u0430 \u0435 \u0434\u043e 100 MB."
      );
      return;
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (
      isImage &&
      !allowedImageTypes.includes(file.type)
    ) {
      setMediaError(
        "\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438 \u0441\u0430 JPEG, PNG \u0438 WebP."
      );
      return;
    }

    if (
      isVideo &&
      !allowedVideoTypes.includes(file.type)
    ) {
      setMediaError(
        "\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438 \u0441\u0430 MP4, WebM \u0438 MOV."
      );
      return;
    }

    setMediaUploading(true);

    const extension =
      file.name.includes(".")
        ? file.name
            .split(".")
            .pop()
            ?.toLowerCase()
            .replace(
              /[^a-z0-9]/g,
              ""
            ) || "bin"
        : "bin";

    const storagePath =
      `${userId}/${providerProfile.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("provider-media")
        .upload(
          storagePath,
          file,
          {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "provider media storage upload error",
        uploadError
      );

      setMediaUploading(false);

      setMediaError(
        "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u043a\u0430\u0447\u0438\u043c \u0444\u0430\u0439\u043b\u0430."
      );

      return;
    }

    const mediaType:
      "image" | "video" =
        isImage
          ? "image"
          : "video";

    const { data: inserted, error: insertError } =
      await supabase
        .from("service_provider_media")
        .insert({
          provider_id:
            providerProfile.id,
          media_type:
            mediaType,
          storage_path:
            storagePath,
          sort_order:
            providerMedia.length,
          status:
            "pending",
        })
        .select(
          "id, provider_id, media_type, storage_path, caption, sort_order, status, created_at"
        )
        .single();

    if (insertError || !inserted) {
      console.error(
        "provider media metadata insert error",
        insertError
      );

      await supabase.storage
        .from("provider-media")
        .remove([storagePath]);

      setMediaUploading(false);

      setMediaError(
        "\u0424\u0430\u0439\u043b\u044a\u0442 \u043d\u0435 \u0431\u0435\u0448\u0435 \u0437\u0430\u043f\u0430\u0437\u0435\u043d. \u041e\u043f\u0438\u0442\u0430\u0439\u0442\u0435 \u043e\u0442\u043d\u043e\u0432\u043e."
      );

      return;
    }

    const { data: signed } =
      await supabase.storage
        .from("provider-media")
        .createSignedUrl(
          storagePath,
          3600
        );

    setProviderMedia(current => [
      ...current,
      {
        ...(inserted as ProviderMedia),
        preview_url:
          signed?.signedUrl || "",
      },
    ]);

    setMediaUploading(false);
  }

  async function deleteProviderMedia(
    mediaId: string
  ) {
    if (
      !providerProfile ||
      !userId ||
      mediaDeletingId
    ) {
      return;
    }

    const media =
      providerMedia.find(
        item => item.id === mediaId
      );

    if (!media) {
      return;
    }

    setMediaDeletingId(mediaId);
    setMediaError("");

    const { error: storageError } =
      await supabase.storage
        .from("provider-media")
        .remove([
          media.storage_path,
        ]);

    if (storageError) {
      console.error(
        "provider media storage delete error",
        storageError
      );

      setMediaDeletingId(null);

      setMediaError(
        "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0438\u0437\u0442\u0440\u0438\u0435\u043c \u0444\u0430\u0439\u043b\u0430."
      );

      return;
    }

    const { error: metadataError } =
      await supabase
        .from("service_provider_media")
        .delete()
        .eq("id", mediaId)
        .eq(
          "provider_id",
          providerProfile.id
        );

    if (metadataError) {
      console.error(
        "provider media metadata delete error",
        metadataError
      );

      setMediaDeletingId(null);

      setMediaError(
        "\u0424\u0430\u0439\u043b\u044a\u0442 \u0435 \u0438\u0437\u0442\u0440\u0438\u0442, \u043d\u043e \u043d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u043e\u0431\u043d\u043e\u0432\u0438\u043c \u0437\u0430\u043f\u0438\u0441\u0430."
      );

      return;
    }

    setProviderMedia(current =>
      current.filter(
        item => item.id !== mediaId
      )
    );

    setMediaDeletingId(null);
    setConfirmMediaDeleteId(null);
  }

  async function saveProviderProfile() {
    if (
      !providerProfile ||
      !userId ||
      providerSaving
    ) {
      return;
    }

    if (!providerCompany.trim()) {
      setProviderError(
        "\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0438\u043c\u0435 \u0438\u043b\u0438 \u0444\u0438\u0440\u043c\u0430."
      );
      return;
    }

    if (!providerPhone.trim()) {
      setProviderError(
        "\u0412\u044a\u0432\u0435\u0434\u0435\u0442\u0435 \u0442\u0435\u043b\u0435\u0444\u043e\u043d."
      );
      return;
    }

    setProviderSaving(true);
    setProviderError("");

    const { data, error } =
      await supabase
        .from("service_providers")
        .update({
          company_name:
            providerCompany.trim(),
          phone:
            providerPhone.trim(),
          email:
            providerEmail.trim() || null,
          website_or_facebook:
            providerSite.trim() || null,
          max_depth:
            providerMaxDepth.trim() || null,
          diameters:
            providerDiameters.trim() || null,
          drilling_method:
            providerMethod.trim() || null,
          equipment:
            providerEquipment.trim() || null,
          presentation:
            providerPresentation.trim() || null,
          status: "pending",
        })
        .eq("id", providerProfile.id)
        .eq("owner_id", userId)
        .select(
          "id, owner_id, company_name, phone, email, website_or_facebook, services, work_regions, works_nationwide, max_depth, diameters, drilling_method, equipment, presentation, status, created_at"
        )
        .maybeSingle();

    setProviderSaving(false);

    if (error) {
      console.error(
        "own provider profile update error",
        error
      );

      setProviderError(
        "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0437\u0430\u043f\u0430\u0437\u0438\u043c \u043f\u0440\u043e\u043c\u0435\u043d\u0438\u0442\u0435."
      );

      return;
    }

    if (data) {
      setProviderProfile(
        data as ProviderProfile
      );
    }

    setProviderEditing(false);
  }

  async function deleteProviderProfile() {
    if (
      !providerProfile ||
      !userId ||
      providerDeleting
    ) {
      return;
    }

    setProviderDeleting(true);
    setProviderError("");

    const { error } =
      await supabase
        .from("service_providers")
        .delete()
        .eq("id", providerProfile.id)
        .eq("owner_id", userId);

    setProviderDeleting(false);

    if (error) {
      console.error(
        "own provider profile delete error",
        error
      );

      setProviderError(
        "\u041d\u0435 \u0443\u0441\u043f\u044f\u0445\u043c\u0435 \u0434\u0430 \u0438\u0437\u0442\u0440\u0438\u0435\u043c \u043f\u0440\u043e\u0444\u0438\u043b\u0430."
      );

      return;
    }

    setConfirmProviderDelete(false);
    setProviderEditing(false);
    setProviderProfile(null);
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

            {(accountType === "client" ||
              accountType === "both") && (
              <>
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

              </>
            )}

            {(accountType === "provider" ||
              accountType === "both") && (
              <div className="mt-10 border-t border-[#e1ecee] pt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#56858e]">
                      {"\u0417\u0410 \u0418\u0417\u041f\u042a\u041b\u041d\u0418\u0422\u0415\u041b\u0418"}
                    </div>

                    <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-[#173f48]">
                      {"\u041c\u043e\u044f\u0442 \u043f\u0440\u043e\u0444\u0438\u043b \u043d\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b"}
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b8187]">
                      {"\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u0432\u0430\u0439\u0442\u0435 \u043f\u0440\u043e\u0444\u0438\u043b\u0430, \u0441 \u043a\u043e\u0439\u0442\u043e \u0441\u0435 \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u044f\u0442\u0435 \u043f\u0440\u0435\u0434 \u043a\u043b\u0438\u0435\u043d\u0442\u0438\u0442\u0435 \u0432 SONDI.BG."}
                    </p>
                  </div>

                  {!providerProfile &&
                    !providerLoading && (
                      <a
                        href="/services?tab=provider"
                        className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#173f48] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102f36]"
                      >
                        {"\u0421\u044a\u0437\u0434\u0430\u0439 \u043f\u0440\u043e\u0444\u0438\u043b"}
                      </a>
                    )}
                </div>

                {providerLoading && (
                  <div className="mt-6 rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] px-5 py-8 text-sm text-[#6b8187]">
                    {"\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 \u043f\u0440\u043e\u0444\u0438\u043b\u0430..."}
                  </div>
                )}

                {providerError && (
                  <div className="mt-6 rounded-2xl border border-[#efb5b5] bg-[#fff1f1] px-4 py-3 text-sm font-semibold text-[#a12626]">
                    {providerError}
                  </div>
                )}

                {!providerLoading &&
                  !providerProfile &&
                  !providerError && (
                    <div className="mt-6 rounded-2xl border border-[#d9e7e9] bg-[#f7fbfb] px-6 py-8 text-center">
                      <div className="font-bold text-[#294e59]">
                        {"\u0412\u0441\u0435 \u043e\u0449\u0435 \u043d\u044f\u043c\u0430\u0442\u0435 \u043f\u0440\u043e\u0444\u0438\u043b \u043d\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b."}
                      </div>

                      <div className="mt-2 text-sm text-[#71878d]">
                        {"\u0421\u044a\u0437\u0434\u0430\u0432\u0430\u043d\u0435\u0442\u043e \u043d\u0430 \u043f\u0440\u043e\u0444\u0438\u043b \u0435 \u0431\u0435\u0437\u043f\u043b\u0430\u0442\u043d\u043e."}
                      </div>
                    </div>
                  )}

                {providerProfile && (
                  <div className="mt-6 rounded-[24px] border border-[#d9e7e9] bg-white p-5 shadow-[0_10px_35px_rgba(20,63,73,.06)] sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#173f48]">
                          {providerProfile.company_name}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={
                              "inline-flex rounded-full border px-3 py-1.5 text-xs font-bold " +
                              statusClasses(
                                providerProfile.status
                              )
                            }
                          >
                            {statusLabel(
                              providerProfile.status
                            )}
                          </span>

                          {providerProfile.works_nationwide && (
                            <span className="inline-flex rounded-full border border-[#cfe2dd] bg-[#f1f8f6] px-3 py-1.5 text-xs font-bold text-[#28634f]">
                              {"\u0426\u044f\u043b\u0430 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f"}
                            </span>
                          )}
                        </div>
                      </div>

                      {!providerEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setProviderError("");
                            setProviderEditing(true);
                          }}
                          className="rounded-xl border border-[#b9d7dc] bg-[#eef8f9] px-4 py-2.5 text-sm font-bold text-[#245d68] transition hover:bg-[#e2f2f4]"
                        >
                          {"\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u0430\u0439"}
                        </button>
                      )}
                    </div>

                    {!providerEditing ? (
                      <>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-[#f7fbfb] px-4 py-3">
                            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                              {"\u0422\u0435\u043b\u0435\u0444\u043e\u043d"}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#3d6069]">
                              {providerProfile.phone}
                            </div>
                          </div>

                          <div className="rounded-xl bg-[#f7fbfb] px-4 py-3">
                            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                              {"\u0418\u043c\u0435\u0439\u043b"}
                            </div>
                            <div className="mt-1 break-all text-sm font-semibold text-[#3d6069]">
                              {providerProfile.email ||
                                "\u041d\u0435 \u0435 \u043f\u043e\u0441\u043e\u0447\u0435\u043d"}
                            </div>
                          </div>

                          <div className="rounded-xl bg-[#f7fbfb] px-4 py-3">
                            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                              {"\u0420\u0435\u0433\u0438\u043e\u043d\u0438"}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#3d6069]">
                              {providerProfile.works_nationwide
                                ? "\u0426\u044f\u043b\u0430 \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f"
                                : providerProfile.work_regions.join(", ") ||
                                  "\u041d\u0435 \u0441\u0430 \u043f\u043e\u0441\u043e\u0447\u0435\u043d\u0438"}
                            </div>
                          </div>

                          <div className="rounded-xl bg-[#f7fbfb] px-4 py-3">
                            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#82969b]">
                              {"\u041c\u0430\u043a\u0441. \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430"}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-[#3d6069]">
                              {providerProfile.max_depth ||
                                "\u041d\u0435 \u0435 \u043f\u043e\u0441\u043e\u0447\u0435\u043d\u0430"}
                            </div>
                          </div>
                        </div>

                        {providerProfile.services.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {providerProfile.services.map(
                              (service, index) => (
                                <span
                                  key={`${providerProfile.id}-${index}`}
                                  className="rounded-full border border-[#d4e5e1] bg-[#f8fcfb] px-3 py-1.5 text-xs font-semibold text-[#456761]"
                                >
                                  {service}
                                </span>
                              )
                            )}
                          </div>
                        )}

                        {providerProfile.presentation && (
                          <div className="mt-5 rounded-2xl border border-[#e1ecee] bg-[#fbfdfd] p-4 text-sm leading-6 text-[#526e75]">
                            {providerProfile.presentation}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <input
                          value={providerCompany}
                          onChange={event =>
                            setProviderCompany(
                              event.target.value
                            )
                          }
                          placeholder={"\u0418\u043c\u0435 / \u0444\u0438\u0440\u043c\u0430"}
                          className="rounded-xl border border-[#d7e5e8] px-4 py-3 text-sm outline-none focus:border-[#56a4a8]"
                        />

                        <input
                          value={providerPhone}
                          onChange={event =>
                            setProviderPhone(
                              event.target.value
                            )
                          }
                          placeholder={"\u0422\u0435\u043b\u0435\u0444\u043e\u043d"}
                          className="rounded-xl border border-[#d7e5e8] px-4 py-3 text-sm outline-none focus:border-[#56a4a8]"
                        />

                        <input
                          value={providerEmail}
                          onChange={event =>
                            setProviderEmail(
                              event.target.value
                            )
                          }
                          placeholder={"\u0418\u043c\u0435\u0439\u043b"}
                          className="rounded-xl border border-[#d7e5e8] px-4 py-3 text-sm outline-none focus:border-[#56a4a8]"
                        />

                        <input
                          value={providerSite}
                          onChange={event =>
                            setProviderSite(
                              event.target.value
                            )
                          }
                          placeholder={"\u0421\u0430\u0439\u0442 / Facebook"}
                          className="rounded-xl border border-[#d7e5e8] px-4 py-3 text-sm outline-none focus:border-[#56a4a8]"
                        />

                        <input
                          value={providerMaxDepth}
                          onChange={event =>
                            setProviderMaxDepth(
                              event.target.value
                            )
                          }
                          placeholder={"\u041c\u0430\u043a\u0441. \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430"}
                          className="rounded-xl border border-[#d7e5e8] px-4 py-3 text-sm outline-none focus:border-[#56a4a8]"
                        />

                        <input
                          value={providerDiameters}
                          onChange={event =>
                            setProviderDiameters(
                              event.target.value
                            )
                          }
                          placeholder={"\u0414\u0438\u0430\u043c\u0435\u0442\u0440\u0438"}
                          className="rounded-xl border border-[#d7e5e8] px-4 py-3 text-sm outline-none focus:border-[#56a4a8]"
                        />

                        <input
                          value={providerMethod}
                          onChange={event =>
                            setProviderMethod(
                              event.target.value
                            )
                          }
                          placeholder={"\u041c\u0435\u0442\u043e\u0434 \u043d\u0430 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435"}
                          className="rounded-xl border border-[#d7e5e8] px-4 py-3 text-sm outline-none focus:border-[#56a4a8]"
                        />

                        <input
                          value={providerEquipment}
                          onChange={event =>
                            setProviderEquipment(
                              event.target.value
                            )
                          }
                          placeholder={"\u0422\u0435\u0445\u043d\u0438\u043a\u0430"}
                          className="rounded-xl border border-[#d7e5e8] px-4 py-3 text-sm outline-none focus:border-[#56a4a8]"
                        />

                        <textarea
                          value={providerPresentation}
                          onChange={event =>
                            setProviderPresentation(
                              event.target.value
                            )
                          }
                          rows={5}
                          placeholder={"\u041f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u044f\u043d\u0435"}
                          className="sm:col-span-2 rounded-xl border border-[#d7e5e8] px-4 py-3 text-sm outline-none focus:border-[#56a4a8]"
                        />

                        <div className="sm:col-span-2 rounded-xl border border-[#ead7a3] bg-[#fff8e5] px-4 py-3 text-xs leading-5 text-[#87661c]">
                          {"\u0421\u043b\u0435\u0434 \u0440\u0435\u0434\u0430\u043a\u0446\u0438\u044f \u043f\u0440\u043e\u0444\u0438\u043b\u044a\u0442 \u0449\u0435 \u0431\u044a\u0434\u0435 \u0438\u0437\u043f\u0440\u0430\u0442\u0435\u043d \u043e\u0442\u043d\u043e\u0432\u043e \u0437\u0430 \u043e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u0435."}
                        </div>

                        <div className="sm:col-span-2 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={providerSaving}
                            onClick={() =>
                              void saveProviderProfile()
                            }
                            className="rounded-xl bg-[#173f48] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                          >
                            {providerSaving
                              ? "\u0417\u0430\u043f\u0430\u0437\u0432\u0430\u043d\u0435..."
                              : "\u0417\u0430\u043f\u0430\u0437\u0438 \u043f\u0440\u043e\u043c\u0435\u043d\u0438\u0442\u0435"}
                          </button>

                          <button
                            type="button"
                            disabled={providerSaving}
                            onClick={() => {
                              setProviderEditing(false);
                              setProviderError("");
                            }}
                            className="rounded-xl border border-[#d7e4e6] bg-white px-5 py-3 text-sm font-bold text-[#45636b]"
                          >
                            {"\u041e\u0442\u043a\u0430\u0437"}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-7 border-t border-[#e3edef] pt-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#56858e]">
                            {"\u041c\u0415\u0414\u0418\u042f"}
                          </div>

                          <h4 className="mt-1 text-lg font-bold text-[#173f48]">
                            {"\u0421\u043d\u0438\u043c\u043a\u0438 \u0438 \u0432\u0438\u0434\u0435\u043e"}
                          </h4>

                          <p className="mt-1 text-xs leading-5 text-[#71878d]">
                            {"\u041f\u043e \u0436\u0435\u043b\u0430\u043d\u0438\u0435: \u0434\u043e 6 \u0441\u043d\u0438\u043c\u043a\u0438 \u0438 1 \u0432\u0438\u0434\u0435\u043e. \u041d\u043e\u0432\u0438\u0442\u0435 \u0444\u0430\u0439\u043b\u043e\u0432\u0435 \u0441\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u0442 \u0441\u043b\u0435\u0434 \u043e\u0434\u043e\u0431\u0440\u0435\u043d\u0438\u0435."}
                          </p>
                        </div>

                        <label
                          className={
                            "inline-flex shrink-0 items-center justify-center rounded-xl border border-[#b9d7dc] bg-[#eef8f9] px-4 py-2.5 text-sm font-bold text-[#245d68] transition hover:bg-[#e2f2f4] " +
                            (mediaUploading
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer")
                          }
                        >
                          {mediaUploading
                            ? "\u041a\u0430\u0447\u0432\u0430\u043d\u0435..."
                            : "\u041a\u0430\u0447\u0438 \u0441\u043d\u0438\u043c\u043a\u0430 / \u0432\u0438\u0434\u0435\u043e"}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                            disabled={mediaUploading}
                            className="hidden"
                            onChange={event => {
                              const file =
                                event.target.files?.[0] || null;

                              void uploadProviderMedia(
                                file
                              );

                              event.currentTarget.value =
                                "";
                            }}
                          />
                        </label>
                      </div>

                      {mediaError && (
                        <div className="mt-4 rounded-xl border border-[#efb5b5] bg-[#fff1f1] px-4 py-3 text-sm font-semibold text-[#a12626]">
                          {mediaError}
                        </div>
                      )}

                      {providerMedia.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-dashed border-[#cfdfe2] bg-[#f8fbfb] px-5 py-8 text-center text-sm text-[#789096]">
                          {"\u0412\u0441\u0435 \u043e\u0449\u0435 \u043d\u044f\u043c\u0430\u0442\u0435 \u043a\u0430\u0447\u0435\u043d\u0438 \u0441\u043d\u0438\u043c\u043a\u0438 \u0438\u043b\u0438 \u0432\u0438\u0434\u0435\u043e."}
                        </div>
                      ) : (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {providerMedia.map(item => (
                            <div
                              key={item.id}
                              className="overflow-hidden rounded-2xl border border-[#d9e7e9] bg-[#f8fbfb]"
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
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-[#71878d]">
                                    {"\u041f\u0440\u0435\u0433\u043b\u0435\u0434\u044a\u0442 \u043d\u0435 \u0435 \u043d\u0430\u043b\u0438\u0447\u0435\u043d"}
                                  </div>
                                )}
                              </div>

                              <div className="p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <span
                                    className={
                                      "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold " +
                                      statusClasses(
                                        item.status
                                      )
                                    }
                                  >
                                    {statusLabel(
                                      item.status
                                    )}
                                  </span>

                                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#789096]">
                                    {item.media_type ===
                                    "image"
                                      ? "\u0421\u043d\u0438\u043c\u043a\u0430"
                                      : "\u0412\u0438\u0434\u0435\u043e"}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  disabled={
                                    mediaDeletingId ===
                                    item.id
                                  }
                                  onClick={() =>
                                    setConfirmMediaDeleteId(
                                      item.id
                                    )
                                  }
                                  className="mt-3 w-full rounded-xl border border-[#e8bcbc] bg-[#fff6f6] px-3 py-2 text-xs font-bold text-[#a43a3a] transition hover:bg-[#ffeded] disabled:opacity-50"
                                >
                                  {"\u0418\u0437\u0442\u0440\u0438\u0439 \u0444\u0430\u0439\u043b\u0430"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 border-t border-[#e3edef] pt-5">
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmProviderDelete(true)
                        }
                        className="rounded-xl border border-[#e8bcbc] bg-[#fff6f6] px-4 py-2.5 text-sm font-bold text-[#a43a3a] transition hover:bg-[#ffeded]"
                      >
                        {"\u0418\u0437\u0442\u0440\u0438\u0439 \u043f\u0440\u043e\u0444\u0438\u043b\u0430"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(accountType === "client" ||
              accountType === "both") &&
              requests.length > 0 && (
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

      {confirmMediaDeleteId && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-[#0b2630]/55 px-4 backdrop-blur-[2px]"
          onClick={() => {
            if (!mediaDeletingId) {
              setConfirmMediaDeleteId(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-[26px] border border-white/60 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,.25)] sm:p-7"
            onClick={event =>
              event.stopPropagation()
            }
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-2xl text-[#b83a3a]">
              !
            </div>

            <h2 className="mt-4 text-center text-xl font-bold text-[#173f48]">
              {"\u0418\u0437\u0442\u0440\u0438\u0432\u0430\u043d\u0435 \u043d\u0430 \u0444\u0430\u0439\u043b"}
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-[#687f85]">
              {"\u0421\u0438\u0433\u0443\u0440\u043d\u0438 \u043b\u0438 \u0441\u0442\u0435, \u0447\u0435 \u0438\u0441\u043a\u0430\u0442\u0435 \u0434\u0430 \u0438\u0437\u0442\u0440\u0438\u0435\u0442\u0435 \u0442\u043e\u0437\u0438 \u0444\u0430\u0439\u043b? \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u0442\u043e \u043d\u0435 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0431\u044a\u0434\u0435 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u043e."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={Boolean(mediaDeletingId)}
                onClick={() =>
                  setConfirmMediaDeleteId(null)
                }
                className="rounded-xl border border-[#d7e4e6] bg-white px-4 py-3 text-sm font-bold text-[#45636b] disabled:opacity-50"
              >
                {"\u041e\u0442\u043a\u0430\u0437"}
              </button>

              <button
                type="button"
                disabled={Boolean(mediaDeletingId)}
                onClick={() =>
                  void deleteProviderMedia(
                    confirmMediaDeleteId
                  )
                }
                className="rounded-xl border border-[#d47d7d] bg-[#b83a3a] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {mediaDeletingId
                  ? "\u0418\u0437\u0442\u0440\u0438\u0432\u0430\u043d\u0435..."
                  : "\u0418\u0437\u0442\u0440\u0438\u0439"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmProviderDelete &&
        providerProfile && (
          <div
            className="fixed inset-0 z-[210] flex items-center justify-center bg-[#0b2630]/55 px-4 backdrop-blur-[2px]"
            onClick={() => {
              if (!providerDeleting) {
                setConfirmProviderDelete(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md rounded-[26px] border border-white/60 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,.25)] sm:p-7"
              onClick={event =>
                event.stopPropagation()
              }
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-2xl text-[#b83a3a]">
                !
              </div>

              <h2 className="mt-4 text-center text-xl font-bold text-[#173f48]">
                {"\u0418\u0437\u0442\u0440\u0438\u0432\u0430\u043d\u0435 \u043d\u0430 \u043f\u0440\u043e\u0444\u0438\u043b"}
              </h2>

              <p className="mt-3 text-center text-sm leading-6 text-[#687f85]">
                {"\u0421\u0438\u0433\u0443\u0440\u043d\u0438 \u043b\u0438 \u0441\u0442\u0435, \u0447\u0435 \u0438\u0441\u043a\u0430\u0442\u0435 \u0434\u0430 \u0438\u0437\u0442\u0440\u0438\u0435\u0442\u0435 \u043f\u0440\u043e\u0444\u0438\u043b\u0430 \u0441\u0438 \u043d\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b?"}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={providerDeleting}
                  onClick={() =>
                    setConfirmProviderDelete(false)
                  }
                  className="rounded-xl border border-[#d7e4e6] bg-white px-4 py-3 text-sm font-bold text-[#45636b] disabled:opacity-50"
                >
                  {"\u041e\u0442\u043a\u0430\u0437"}
                </button>

                <button
                  type="button"
                  disabled={providerDeleting}
                  onClick={() =>
                    void deleteProviderProfile()
                  }
                  className="rounded-xl border border-[#d47d7d] bg-[#b83a3a] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {providerDeleting
                    ? "\u0418\u0437\u0442\u0440\u0438\u0432\u0430\u043d\u0435..."
                    : "\u0418\u0437\u0442\u0440\u0438\u0439"}
                </button>
              </div>
            </div>
          </div>
        )}

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
