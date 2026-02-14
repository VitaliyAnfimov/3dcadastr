export async function fetchOsmBuildingsByBbox({ west, south, east, north, limit = 800 }) {
  const overpassUrl = "https://overpass-api.de/api/interpreter";

  const query =
    "[out:json][timeout:25];" +
    "(" +
    "way[\"building\"](" + south + "," + west + "," + north + "," + east + ");" +
    "relation[\"building\"](" + south + "," + west + "," + north + "," + east + ");" +
    ");" +
    "out tags geom;";

  const res = await fetch(overpassUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: query
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("Overpass error " + res.status + ": " + text.slice(0, 180));
  }

  const json = await res.json();
  const elements = Array.isArray(json.elements) ? json.elements.slice(0, limit) : [];

  return elements
    .map((el) => {
      const geom = el.geometry;
      if (!Array.isArray(geom) || geom.length < 4) return null;

      const coords = geom.map(function (p) {
        return [p.lon, p.lat];
      });

      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);

      let sumLon = 0;
      let sumLat = 0;

      for (let i = 0; i < coords.length; i++) {
        sumLon += coords[i][0];
        sumLat += coords[i][1];
      }

      const centroidLon = sumLon / coords.length;
      const centroidLat = sumLat / coords.length;

      const tags = el.tags || {};
      const levels = parseInt(tags["building:levels"] || "", 10);
      const heightRaw = parseFloat((tags["height"] || "").toString().replace("m", ""));

      let heightM = null;
      if (!isNaN(heightRaw)) {
        heightM = heightRaw;
      } else if (!isNaN(levels)) {
        heightM = levels * 3.0;
      }

      return {
        osmType: el.type,
        osmId: el.type + "/" + el.id,
        name: tags["name"] || null,
        levels: !isNaN(levels) ? levels : null,
        heightM: heightM,
        footprintGeoJson: { type: "Polygon", coordinates: [coords] },
        centroidLon: centroidLon,
        centroidLat: centroidLat
      };
    })
    .filter(Boolean);
}
