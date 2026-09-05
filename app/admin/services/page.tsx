import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminServicesClient from "./AdminServicesClient";

export default async function AdminServicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRow } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (!adminRow) {
    redirect(
      "/admin/login?error=forbidden"
    );
  }

  const [
    requestsResult,
    pendingProvidersResult,
    mediaResult,
    historyResult,
  ] = await Promise.all([
    supabase
      .from("service_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("service_providers")
      .select("*")
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("service_provider_media")
      .select(
        "id, provider_id, media_type, storage_path, caption, sort_order, status, created_at"
      )
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("admin_services_action_log")
      .select(
        "id, entity_type, entity_id, action, previous_status, performed_by, snapshot, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(500),
  ]);

  const mediaProviderIds =
    Array.from(
      new Set(
        (mediaResult.data || []).map(
          item => item.provider_id
        )
      )
    );

  let mediaProvidersResult: {
    data: unknown[] | null;
    error: { message: string } | null;
  } = {
    data: [],
    error: null,
  };

  if (mediaProviderIds.length > 0) {
    mediaProvidersResult =
      await supabase
        .from("service_providers")
        .select("*")
        .in("id", mediaProviderIds);
  }

  const providerMap =
    new Map<string, any>();

  for (
    const item of
    pendingProvidersResult.data || []
  ) {
    providerMap.set(item.id, item);
  }

  for (
    const item of
    mediaProvidersResult.data || []
  ) {
    providerMap.set(
      (item as any).id,
      item
    );
  }

  const providers =
    Array.from(providerMap.values());

  const providerMedia =
    await Promise.all(
      (mediaResult.data || []).map(
        async item => {
          const { data } =
            await supabase.storage
              .from("provider-media")
              .createSignedUrl(
                item.storage_path,
                3600
              );

          return {
            ...item,
            preview_url:
              data?.signedUrl || "",
          };
        }
      )
    );

  return (
    <AdminServicesClient
      initialRequests={
        requestsResult.data || []
      }
      initialProviders={providers}
      initialMedia={providerMedia}
      initialHistory={
        historyResult.data || []
      }
      initialError={
        requestsResult.error?.message ||
        pendingProvidersResult.error
          ?.message ||
        mediaResult.error?.message ||
        historyResult.error?.message ||
        mediaProvidersResult.error
          ?.message ||
        ""
      }
    />
  );
}
