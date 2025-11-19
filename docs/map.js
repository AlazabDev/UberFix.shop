// UberFix – Abu Auf Branches Map (GitHub Pages)

const MAP_ID = "b41c60a3f8e58bdb72351e8f"; 
const DEFAULT_CENTER = { lat: 30.0444, lng: 31.2357 };
const DEFAULT_ZOOM = 6;
const DEFAULT_ICON = "https://al-azab.co/img/beachpin.png";

// ---------------------------
// CSV LOADER
// ---------------------------
async function loadBranches() {
  const response = await fetch("src/data/branch_locations.csv");

  if (!response.ok) {
    throw new Error("Cannot load branch_locations.csv");
  }

  const text = await response.text();
  const lines = text.trim().split("\n");

  const header = lines.shift().split(",");

  const idx = {
    id: header.indexOf("id"),
    name: header.indexOf("branch"),
    type: header.indexOf("branch_type"),
    address: header.indexOf("address"),
    url: header.indexOf("link"),
    icon: header.indexOf("icon"),
    lat: header.indexOf("latitude"),
    lng: header.indexOf("longitude")
  };

  const branches = [];

  for (const line of lines) {
    const cols = line.split(",");

    const lat = parseFloat(cols[idx.lat]);
    const lng = parseFloat(cols[idx.lng]);

    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

    branches.push({
      id: cols[idx.id],
      name: cols[idx.name],
      type: cols[idx.type],
      address: cols[idx.address],
      url: cols[idx.url],
      icon: cols[idx.icon],
      lat,
      lng
    });
  }

  return branches;
}

let map;
let markers = [];
let infoWindow;

// ---------------------------
// INIT MAP
// ---------------------------
async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    mapId: MAP_ID
  });

  infoWindow = new google.maps.InfoWindow();

  const branches = await loadBranches();
  const bounds = new google.maps.LatLngBounds();

  branches.forEach(branch => {
    const position = { lat: branch.lat, lng: branch.lng };
    const iconUrl = branch.icon?.trim() || DEFAULT_ICON;

    const marker = new google.maps.Marker({
      position,
      map,
      title: branch.name,
      icon: {
        url: iconUrl,
        scaledSize: new google.maps.Size(42, 42),
        anchor: new google.maps.Point(21, 42)
      }
    });

    marker.addListener("click", () => {
      infoWindow.setContent(`
        <div style="font-size:13px;max-width:220px;">
          <strong>${branch.name}</strong><br>
          ${branch.address}<br>
          <b>Type:</b> ${branch.type}<br>
          ${branch.url ? `<a href="${branch.url}" target="_blank">Open</a>` : ""}
        </div>
      `);
      infoWindow.open(map, marker);
    });

    markers.push(marker);
    bounds.extend(position);
  });

  map.fitBounds(bounds);
}

// REQUIRED FOR CALLBACK
window.initMap = initMap;
