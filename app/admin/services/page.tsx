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
    providersResult,
    mediaResult,
  ] = await Promise.all([
    supabase
      .from("service_requests")
      .select("*")
      .order("created_at", {
        ascending: false,
      }),
    supabase
      .from("service_providers")
      .select("*")
      .order("created_at", {
        ascending: false,
      }),
    supabase
      .from("service_provider_media")
      .select(
        "id, provider_id, media_type, storage_path, caption, sort_order, status, created_at"
      )
      .order("created_at", {
        ascending: false,
      }),
  ]);

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
      initialProviders={
        providersResult.data || []
      }
      initialMedia={
        providerMedia
      }
      initialError={
        requestsResult.error?.message ||
        providersResult.error?.message ||
        mediaResult.error?.message ||
        ""
      }
    />
  );
}
