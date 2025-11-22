// geocode_abuauf.mjs
// سكربت لجلب عناوين وإحداثيات فروع أبو عوف من Google Geocoding API
// Input: abuauf_branches_input.csv
// Output: abuauf_branches_output.csv

import "dotenv/config";
import fs from "fs/promises";

const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;
const INPUT_FILE = "abuauf_branches_input.csv";
const OUTPUT_FILE = "abuauf_branches_output.csv";

// تأمين النص داخل CSV
function escapeCSV(value = "") {
  const v = String(value ?? "");
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

// تأخير بسيط بين الطلبات لتفادي محدوديات السرعة
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeBranch(branchName, city) {
  if (!API_KEY) {
    throw new Error("❌ لا يوجد API KEY في المتغير VITE_GOOGLE_MAPS_API_KEY داخل ملف .env");
  }

  const query = `${branchName} ${city} Egypt`;
  const url =
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
    encodeURIComponent(query) +
    `&key=${API_KEY}`;

  console.log(`🔎 Geocoding: ${query}`);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`HTTP Error for "${query}": ${res.status}`);
    return null;
  }

  const data = await res.json();

  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    console.error(`❌ No result for "${query}" — status: ${data.status}`);
    return null;
  }

  const result = data.results[0];
  const location = result.geometry.location;

  return {
    formatted_address: result.formatted_address || "",
    lat: location.lat,
    lng: location.lng,
    place_id: result.place_id || "",
  };
}

async function main() {
  try {
    // 1) قراءة ملف الإدخال
    const raw = await fs.readFile(INPUT_FILE, "utf8");
    const lines = raw.trim().split(/\r?\n/);

    // إزالة الهيدر
    const header = lines.shift();
    console.log(`📂 Loaded ${lines.length} branches from ${INPUT_FILE}`);

    const branches = lines
      .map((line) => {
        if (!line.trim()) return null;
        const [branch_name, city] = line.split(",");
        if (!branch_name) return null;
        return {
          branch_name: branch_name.trim(),
          city: (city || "").trim(),
        };
      })
      .filter(Boolean);

    const results = [];

    // 2) عمل Geocoding لكل فرع
    for (const branch of branches) {
      const geo = await geocodeBranch(branch.branch_name, branch.city);
      if (geo) {
        results.push({
          branch_name: branch.branch_name,
          city: branch.city,
          formatted_address: geo.formatted_address,
          lat: geo.lat,
          lng: geo.lng,
          place_id: geo.place_id,
        });
      } else {
        // في حالة عدم وجود نتيجة نترك الحقول فارغة
        results.push({
          branch_name: branch.branch_name,
          city: branch.city,
          formatted_address: "",
          lat: "",
          lng: "",
          place_id: "",
        });
      }

      // تأخير 200ms بين الطلبات
      await sleep(200);
    }

    // 3) كتابة ملف الإخراج
    const outputHeader =
      "branch_name,city,formatted_address,lat,lng,place_id\n";
    const outputBody = results
      .map((r) =>
        [
          escapeCSV(r.branch_name),
          escapeCSV(r.city),
          escapeCSV(r.formatted_address),
          r.lat,
          r.lng,
          escapeCSV(r.place_id),
        ].join(",")
      )
      .join("\n");

    await fs.writeFile(OUTPUT_FILE, outputHeader + outputBody, "utf8");
    console.log(`✅ DONE: saved ${results.length} rows to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error("FATAL ERROR:", err);
  }
}

main();
