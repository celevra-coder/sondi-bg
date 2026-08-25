import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase-server";
import AiduSharedAnalysis from "../../../components/AiduSharedAnalysis";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    code: string;
  }>;
};

export default async function SharedAiduPage({
  params,
}: Props) {
  const {
    code,
  } = await params;

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "aidu_shared_analyses"
      )
      .select(
        "location_label, latitude, longitude, client_text, analysis, aidu_files"
      )
      .eq(
        "share_code",
        code
      )
      .eq(
        "is_public",
        true
      )
      .maybeSingle();

  if (
    error ||
    !data
  ) {
    notFound();
  }

  return (
    <AiduSharedAnalysis
      record={data}
    />
  );
}
