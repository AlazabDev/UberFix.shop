// Simple in-memory cache for Edge Functions
// For production, use Upstash Redis or similar

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CACHE_TTL = {
  categories: 3600, // 1 hour
  services: 3600,   // 1 hour
  cities: 86400,    // 24 hours
  districts: 86400, // 24 hours
  profiles: 900,    // 15 minutes
} as const;

// In-memory cache
const cache = new Map<string, { data: any; expires: number }>();

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const key = url.searchParams.get("key");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case "get": {
        if (!key) {
          return new Response(JSON.stringify({ error: "Missing key" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const cached = cache.get(key);
        if (cached && cached.expires > Date.now()) {
          return new Response(
            JSON.stringify({ data: cached.data, cached: true }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": `public, max-age=${Math.floor((cached.expires - Date.now()) / 1000)}`,
              },
            }
          );
        }

        // Fetch from database based on key pattern
        let data = null;
        const [table, ...rest] = key.split(":");

        if (table === "categories") {
          const { data: categories } = await supabase
            .from("categories")
            .select("*")
            .eq("is_active", true)
            .order("sort_order");
          data = categories;
        } else if (table === "services") {
          const { data: services } = await supabase
            .from("services")
            .select("*")
            .eq("is_active", true)
            .order("sort_order");
          data = services;
        } else if (table === "cities") {
          const { data: cities } = await supabase
            .from("cities")
            .select("*")
            .order("name_ar");
          data = cities;
        } else if (table === "districts") {
          const cityId = rest[0];
          const { data: districts } = await supabase
            .from("districts")
            .select("*")
            .eq("city_id", cityId)
            .order("name_ar");
          data = districts;
        }

        // Cache the result
        const ttl = CACHE_TTL[table as keyof typeof CACHE_TTL] || 900;
        cache.set(key, {
          data,
          expires: Date.now() + ttl * 1000,
        });

        return new Response(JSON.stringify({ data, cached: false }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": `public, max-age=${ttl}`,
          },
        });
      }

      case "invalidate": {
        if (!key) {
          // Clear all cache
          cache.clear();
        } else {
          // Clear specific key or pattern
          if (key.endsWith("*")) {
            const prefix = key.slice(0, -1);
            for (const cacheKey of cache.keys()) {
              if (cacheKey.startsWith(prefix)) {
                cache.delete(cacheKey);
              }
            }
          } else {
            cache.delete(key);
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: "Cache invalidated" }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      case "stats": {
        return new Response(
          JSON.stringify({
            size: cache.size,
            keys: Array.from(cache.keys()),
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use: get, invalidate, stats" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
    }
  } catch (error) {
    console.error("Cache service error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
