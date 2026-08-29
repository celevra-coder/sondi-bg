import { NextResponse } from "next/server";
import { getGwbProfile } from "@/lib/gwb-profile";
import { getSpatialProfile } from "@/lib/spatial-profile";
import { resolveGroundwaterBodiesAtPoint } from "@/lib/gwb-spatial-resolver";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const lat =
      url.searchParams.get("lat");

    const lng =
      url.searchParams.get("lng") ??
      url.searchParams.get("lon");

    const requestedGwb =
      String(
        url.searchParams.get("gwb") || ""
      )
        .trim()
        .toUpperCase();

    if (
      lat == null ||
      lng == null ||
      !Number.isFinite(Number(lat)) ||
      !Number.isFinite(Number(lng))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coordinates",
        },
        {
          status: 400,
        }
      );
    }

    const spatial =
      getSpatialProfile(
        lat,
        lng
      );

    const resolvedGroundwaterBodies =
      resolveGroundwaterBodiesAtPoint(
        Number(lat),
        Number(lng)
      );

    const spatialGwbCodes = new Set(
      resolvedGroundwaterBodies.map(
        (item) => item.code
      )
    );

    const validatedRequestedGwb =
      requestedGwb &&
      spatialGwbCodes.has(requestedGwb)
        ? requestedGwb
        : "";

    const gwb =
      validatedRequestedGwb ||
      resolvedGroundwaterBodies[0]?.code ||
      "";

    const profile =
      gwb
        ? getGwbProfile(gwb)
        : null;

    return NextResponse.json({
      success: true,
      coordinates: {
        lat: Number(lat),
        lng: Number(lng),
      },
      gwb: gwb || null,
      gwbs: resolvedGroundwaterBodies.map(
        (item) => item.code
      ),
      requestedGwb: requestedGwb || null,
      requestedGwbAccepted:
        Boolean(validatedRequestedGwb),
      profile,
      spatial,
    });

  } catch (error) {
    console.error(
      "[SONDI EXPERT CONTEXT]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Expert context error",
      },
      {
        status: 500,
      }
    );
  }
}
