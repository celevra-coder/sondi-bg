import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase-server";
import DrillerClientPage from "./DrillerClientPage";

type SearchParams = Promise<{
  lat?: string;
  lng?: string;
  lon?: string;
  gwb?: string;
  gwbs?: string;
  analysis_id?: string;
}>;

export default async function GeologyReportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const analysisId =
    params.analysis_id?.trim() || "";

  let hasAccess = false;

  if (user) {
    const { data: adminRow } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminRow) {
      hasAccess = true;
    } else if (analysisId) {
      const { data: analysisRow } =
        await supabase
          .from("expert_analyses")
          .select(
            "id, latitude, longitude, primary_gwb, query_params"
          )
          .eq("id", analysisId)
          .eq("user_id", user.id)
          .maybeSingle();

      if (analysisRow) {
        const requestedLat =
          Number(params.lat);

        const requestedLng =
          Number(
            params.lng ??
            params.lon
          );

        const savedLat =
          Number(
            analysisRow.latitude
          );

        const savedLng =
          Number(
            analysisRow.longitude
          );

        const coordinatesMatch =
          Number.isFinite(requestedLat) &&
          Number.isFinite(requestedLng) &&
          Number.isFinite(savedLat) &&
          Number.isFinite(savedLng) &&
          requestedLat.toFixed(6) ===
            savedLat.toFixed(6) &&
          requestedLng.toFixed(6) ===
            savedLng.toFixed(6);

        if (coordinatesMatch) {
          hasAccess = true;
        }
      }
    }
  }

  if (!hasAccess) {
    const accessParams =
      new URLSearchParams();

    if (params.lat) {
      accessParams.set(
        "lat",
        params.lat
      );
    }

    if (params.lng || params.lon) {
      accessParams.set(
        "lng",
        params.lng ||
          params.lon ||
          ""
      );
    }

    if (params.gwb) {
      accessParams.set(
        "gwb",
        params.gwb
      );
    }

    if (params.gwbs) {
      accessParams.set(
        "gwbs",
        params.gwbs
      );
    }

    const query =
      accessParams.toString();

    redirect(
      query
        ? `/expert-access?${query}`
        : "/expert-access"
    );
  }

  return <DrillerClientPage />;
}