const fs = require("fs");
const path = require("path");
const axios = require("axios");

const INPUT = path.resolve(
  __dirname,
  "../src/shared/assets/korea_districts.json"
);
const OUT = path.resolve(
  __dirname,
  "../src/shared/assets/korea_districts_with_coords.json"
);
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(query) {
  try {
    const res = await axios.get(GEOCODING_API_URL, {
      params: { name: query, count: 1, language: "ko", format: "json" },
    });
    if (res.data && res.data.results && res.data.results.length > 0) {
      const r = res.data.results[0];
      return {
        lat: r.latitude,
        lon: r.longitude,
        name: r.name,
        source: "open-meteo",
      };
    }
  } catch (e) {
    console.error("geocode error", query, e && e.message);
  }
  return null;
}

async function main() {
  const items = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  const unique = Array.from(new Set(items));
  const out = {};

  console.log("Total districts:", unique.length);

  for (let i = 0; i < unique.length; i++) {
    const district = unique[i];
    const q1 = district.replace(/-/g, " ");
    const parts = district
      .split("-")
      .map((p) => p.trim())
      .filter(Boolean);
    const q2 = parts.slice().reverse().join(" ");
    let coords = await geocode(q1);
    if (!coords && parts.length > 1) coords = await geocode(q2);

    if (coords) {
      out[district] = coords;
    }

    if ((i + 1) % 20 === 0) console.log(`Processed ${i + 1}/${unique.length}`);
    await sleep(250); // rate limit
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
  console.log("Wrote", OUT, "entries:", Object.keys(out).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
