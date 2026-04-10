const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  const SEAFILE_BASE_URL = Deno.env.get("SEAFILE_BASE_URL");
  const SEAFILE_API_TOKEN = Deno.env.get("SEAFILE_API_TOKEN");
  const REPO_ID = "c51e76e8-052a-49fd-b03a-bf2727986cf3";

  if (!SEAFILE_BASE_URL || !SEAFILE_API_TOKEN) {
    return new Response(JSON.stringify({ error: "Seafile not configured" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "/chat-uploads";

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Step 1: Get upload link
    const uploadLinkResp = await fetch(
      `${SEAFILE_BASE_URL}/api2/repos/${REPO_ID}/upload-link/?p=${encodeURIComponent(folder)}`,
      {
        headers: { Authorization: `Token ${SEAFILE_API_TOKEN}` },
      }
    );

    if (!uploadLinkResp.ok) {
      const errText = await uploadLinkResp.text();
      console.error("Upload link error:", errText);
      return new Response(JSON.stringify({ error: "Failed to get upload link" }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const uploadLink = (await uploadLinkResp.json()) as string;

    // Step 2: Upload the file
    const uploadForm = new FormData();
    uploadForm.append("file", file, file.name);
    uploadForm.append("parent_dir", folder);
    uploadForm.append("replace", "1");

    const uploadResp = await fetch(uploadLink, {
      method: "POST",
      headers: { Authorization: `Token ${SEAFILE_API_TOKEN}` },
      body: uploadForm,
    });

    if (!uploadResp.ok) {
      const errText = await uploadResp.text();
      console.error("Upload error:", errText);
      return new Response(JSON.stringify({ error: "Upload failed" }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Step 3: Get share link for the file
    const filePath = `${folder}/${file.name}`;

    // Create a file share link
    const shareLinkResp = await fetch(
      `${SEAFILE_BASE_URL}/api/v2.1/share-links/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${SEAFILE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo_id: REPO_ID,
          path: filePath,
          permissions: { can_download: true },
        }),
      }
    );

    let fileUrl = "";
    if (shareLinkResp.ok) {
      const shareData = await shareLinkResp.json();
      fileUrl = shareData.link || "";
    } else {
      // Fallback: construct a direct download URL
      fileUrl = `${SEAFILE_BASE_URL}/lib/${REPO_ID}/file${encodeURIComponent(filePath)}`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: fileUrl,
        file_path: filePath,
      }),
      {
        headers: { ...CORS, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Seafile upload error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      }
    );
  }
});
