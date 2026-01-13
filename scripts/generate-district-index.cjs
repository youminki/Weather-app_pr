const fs = require("fs");
const path = require("path");

const INPUT = path.resolve(
  __dirname,
  "../src/shared/assets/korea_districts.json"
);
const OUT = path.resolve(
  __dirname,
  "../src/shared/assets/korea_districts_index.json"
);

function normalize(s) {
  return s.replace(/[-,]/g, " ").toLowerCase().trim();
}

function tokensOf(s) {
  return Array.from(new Set(normalize(s).split(/\s+/).filter(Boolean)));
}

function main() {
  const items = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  const index = Object.create(null);

  for (const district of items) {
    const tokens = tokensOf(district);
    for (const t of tokens) {
      if (!index[t]) index[t] = [];
      if (index[t].length < 500) index[t].push(district); // cap size per token
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(index, null, 2), "utf8");
  console.log("Wrote index to", OUT);
}

main();
