import { verifyAuth, getAdminClient, hasRole } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type VendorLocationPublic = {
  id: string;
  vendor_id: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  address: string | null;
  vendor: {
    id: string;
    name: string;
    company_name: string | null;
    specialization: string[] | null;
    phone: string | null;
    email: string | null;
    rating: number | null;
    profile_image: string | null;
  };
};

async function isStaff(req: Request): Promise<boolean> {
  const auth = await verifyAuth(req);
  if (!auth.isAuthenticated || !auth.user) return false;

  const admin = getAdminClient();
  return await hasRole(admin, auth.user.id, ["owner", "admin", "manager", "staff"]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const serviceType: string | undefined = body?.serviceType;

    const includeSensitive = await isStaff(req);
    const admin = getAdminClient();

    const { data: locs, error: locError } = await admin
      .from("vendor_locations")
      .select("id,vendor_id,latitude,longitude,address,is_active")
      .eq("is_active", true);

    if (locError) throw locError;

    if (!locs || locs.length === 0) {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vendorIds = Array.from(new Set(locs.map((l) => l.vendor_id)));
    const { data: vendors, error: vendorError } = await admin
      .from("vendors")
      .select("id,name,company_name,specialization,phone,email,rating,profile_image,status")
      .in("id", vendorIds)
      .eq("status", "active");

    if (vendorError) throw vendorError;

    const combined: VendorLocationPublic[] = [];
    for (const loc of locs) {
      const v = vendors?.find((x) => x.id === loc.vendor_id);
      if (!v) continue;
      if (serviceType && Array.isArray(v.specialization) && !v.specialization.includes(serviceType)) continue;

      combined.push({
        id: loc.id,
        vendor_id: loc.vendor_id,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        is_active: Boolean(loc.is_active),
        address: includeSensitive ? (loc.address ?? null) : null,
        vendor: {
          id: v.id,
          name: v.name,
          company_name: v.company_name ?? null,
          specialization: (v.specialization as string[] | null) ?? null,
          phone: includeSensitive ? (v.phone ?? null) : null,
          email: includeSensitive ? (v.email ?? null) : null,
          rating: (v.rating as number | null) ?? null,
          profile_image: v.profile_image ?? null,
        },
      });
    }

    return new Response(JSON.stringify({ success: true, data: combined }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-vendor-locations-public:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
