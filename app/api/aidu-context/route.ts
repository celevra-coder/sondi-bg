import { NextResponse } from "next/server";
import { getSpatialProfile } from "../../../lib/spatial-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const latValue =
      body?.lat === null || body?.lat === undefined
        ? ""
        : String(body.lat).trim();

    const lngValue =
      body?.lng === null || body?.lng === undefined
        ? ""
        : String(body.lng).trim();

    if (!latValue || !lngValue) {
      return NextResponse.json(
        {
          success: false,
          error: "Липсват координати.",
        },
        { status: 400 }
      );
    }

    const lat = Number(latValue);
    const lng = Number(lngValue);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Невалидни координати.",
        },
        { status: 400 }
      );
    }

    const spatialProfile = getSpatialProfile(
      latValue,
      lngValue
    );

    if (!spatialProfile) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Не може да бъде изграден пространствен профил за тази точка.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coordinates: {
        lat,
        lng,
      },
      spatialProfile,
    });
  } catch (error) {
    console.error("AIDU context failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Грешка при събиране на AIDU контекста.",
      },
      { status: 500 }
    );
  }
}
